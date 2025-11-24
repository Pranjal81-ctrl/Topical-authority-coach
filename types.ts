export interface PillarTopic {
  title: string;
  description: string;
  rationale: string;
}

export interface LessonVariation {
  title: string;
  angle: string; // e.g., "Beginner Guide", "Case Study", "Mistake Avoidance"
  outcome: string;
}

export interface AudienceQuestion {
  question: string;
  intent: string; // e.g., "Informational", "Transactional", "Navigational"
}

export interface Answer {
  question: string;
  answer: string;
  sources: { title: string; uri: string }[];
  imageUrl?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export enum Step {
  INPUT = 0,
  PILLARS = 1,
  VARIATIONS = 2,
  QUESTIONS = 3,
  ANSWERS = 4,
  SUMMARY = 5,
}

export interface AppState {
  step: Step;
  coreTopic: string;
  selectedPillar: PillarTopic | null;
  selectedVariation: LessonVariation | null;
  
  generatedPillars: PillarTopic[];
  generatedVariations: LessonVariation[];
  generatedQuestions: AudienceQuestion[];
  generatedAnswers: Answer[];
  
  chatHistory: ChatMessage[];
  isChatLoading: boolean;
  
  isLoading: boolean;
  error: string | null;
}