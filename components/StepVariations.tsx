import React from 'react';
import { LessonVariation, PillarTopic } from '../types';
import { Layers, ChevronRight, ArrowLeft } from 'lucide-react';

interface Props {
  pillar: PillarTopic;
  variations: LessonVariation[];
  onSelect: (variation: LessonVariation) => void;
  onBack: () => void;
  isLoading: boolean;
}

export const StepVariations: React.FC<Props> = ({ pillar, variations, onSelect, onBack, isLoading }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors font-medium text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Pillars
      </button>

      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <Layers className="w-4 h-4" /> Step 2: Content Angles
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-3">
          Deep Dive: <span className="text-indigo-600">{pillar.title}</span>
        </h2>
        <p className="text-slate-600 text-lg">
          Excellent choice. Now, let's turn that broad pillar into a specific piece of content. 
          Here are 10 different angles we could take. Select the one you want to develop first.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500">Brainstorming variations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {variations.map((variation, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(variation)}
              className="group flex items-center text-left bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 p-5 rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex-shrink-0 mr-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-indigo-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-700 font-bold transition-colors">
                  {idx + 1}
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide bg-indigo-50 px-2 py-0.5 rounded">
                    {variation.angle}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 group-hover:text-indigo-800 mb-1">{variation.title}</h3>
                <p className="text-sm text-slate-500">{variation.outcome}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 flex-shrink-0 ml-4" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};