import React, { useState } from 'react';
import { AudienceQuestion, LessonVariation, PillarTopic } from '../types';
import { Users, ArrowLeft, ArrowRight, CheckSquare, Square } from 'lucide-react';

interface Props {
  pillar: PillarTopic;
  variation: LessonVariation;
  questions: AudienceQuestion[];
  onGenerateAnswers: (selectedQuestions: AudienceQuestion[]) => void;
  onBack: () => void;
  isLoading: boolean;
}

export const StepQuestions: React.FC<Props> = ({ pillar, variation, questions, onGenerateAnswers, onBack, isLoading }) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const toggleSelection = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else {
      if (selectedIndices.length < 5) {
        setSelectedIndices([...selectedIndices, index]);
      }
    }
  };

  const handleNext = () => {
    if (selectedIndices.length === 0) return;
    const selectedQuestions = selectedIndices.map(i => questions[i]);
    onGenerateAnswers(selectedQuestions);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors font-medium text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Variations
      </button>

      <div className="mb-10">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Users className="w-4 h-4" /> Step 3: Audience Voice
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            The Voice of the Customer
          </h2>
          <p className="text-slate-600 text-lg">
            For your lesson <span className="font-semibold text-slate-800">"{variation.title}"</span>, 
            here are 25 specific questions. Select up to 5 critical questions to generate detailed, researched answers for.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-500">Processing...</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-grow bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">Select Questions to Answer ({selectedIndices.length}/5)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-slate-100">
                {/* Informational Column */}
                <div className="p-4">
                    <h4 className="text-sm font-bold text-blue-600 mb-4 uppercase tracking-wider">Informational</h4>
                    <div className="space-y-2">
                        {questions.filter(q => q.intent.toLowerCase().includes('info')).map((q, i) => {
                            const originalIndex = questions.indexOf(q);
                            const isSelected = selectedIndices.includes(originalIndex);
                            return (
                                <div 
                                    key={i} 
                                    onClick={() => toggleSelection(originalIndex)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${isSelected ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                                >
                                    {isSelected ? <CheckSquare className="w-5 h-5 text-blue-600 flex-shrink-0" /> : <Square className="w-5 h-5 text-slate-300 flex-shrink-0" />}
                                    <span className={`text-sm ${isSelected ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>{q.question}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Commercial/Transactional Column */}
                <div className="p-4">
                    <h4 className="text-sm font-bold text-emerald-600 mb-4 uppercase tracking-wider">Actionable</h4>
                    <div className="space-y-2">
                        {questions.filter(q => !q.intent.toLowerCase().includes('info')).map((q, i) => {
                            const originalIndex = questions.indexOf(q);
                            const isSelected = selectedIndices.includes(originalIndex);
                            return (
                                <div 
                                    key={i} 
                                    onClick={() => toggleSelection(originalIndex)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${isSelected ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                                >
                                    {isSelected ? <CheckSquare className="w-5 h-5 text-emerald-600 flex-shrink-0" /> : <Square className="w-5 h-5 text-slate-300 flex-shrink-0" />}
                                    <span className={`text-sm ${isSelected ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>{q.question}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                </div>
            </div>

            {/* Context Sidebar */}
            <div className="lg:w-80 flex-shrink-0 flex flex-col gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Your Selection</h3>
                    {selectedIndices.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">Select questions from the list to generate detailed answers.</p>
                    ) : (
                        <ul className="space-y-2 mb-6">
                            {selectedIndices.map(idx => (
                                <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></span>
                                    {questions[idx].question}
                                </li>
                            ))}
                        </ul>
                    )}
                    
                    <button 
                        onClick={handleNext}
                        disabled={selectedIndices.length === 0}
                        className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                        Generate Answers <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-slate-400 mt-3 text-center">Using search grounding for accuracy.</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                   <div className="mb-4">
                      <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">Context</p>
                      <p className="font-medium text-slate-700 text-sm">{pillar.title}</p>
                      <p className="text-slate-500 text-xs mt-1">{variation.title}</p>
                   </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};