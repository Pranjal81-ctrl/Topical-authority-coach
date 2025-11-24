import React, { useState } from 'react';
import { StepInput } from './components/StepInput';
import { StepPillars } from './components/StepPillars';
import { StepVariations } from './components/StepVariations';
import { StepQuestions } from './components/StepQuestions';
import { StepAnswers } from './components/StepAnswers';
import { Summary } from './components/Summary';
import { AppState, Step, PillarTopic, LessonVariation, AudienceQuestion } from './types';
import * as api from './services/geminiService';
import { AlertCircle } from 'lucide-react';

const INITIAL_STATE: AppState = {
  step: Step.INPUT,
  coreTopic: '',
  selectedPillar: null,
  selectedVariation: null,
  generatedPillars: [],
  generatedVariations: [],
  generatedQuestions: [],
  generatedAnswers: [],
  chatHistory: [],
  isChatLoading: false,
  isLoading: false,
  error: null,
};

export default function App() {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  const handleStart = async (topic: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, coreTopic: topic }));
    try {
      const pillars = await api.generatePillars(topic);
      setState(prev => ({
        ...prev,
        step: Step.PILLARS,
        generatedPillars: pillars,
        isLoading: false
      }));
    } catch (err) {
      setState(prev => ({ ...prev, isLoading: false, error: "Failed to generate pillars. Please try again." }));
    }
  };

  const handleSelectPillar = async (pillar: PillarTopic) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, selectedPillar: pillar }));
    try {
      const variations = await api.generateVariations(state.coreTopic, pillar);
      setState(prev => ({
        ...prev,
        step: Step.VARIATIONS,
        generatedVariations: variations,
        isLoading: false
      }));
    } catch (err) {
      setState(prev => ({ ...prev, isLoading: false, error: "Failed to generate variations. Please try again." }));
    }
  };

  const handleSelectVariation = async (variation: LessonVariation) => {
    if (!state.selectedPillar) return;
    setState(prev => ({ ...prev, isLoading: true, error: null, selectedVariation: variation }));
    try {
      const questions = await api.generateQuestions(state.coreTopic, state.selectedPillar, variation);
      setState(prev => ({
        ...prev,
        step: Step.QUESTIONS,
        generatedQuestions: questions,
        isLoading: false
      }));
    } catch (err) {
      setState(prev => ({ ...prev, isLoading: false, error: "Failed to generate questions. Please try again." }));
    }
  };

  const handleGenerateAnswers = async (selectedQuestions: AudienceQuestion[]) => {
    if (!state.selectedPillar || !state.selectedVariation) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
        const context = `Topic: ${state.coreTopic}, Pillar: ${state.selectedPillar.title}, Variation: ${state.selectedVariation.title}`;
        
        const answerPromises = selectedQuestions.map(q => 
            api.generateDetailedAnswer(q.question, context)
        );
        
        const answers = await Promise.all(answerPromises);
        
        setState(prev => ({
            ...prev,
            step: Step.ANSWERS,
            generatedAnswers: answers,
            isLoading: false
        }));
    } catch (err) {
        console.error(err);
        setState(prev => ({ ...prev, isLoading: false, error: "Failed to generate answers. Please try selecting fewer questions." }));
    }
  };

  const handleSendChat = async (message: string) => {
    if (!state.selectedPillar || !state.selectedVariation) return;
    
    // Optimistic update
    const newUserMessage = { role: 'user' as const, content: message };
    setState(prev => ({
        ...prev,
        chatHistory: [...prev.chatHistory, newUserMessage],
        isChatLoading: true
    }));

    try {
        const responseText = await api.generateChatResponse(
            state.chatHistory, // Pass history before the new message
            message,
            {
                coreTopic: state.coreTopic,
                pillar: state.selectedPillar,
                variation: state.selectedVariation,
                answers: state.generatedAnswers
            }
        );

        setState(prev => ({
            ...prev,
            chatHistory: [...prev.chatHistory, { role: 'model', content: responseText }],
            isChatLoading: false
        }));
    } catch (err) {
        setState(prev => ({ 
            ...prev, 
            isChatLoading: false, 
            // Optional: handle chat error specifically or just leave the user message hanging?
            // For now, let's append an error message from the 'model' to indicate failure elegantly
            chatHistory: [...prev.chatHistory, { role: 'model', content: "I'm sorry, I'm having trouble connecting right now. Please try again." }] 
        }));
    }
  };

  const handleFinish = () => {
    setState(prev => ({ ...prev, step: Step.SUMMARY }));
  };

  const handleBack = () => {
    setState(prev => {
      const newStep = Math.max(0, prev.step - 1);
      return { ...prev, step: newStep, error: null };
    });
  };
  
  const handleReset = () => {
      setState(INITIAL_STATE);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">TC</div>
                <span className="font-bold text-slate-800">Topical Authority Coach</span>
            </div>
            {state.step > Step.INPUT && (
                <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                    <span className={state.step === Step.PILLARS ? "text-blue-600 font-bold" : ""}>1. Pillars</span>
                    <span>→</span>
                    <span className={state.step === Step.VARIATIONS ? "text-blue-600 font-bold" : ""}>2. Variations</span>
                    <span>→</span>
                    <span className={state.step === Step.QUESTIONS ? "text-blue-600 font-bold" : ""}>3. Questions</span>
                    <span>→</span>
                    <span className={state.step === Step.ANSWERS ? "text-blue-600 font-bold" : ""}>4. Answers</span>
                </div>
            )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {state.error && (
            <div className="max-w-xl mx-auto mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {state.error}
            </div>
        )}

        {state.step === Step.INPUT && (
          <StepInput onStart={handleStart} isLoading={state.isLoading} />
        )}

        {state.step === Step.PILLARS && (
          <StepPillars 
            pillars={state.generatedPillars} 
            onSelect={handleSelectPillar} 
            isLoading={state.isLoading} 
          />
        )}

        {state.step === Step.VARIATIONS && state.selectedPillar && (
          <StepVariations 
            pillar={state.selectedPillar} 
            variations={state.generatedVariations} 
            onSelect={handleSelectVariation} 
            onBack={handleBack}
            isLoading={state.isLoading}
          />
        )}

        {state.step === Step.QUESTIONS && state.selectedPillar && state.selectedVariation && (
          <StepQuestions 
            pillar={state.selectedPillar}
            variation={state.selectedVariation}
            questions={state.generatedQuestions}
            onGenerateAnswers={handleGenerateAnswers}
            onBack={handleBack}
            isLoading={state.isLoading}
          />
        )}
        
        {state.step === Step.ANSWERS && (
            <StepAnswers 
                answers={state.generatedAnswers}
                onFinish={handleFinish}
                onBack={handleBack}
                isLoading={state.isLoading}
                chatHistory={state.chatHistory}
                onSendChat={handleSendChat}
                isChatLoading={state.isChatLoading}
            />
        )}

        {state.step === Step.SUMMARY && (
          <Summary state={state} onReset={handleReset} />
        )}
      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm">
        <p>© 2024 Topical Authority Coach • Powered by Google Gemini</p>
      </footer>
    </div>
  );
}