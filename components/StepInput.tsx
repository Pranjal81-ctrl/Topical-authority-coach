import React, { useState } from 'react';
import { Target, ArrowRight } from 'lucide-react';

interface Props {
  onStart: (topic: string) => void;
  isLoading: boolean;
}

export const StepInput: React.FC<Props> = ({ onStart, isLoading }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onStart(topic);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full text-center">
        <div className="bg-blue-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Target className="w-10 h-10 text-blue-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-3">
          Topical Authority Coach
        </h1>
        <p className="text-slate-500 mb-8 text-lg">
          Hi! I'm here to help you build a world-class content strategy. 
          To get started, what is the single <span className="font-semibold text-blue-600">Core Topic</span> you want to own?
        </p>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Sustainable Gardening, SaaS Sales, Python for Data Science..."
              className="w-full px-6 py-4 text-lg border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!topic.trim() || isLoading}
              className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? 'Thinking...' : <>Start <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </form>
        
        <div className="mt-8 grid grid-cols-4 gap-4 text-xs text-slate-400">
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-slate-600">Step 1</span>
            Generate Pillars
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-slate-600">Step 2</span>
            Create Variations
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-slate-600">Step 3</span>
            Find Questions
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-slate-600">Step 4</span>
            Get Answers
          </div>
        </div>
      </div>
    </div>
  );
};