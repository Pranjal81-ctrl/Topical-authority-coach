import React from 'react';
import { PillarTopic } from '../types';
import { CheckCircle2, LayoutGrid } from 'lucide-react';

interface Props {
  pillars: PillarTopic[];
  onSelect: (pillar: PillarTopic) => void;
  isLoading: boolean;
}

export const StepPillars: React.FC<Props> = ({ pillars, onSelect, isLoading }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
          <LayoutGrid className="w-4 h-4" /> Step 1: Broad Foundations
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-3">Select Your Strongest Pillar</h2>
        <p className="text-slate-600 text-lg">
          I've analyzed your core topic and found 30 potential authority pillars. 
          Which one resonates most as a starting point for your first content cluster?
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500">Generating your curriculum...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(pillar)}
              className="group text-left bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 p-6 rounded-xl transition-all shadow-sm hover:shadow-md relative flex flex-col h-full"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded">#{idx + 1}</span>
                <CheckCircle2 className="w-5 h-5 text-slate-200 group-hover:text-blue-500 transition-colors" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-blue-700">{pillar.title}</h3>
              <p className="text-sm text-slate-600 mb-4 flex-grow">{pillar.description}</p>
              <div className="pt-4 border-t border-slate-100 mt-auto">
                <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-1">Coach's Rationale</p>
                <p className="text-xs text-slate-500 italic">"{pillar.rationale}"</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};