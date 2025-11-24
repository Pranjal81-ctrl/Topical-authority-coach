import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PillarTopic, LessonVariation, AudienceQuestion, Answer, ChatMessage } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-2.5-flash";
const IMAGE_MODEL_NAME = "gemini-2.5-flash-image";

const pillarSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "A catchy, clear title for the pillar topic." },
      description: { type: Type.STRING, description: "A brief 1-sentence description of what this pillar covers." },
      rationale: { type: Type.STRING, description: "Why this builds authority for the core topic." },
    },
    required: ["title", "description", "rationale"],
  },
};

const variationSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The specific title of the lesson or content piece." },
      angle: { type: Type.STRING, description: "The strategic angle (e.g., 'How-to', 'Mistake', 'Case Study')." },
      outcome: { type: Type.STRING, description: "What the user achieves or learns." },
    },
    required: ["title", "angle", "outcome"],
  },
};

const questionSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING, description: "The exact question a user would search for." },
      intent: { type: Type.STRING, description: "Search intent: e.g., Informational, Commercial, Transactional." },
    },
    required: ["question", "intent"],
  },
};

export const generatePillars = async (coreTopic: string): Promise<PillarTopic[]> => {
  const prompt = `
    Act as a world-class content strategist and SEO expert. 
    I want to build topical authority on the core topic: "${coreTopic}".
    
    Please generate exactly 30 distinct, broad "Pillar Topics" that would serve as the foundation for a comprehensive course or content cluster.
    These should cover the breadth of the subject. 
    Make them distinct from each other.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: pillarSchema,
      temperature: 0.7,
    },
  });

  if (response.text) {
    return JSON.parse(response.text) as PillarTopic[];
  }
  throw new Error("Failed to generate pillars");
};

export const generateVariations = async (coreTopic: string, pillar: PillarTopic): Promise<LessonVariation[]> => {
  const prompt = `
    Context: Building authority on "${coreTopic}".
    Selected Pillar: "${pillar.title}" (${pillar.description}).
    
    Generate exactly 10 specific "Lesson Variations" or content angles for this pillar.
    Vary the format/angle (e.g., specific how-to, common mistakes, tool reviews, case studies, theoretical deep dives).
    These should be actionable content pieces.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: variationSchema,
      temperature: 0.7,
    },
  });

  if (response.text) {
    return JSON.parse(response.text) as LessonVariation[];
  }
  throw new Error("Failed to generate variations");
};

export const generateQuestions = async (coreTopic: string, pillar: PillarTopic, variation: LessonVariation): Promise<AudienceQuestion[]> => {
  const prompt = `
    Context: Building authority on "${coreTopic}".
    Pillar: "${pillar.title}".
    Specific Lesson/Content Piece: "${variation.title}" (Angle: ${variation.angle}).
    
    Generate exactly 25 highly relevant "Audience Questions" that real people would type into Google or ask a mentor regarding this specific lesson.
    Focus on pain points, curiosities, and specific implementation details.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: questionSchema,
      temperature: 0.7,
    },
  });

  if (response.text) {
    return JSON.parse(response.text) as AudienceQuestion[];
  }
  throw new Error("Failed to generate questions");
};

const generateEducationalImage = async (question: string, context: string): Promise<string | undefined> => {
  const prompt = `
    Create a simple, modern, flat-vector style educational illustration that conceptually explains this question: "${question}".
    Context: ${context}.
    Style: Minimalist, clean lines, professional. 
    Color Palette: Blues, Slate, Soft Purple, White background.
    No text inside the image.
  `;

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL_NAME,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
            aspectRatio: "16:9",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (e) {
    console.error("Failed to generate image for question:", question, e);
    // Fail silently for images, we just won't show one
    return undefined;
  }
  return undefined;
};

export const generateDetailedAnswer = async (question: string, context: string): Promise<Answer> => {
  const prompt = `
    Context: ${context}
    
    Please provide a detailed, authoritative answer to this specific question: "${question}".
    Use Google Search to find relevant, up-to-date information, examples, or data points to support the answer.
    The answer should be instructional and helpful.
  `;

  // Run text generation (with search) and image generation in parallel
  const [textResponse, imageUrl] = await Promise.all([
    ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    }),
    generateEducationalImage(question, context)
  ]);

  const text = textResponse.text || "No answer generated.";
  
  // Extract grounding chunks for sources
  const chunks = textResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  // Map to simple source objects and deduplicate by URI
  const sourcesMap = new Map<string, { title: string; uri: string }>();
  
  chunks.forEach((chunk: any) => {
    if (chunk.web) {
      sourcesMap.set(chunk.web.uri, { title: chunk.web.title, uri: chunk.web.uri });
    }
  });

  return {
    question,
    answer: text,
    sources: Array.from(sourcesMap.values()),
    imageUrl,
  };
};

export const generateChatResponse = async (
  history: ChatMessage[], 
  newMessage: string, 
  context: { coreTopic: string, pillar: PillarTopic, variation: LessonVariation, answers: Answer[] }
): Promise<string> => {
  
  // Construct a focused system instruction
  const systemInstruction = `You are the Topical Authority Coach. 
  You are helping a user refine a content strategy.
  
  Current Strategy Context:
  - Core Topic: "${context.coreTopic}"
  - Pillar: "${context.pillar.title}"
  - Lesson Variation: "${context.variation.title}"
  
  The user has just generated detailed answers for the following questions:
  ${context.answers.map(a => `- Q: ${a.question}\n  A: (Excerpt) ${a.answer.substring(0, 100)}...`).join('\n')}
  
  Your goal is to clarify doubts, expand on specific points, or provide implementation advice based on the content generated so far.
  Be helpful, concise, and encouraging. If the user asks about something unrelated, politely steer them back to their content strategy.`;

  const chat = ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction,
    },
    history: history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    })),
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text || "I'm not sure how to answer that.";
};