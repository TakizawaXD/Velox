import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, X, Send, Bot, Sparkles, TrendingUp, 
  MessageSquare, Loader2, Minimize2, Maximize2 
} from 'lucide-react';
import { chatWithBrain, getLogisticsInsight } from '@/lib/ai';
import { Card } from '@/components/ui/Card';

interface AIAssistantProps {
  operationalData: any;
}

export function AIBrainDrawer({ operationalData }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !insights) {
      loadInitialInsights();
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen, messages, insights]);

  const loadInitialInsights = async () => {
    setLoadingInsights(true);
    const text = await getLogisticsInsight(operationalData);
    setInsights(text);
    setLoadingInsights(false);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const historyForGemini = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: m.parts
    }));

    const responseText = await chatWithBrain(historyForGemini, input, operationalData);
    
    setMessages(prev => [...prev, { role: 'model', parts: [{ text: responseText }] }]);
    setIsTyping(false);
  };

  return (
    <>
      {/* Floating Sparkle Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-8 right-8 z-50 p-4 rounded-3xl bg-gradient-to-br from-primary via-accent to-primary animate-gradient-x shadow-neon-blue text-white group ${isOpen ? 'hidden' : 'flex'}`}
      >
        <div className="relative">
          <Zap size={28} className="fill-white" />
          <div className="absolute -top-1 -right-1">
            <Sparkles size={14} className="text-white animate-pulse" />
          </div>
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-[150px] group-hover:ml-3 transition-all duration-500 font-black whitespace-nowrap uppercase tracking-widest text-[10px]">
          Velox Brain (Alpha)
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
            />

            {/* AI Drawer Side Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 right-0 z-50 h-full bg-surface/90 backdrop-blur-2xl border-l border-white/5 shadow-2xl flex flex-col transition-all duration-300 ${
                isMinimized ? 'w-full lg:w-[100px]' : 'w-full lg:w-[450px]'
              }`}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary shadow-neon-blue text-white">
                    <Bot size={20} />
                  </div>
                  {!isMinimized && (
                    <div>
                      <h3 className="font-black text-text text-lg tracking-tight">Velox Brain</h3>
                      <p className="text-[10px] text-primary font-black uppercase tracking-widest flex items-center gap-1.5 leading-none">
                         <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" /> Analizando Rentabilidad
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 rounded-xl text-textMuted hover:bg-white/5 transition-all">
                    {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                  </button>
                  <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl text-textMuted hover:bg-danger/10 hover:text-danger transition-all">
                    <X size={18} />
                  </button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* Content Area */}
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    
                    {/* Insight Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-textMuted uppercase tracking-widest text-[11px] font-black">
                        <TrendingUp size={14} className="text-primary" /> Sugerencias de Negocio
                      </div>
                      <Card className="p-5 glass-panel border-primary/20 bg-primary/5 relative overflow-hidden group hover:border-primary/40 transition-all">
                        {loadingInsights ? (
                          <div className="flex items-center gap-3 text-textMuted py-4">
                            <Loader2 size={18} className="animate-spin text-primary" />
                            <span className="text-sm font-bold">Consumiendo telemetría...</span>
                          </div>
                        ) : (
                          <div className="prose prose-invert prose-sm max-w-none text-text leading-relaxed font-medium">
                            {insights || "Analizando flujo de caja y rutas activas..."}
                          </div>
                        )}
                        <Sparkles size={10} className="absolute top-2 right-2 text-primary opacity-40" />
                      </Card>
                    </div>

                    <div className="h-px bg-white/5" />

                    {/* Chat Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-textMuted uppercase tracking-widest text-[11px] font-black">
                        <MessageSquare size={14} className="text-amber-400" /> Consultas Estratégicas
                      </div>
                      
                      <div className="space-y-4">
                        {messages.length === 0 && (
                          <div className="bg-surfaceHover/30 rounded-2xl p-4 border border-white/5 text-xs text-textMuted/60 leading-relaxed italic">
                            ¿Cómo puedo mejorar el margen de mis entregas hoy en Bogotá?
                          </div>
                        )}
                        
                        {messages.map((m, i) => (
                          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-4 rounded-[24px] max-w-[85%] text-sm font-medium leading-relaxed ${
                              m.role === 'user' 
                              ? 'bg-primary text-white shadow-neon-blue rounded-tr-none' 
                              : 'bg-surfaceHover border border-white/5 text-text rounded-tl-none'
                            }`}>
                              {m.parts[0].text}
                            </div>
                          </div>
                        ))}
                        
                        {isTyping && (
                          <div className="flex justify-start">
                             <div className="p-4 rounded-[24px] bg-surfaceHover border border-white/5 text-text rounded-tl-none flex items-center gap-2">
                               <span className="w-1.5 h-1.5 bg-textMuted rounded-full animate-bounce [animation-delay:-0.3s]" />
                               <span className="w-1.5 h-1.5 bg-textMuted rounded-full animate-bounce [animation-delay:-0.15s]" />
                               <span className="w-1.5 h-1.5 bg-textMuted rounded-full animate-bounce" />
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Input Footer */}
                  <div className="p-6 border-t border-white/5 bg-surface">
                    <form onSubmit={handleSendMessage} className="relative">
                      <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Preguntar al Director de Velox AI..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm text-text placeholder:text-textMuted/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all shadow-xl"
                      />
                      <button 
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-primary text-white shadow-neon-blue hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                      >
                        <Send size={18} />
                      </button>
                    </form>
                    <p className="text-[9px] text-textMuted/60 mt-3 text-center uppercase font-black tracking-[0.2em]">
                      Impulsado por Google Gemini Logística v1.5
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
