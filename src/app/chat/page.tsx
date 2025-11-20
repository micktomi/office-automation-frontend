'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  workflow_steps?: Array<{ step: number; tool: string; success: boolean }>;
  total_steps?: number;
}

const BackIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/workflows/chat', {
        message: input,
        conversation_history: messages.map(m => ({ role: m.role, content: m.content }))
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response,
        workflow_steps: response.data.workflow_steps,
        total_steps: response.data.total_steps
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error:', error);
      let errorMsg = 'Σφάλμα στην επικοινωνία με τον assistant.';
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (detail.includes('Calendar API')) {
          errorMsg = '⏳ Το Calendar API ενεργοποιείται ακόμα. Δοκίμασε σε λίγα λεπτά.';
        } else if (detail.includes('Drive API')) {
          errorMsg = '⏳ Το Drive API ενεργοποιείται ακόμα. Δοκίμασε σε λίγα λεπτά.';
        } else if (detail.includes('HttpError')) {
          errorMsg = '⚠️ Το Google API δεν είναι ακόμα διαθέσιμο. Περίμενε 2-3 λεπτά.';
        }
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMsg
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50">
          {/* Header */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Link 
                  href="/"
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200"
                >
                  <BackIcon className="w-6 h-6" />
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">🤖</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      AI Assistant
                    </h1>
                    <p className="text-sm text-slate-400">Gmail, Calendar & Drive Integration</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-slate-700/50 rounded-xl p-3 border border-slate-600/50">
                  <label htmlFor="email-selector" className="block text-xs font-medium text-slate-400 mb-1">Active Account</label>
                  <select id="email-selector" className="bg-transparent text-slate-200 text-sm focus:outline-none">
                    <option>mixalis@gmail.com</option>
                    <option>work@gmail.com</option>
                    <option>personal2@gmail.com</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 text-xs">
              <span className="bg-green-500/20 text-green-300 px-3 py-1.5 rounded-full border border-green-500/30 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Gmail Connected
              </span>
              <span className="bg-red-500/20 text-red-300 px-3 py-1.5 rounded-full border border-red-500/30 flex items-center gap-1">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                Calendar Connecting
              </span>
              <span className="bg-red-500/20 text-red-300 px-3 py-1.5 rounded-full border border-red-500/30 flex items-center gap-1">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                Drive Connecting
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[calc(100vh-280px)] overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center mt-20">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                <span className="text-3xl">👋</span>
              </div>
              <p className="text-xl font-semibold text-slate-200 mb-6">Γεια σου! Πώς μπορώ να βοηθήσω;</p>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
                  <h3 className="font-semibold text-green-400 mb-4 flex items-center gap-2">
                    🔥 Multi-step Workflows
                  </h3>
                  <div className="space-y-3 text-sm text-slate-300">
                    <button 
                      onClick={() => setInput("Διάβασε το τελευταίο email και δημιούργησε event")}
                      className="w-full bg-slate-700/30 hover:bg-slate-600/50 p-3 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      "Διάβασε το τελευταίο email και δημιούργησε event"
                    </button>
                    <button 
                      onClick={() => setInput("Βρες emails από John και draft replies")}
                      className="w-full bg-slate-700/30 hover:bg-slate-600/50 p-3 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      "Βρες emails από John και draft replies"
                    </button>
                    <button 
                      onClick={() => setInput("Οργάνωσε τα files μου στο Drive")}
                      className="w-full bg-slate-700/30 hover:bg-slate-600/50 p-3 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      "Οργάνωσε τα files μου στο Drive"
                    </button>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
                  <h3 className="font-semibold text-blue-400 mb-4 flex items-center gap-2">
                    📧 Simple Queries
                  </h3>
                  <div className="space-y-3 text-sm text-slate-300">
                    <button 
                      onClick={() => setInput("Δείξε μου τα emails μου")}
                      className="w-full bg-slate-700/30 hover:bg-slate-600/50 p-3 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      "Δείξε μου τα emails μου"
                    </button>
                    <button 
                      onClick={() => setInput("Ποια emails χρειάζονται reply;")}
                      className="w-full bg-slate-700/30 hover:bg-slate-600/50 p-3 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      "Ποια emails χρειάζονται reply;"
                    </button>
                    <button 
                      onClick={() => setInput("Τι meetings έχω σήμερα;")}
                      className="w-full bg-slate-700/30 hover:bg-slate-600/50 p-3 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      "Τι meetings έχω σήμερα;"
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                  : 'bg-slate-800/70 text-slate-200 border border-slate-700/50 backdrop-blur-sm'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                {msg.workflow_steps && msg.workflow_steps.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-600/50">
                    <div className="text-xs font-semibold mb-3 flex items-center gap-2">
                      🔄 Workflow Progress: {msg.total_steps} steps
                    </div>
                    <div className="space-y-2 text-xs">
                      {msg.workflow_steps.map((step, i) => (
                        <div key={i} className="flex items-center gap-3 bg-slate-700/30 p-2 rounded-lg">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                            step.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          }`}>
                            {step.success ? '✓' : '✗'}
                          </span>
                          <span>Step {step.step}: {step.tool}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800/70 rounded-2xl p-4 border border-slate-700/50 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-slate-400 text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-700/50 bg-slate-800/50 backdrop-blur-sm p-6">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Γράψε το μήνυμά σου..."
              className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-xl px-6 py-4 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-blue-500/25"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
