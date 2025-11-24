import React, { useRef, useEffect, useState } from 'react';
import { Answer, ChatMessage } from '../types';
import { BookOpen, Check, ExternalLink, ArrowLeft, MessageSquare, Send, ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  answers: Answer[];
  onFinish: () => void;
  onBack: () => void;
  isLoading: boolean;
  chatHistory: ChatMessage[];
  onSendChat: (msg: string) => void;
  isChatLoading: boolean;
}

export const StepAnswers: React.FC<Props> = ({ 
    answers, 
    onFinish, 
    onBack, 
    isLoading, 
    chatHistory, 
    onSendChat, 
    isChatLoading 
}) => {
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isChatLoading]);

    const handleChatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (chatInput.trim() && !isChatLoading) {
            onSendChat(chatInput);
            setChatInput('');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <button 
                onClick={onBack}
                className="mb-6 flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors font-medium text-sm"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Questions
            </button>

            <div className="mb-10 text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    <BookOpen className="w-4 h-4" /> Step 4: Expert Answers
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-3">
                    Researched Responses
                </h2>
                <p className="text-slate-600 text-lg">
                    Here are detailed answers based on live search data. Use the chat on the right to clarify any details.
                </p>
            </div>

            {isLoading ? (
                <div className="text-center py-20">
                    <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-500">Researching answers and generating diagrams...</p>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Left Column: Answers */}
                    <div className="flex-1 space-y-8 w-full min-w-0">
                        {answers.map((item, idx) => (
                            <div key={idx} className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
                                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-start gap-3">
                                    <div className="bg-purple-100 text-purple-700 font-bold px-2.5 py-1 rounded text-sm mt-0.5">Q{idx + 1}</div>
                                    <h3 className="text-lg font-bold text-slate-800">{item.question}</h3>
                                </div>
                                <div className="p-6">
                                    {item.imageUrl && (
                                        <div className="mb-6 rounded-lg overflow-hidden border border-slate-100 shadow-sm">
                                            <img 
                                                src={item.imageUrl} 
                                                alt={`Illustration for ${item.question}`} 
                                                className="w-full h-auto object-cover max-h-80"
                                            />
                                            <div className="bg-slate-50 py-2 px-3 text-xs text-slate-400 flex items-center gap-1 border-t border-slate-100">
                                                <ImageIcon className="w-3 h-3" /> AI Generated Illustration
                                            </div>
                                        </div>
                                    )}
                                    <div className="prose prose-slate max-w-none text-slate-600">
                                        <ReactMarkdown>{item.answer}</ReactMarkdown>
                                    </div>
                                    
                                    {item.sources.length > 0 && (
                                        <div className="mt-6 pt-4 border-t border-slate-100">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Sources & References</p>
                                            <div className="flex flex-wrap gap-2">
                                                {item.sources.map((source, sIdx) => (
                                                    <a 
                                                        key={sIdx} 
                                                        href={source.uri} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 bg-slate-50 hover:bg-purple-50 text-slate-600 hover:text-purple-700 border border-slate-200 hover:border-purple-200 px-3 py-1.5 rounded-full text-xs transition-colors"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        {source.title || 'Source'}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        <div className="flex justify-center pt-4 pb-8">
                            <button 
                                onClick={onFinish}
                                className="bg-slate-900 hover:bg-slate-800 text-white py-4 px-8 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg text-lg"
                            >
                                <Check className="w-5 h-5" /> Complete Strategy
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Chat Window (Sticky on Desktop) */}
                    <div className="lg:w-96 w-full flex-shrink-0 lg:sticky lg:top-24">
                        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-[500px] lg:h-[600px]">
                            <div className="bg-slate-900 text-white p-4 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                <h3 className="font-bold">Coach Chat</h3>
                            </div>
                            
                            <div className="flex-grow p-4 overflow-y-auto bg-slate-50">
                                {chatHistory.length === 0 ? (
                                    <div className="text-center text-slate-400 mt-10 px-4">
                                        <p className="text-sm">Have doubts about the answers?</p>
                                        <p className="text-xs mt-2">Ask me to clarify, simplify, or expand on any point.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {chatHistory.map((msg, i) => (
                                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div 
                                                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                                                        msg.role === 'user' 
                                                        ? 'bg-blue-600 text-white rounded-br-none' 
                                                        : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none shadow-sm'
                                                    }`}
                                                >
                                                    {msg.role === 'model' ? (
                                                        <div className="prose prose-sm prose-slate max-w-none">
                                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                        </div>
                                                    ) : (
                                                        msg.content
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {isChatLoading && (
                                    <div className="flex justify-start mt-4">
                                        <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                                            <div className="flex gap-1.5">
                                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="p-3 bg-white border-t border-slate-100">
                                <form onSubmit={handleChatSubmit} className="relative">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Ask a follow-up question..."
                                        disabled={isChatLoading}
                                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
                                    />
                                    <button 
                                        type="submit" 
                                        disabled={!chatInput.trim() || isChatLoading}
                                        className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-300 text-white px-3 rounded-lg transition-colors flex items-center justify-center"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};