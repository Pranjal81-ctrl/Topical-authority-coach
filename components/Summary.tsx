import React from 'react';
import { AppState } from '../types';
import { Download, RefreshCw, FileText } from 'lucide-react';

interface Props {
  state: AppState;
  onReset: () => void;
}

export const Summary: React.FC<Props> = ({ state, onReset }) => {
  
  const formatMarkdownForWord = (text: string) => {
    // Basic Markdown to HTML conversion for Word compatibility
    let html = text
      // Escape HTML characters first (simple version)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Bold **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic *text*
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // List items ( - item or * item)
      .replace(/^\s*[\-\*]\s+(.*)$/gm, '<li>$1</li>');

    // Wrap consecutive li elements in ul
    html = html.replace(/((<li>.*<\/li>\s*)+)/g, '<ul>$1</ul>');
    
    // Convert remaining newlines to breaks
    html = html.replace(/\n/g, '<br/>');
    
    return html;
  };

  const handleExport = () => {
    const timestamp = new Date().toLocaleDateString();
    
    // Construct HTML structure for Word
    // We use standard HTML4/CSS that Word interprets very well
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Topical Authority Strategy - ${state.coreTopic}</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #1e293b; max-width: 800px; margin: 0 auto; }
          h1 { color: #1e40af; font-size: 24pt; font-weight: bold; margin-bottom: 24px; text-align: center; border-bottom: 2px solid #1e40af; padding-bottom: 12px; }
          h2 { color: #1e3a8a; font-size: 16pt; font-weight: bold; margin-top: 32px; margin-bottom: 12px; background-color: #f1f5f9; padding: 8px; }
          h3 { color: #4f46e5; font-size: 13pt; font-weight: bold; margin-top: 24px; margin-bottom: 8px; }
          p { margin-bottom: 12px; }
          ul { margin-bottom: 12px; padding-left: 24px; }
          li { margin-bottom: 4px; }
          a { color: #2563eb; text-decoration: underline; }
          .meta-box { border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin-bottom: 24px; background-color: #f8fafc; }
          .label { font-size: 9pt; text-transform: uppercase; color: #64748b; font-weight: bold; letter-spacing: 0.5px; }
          .value { font-size: 12pt; font-weight: bold; color: #0f172a; margin-top: 4px; margin-bottom: 12px; }
          .rationale { font-style: italic; color: #475569; border-left: 3px solid #94a3b8; padding-left: 12px; margin-top: 8px; }
          .image-container { text-align: center; margin: 20px 0; border: 1px solid #e2e8f0; padding: 10px; }
          img { max-width: 100%; height: auto; }
          .source-link { font-size: 9pt; color: #64748b; }
          .footer { margin-top: 48px; border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 9pt; color: #94a3b8; }
        </style>
      </head>
      <body>
    `;

    const bodyContent = `
      <h1>Topical Authority Blueprint</h1>
      <p style="text-align: center; color: #64748b;">Generated on ${timestamp}</p>

      <h2>1. Core Strategy Foundation</h2>
      <div class="meta-box">
        <div class="label">Core Topic</div>
        <div class="value">${state.coreTopic}</div>
        
        <div class="label" style="margin-top: 16px;">Selected Pillar</div>
        <div class="value">${state.selectedPillar?.title}</div>
        <div class="rationale">${state.selectedPillar?.rationale}</div>
        <p style="margin-top: 8px;">${state.selectedPillar?.description}</p>
      </div>

      <h2>2. Content Piece Definition</h2>
      <div class="meta-box">
        <div class="label">Lesson Title</div>
        <div class="value">${state.selectedVariation?.title}</div>
        
        <div class="label" style="margin-top: 16px;">Strategic Angle</div>
        <div class="value">${state.selectedVariation?.angle}</div>
        
        <div class="label" style="margin-top: 16px;">Outcome</div>
        <p>${state.selectedVariation?.outcome}</p>
      </div>

      <h2>3. Detailed Answers & Research</h2>
      ${state.generatedAnswers.map((item, idx) => `
        <h3>${idx + 1}. ${item.question}</h3>
        ${item.imageUrl ? `
          <div class="image-container">
            <img src="${item.imageUrl}" width="600" alt="Illustration" />
            <p style="font-size: 9pt; color: #94a3b8;">Figure ${idx + 1}: Generated Concept Illustration</p>
          </div>
        ` : ''}
        <div>${formatMarkdownForWord(item.answer)}</div>
        ${item.sources.length > 0 ? `
          <p style="margin-top: 12px; font-size: 10pt;">
            <strong>References:</strong><br/>
            ${item.sources.map(s => `<a href="${s.uri}" class="source-link">${s.title}</a>`).join('<br/>')}
          </p>
        ` : ''}
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      `).join('')}

      <h2>4. Additional Audience Questions</h2>
      <ul>
        ${state.generatedQuestions
          .filter(q => !state.generatedAnswers.find(a => a.question === q.question))
          .map(q => `<li>${q.question} <em>(${q.intent})</em></li>`)
          .join('')}
      </ul>

      <div class="footer">
        Generated by Topical Authority Coach AI
      </div>
      </body>
      </html>
    `;

    const fullContent = header + bodyContent;
    
    // Create Blob as MS Word HTML
    const blob = new Blob([fullContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Strategy-${state.coreTopic.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-8 text-white text-center">
          <div className="inline-block p-3 bg-white/10 rounded-full mb-4">
            <FileText className="w-8 h-8 text-blue-300" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Strategy Complete!</h2>
          <p className="text-slate-300">Here is your demand-driven content blueprint.</p>
        </div>

        <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Core Foundation</h3>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <p className="text-lg font-bold text-slate-800">{state.coreTopic}</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Selected Pillar</h3>
                     <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="text-lg font-bold text-blue-900">{state.selectedPillar?.title}</p>
                        <p className="text-sm text-blue-700 mt-1">{state.selectedPillar?.rationale}</p>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">Content Piece</h3>
                <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded font-bold uppercase">{state.selectedVariation?.angle}</span>
                    </div>
                    <h4 className="text-2xl font-bold text-indigo-900 mb-2">{state.selectedVariation?.title}</h4>
                    <p className="text-indigo-800">{state.selectedVariation?.outcome}</p>
                </div>
            </div>
            
            {state.generatedAnswers.length > 0 && (
                <div>
                     <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-4">Researched Answers</h3>
                     <div className="space-y-4">
                        {state.generatedAnswers.map((item, i) => (
                            <div key={i} className="p-4 rounded-xl border border-purple-100 bg-purple-50">
                                <div className="flex flex-col md:flex-row gap-4">
                                    {item.imageUrl && (
                                        <div className="w-full md:w-48 flex-shrink-0">
                                            <img 
                                                src={item.imageUrl} 
                                                alt="Generated illustration" 
                                                className="w-full h-auto rounded-lg border border-purple-200"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-bold text-purple-900 mb-2">{item.question}</p>
                                        <p className="text-sm text-purple-800 line-clamp-3 mb-2">{item.answer}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {item.sources.slice(0, 3).map((s, idx) => (
                                                <a key={idx} href={s.uri} target="_blank" className="text-xs text-purple-600 hover:underline">{s.title}</a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            )}

            <div>
                <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-4">Other Questions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {state.generatedQuestions
                        .filter(q => !state.generatedAnswers.find(a => a.question === q.question))
                        .slice(0, 6).map((q, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold mt-0.5">
                                •
                            </span>
                            <p className="text-slate-700 text-sm">{q.question}</p>
                        </div>
                    ))}
                </div>
                <p className="text-center text-xs text-slate-400 mt-4 italic">Export to see all 25 questions and full answers</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-8 border-t border-slate-100">
                <button 
                    onClick={handleExport}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <Download className="w-5 h-5" /> Export to Word Doc
                </button>
                 <button 
                    onClick={onReset}
                    className="flex-1 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-600 font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-5 h-5" /> Start New Strategy
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};