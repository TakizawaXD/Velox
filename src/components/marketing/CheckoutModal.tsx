import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ShieldCheck, CreditCard, Lock, 
  CheckCircle2, Zap, ArrowRight, Loader2,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    name: string;
    price: string;
    perks: string[];
  } | null;
}

type Step = 'summary' | 'payment' | 'processing' | 'success';

export function CheckoutModal({ isOpen, onClose, plan }: CheckoutModalProps) {
  const [step, setStep] = useState<Step>('summary');
  
  useEffect(() => {
    if (isOpen) {
      setStep('summary');
    }
  }, [isOpen]);

  if (!plan) return null;

  const handleNext = () => {
    if (step === 'summary') setStep('payment');
    else if (step === 'payment') {
      setStep('processing');
      setTimeout(() => setStep('success'), 2500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
               "relative w-full max-w-xl overflow-hidden rounded-[40px] border border-white/10 bg-[#0A0A0A] shadow-2xl transition-all duration-500",
               step === 'success' && "animate-rainbow-gradient ring-2 ring-primary/20"
            )}
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-textMuted hover:text-white transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="p-10 md:p-12">
              <AnimatePresence mode="wait">
                {step === 'summary' && (
                  <motion.div 
                    key="summary"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2">
                       <h3 className="text-xs font-black text-primary uppercase tracking-[0.4em]">Confirma tu Selección</h3>
                       <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Resumen del <span className="text-primary italic">Plan.</span></h2>
                    </div>

                    <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.05] space-y-6">
                       <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-textMuted uppercase tracking-widest">Suscripción Mensual</span>
                          <span className="text-primary font-black uppercase text-[10px] tracking-[0.2em] px-3 py-1 bg-primary/10 rounded-full">Automático</span>
                       </div>
                       <div className="flex items-baseline justify-between border-b border-white/10 pb-6">
                          <span className="text-2xl font-black text-white italic uppercase tracking-tight">{plan.name}</span>
                          <div className="text-right">
                             <div className="text-3xl font-black text-white tracking-tighter">${plan.price} <span className="text-sm font-bold opacity-40">COP</span></div>
                             <div className="text-[10px] font-bold text-textMuted uppercase tracking-widest">+ IVA (19%) incluido</div>
                          </div>
                       </div>
                       <div className="space-y-3">
                          {plan.perks.slice(0, 3).map(p => (
                            <div key={p} className="flex items-center gap-3 text-xs font-medium text-textMuted italic">
                               <CheckCircle2 size={14} className="text-primary" /> {p}
                            </div>
                          ))}
                       </div>
                    </div>

                    <Button onClick={handleNext} className="w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em]">
                       Continuar al Pago <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </motion.div>
                )}

                {step === 'payment' && (
                  <motion.div 
                    key="payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2">
                       <h3 className="text-xs font-black text-primary uppercase tracking-[0.4em]">Pasarela Segura</h3>
                       <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Detalles de <span className="text-primary italic">Pago.</span></h2>
                    </div>

                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-textMuted uppercase tracking-widest ml-1">Número de Tarjeta</label>
                          <div className="relative group">
                             <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors" size={18} />
                             <input 
                               type="text" 
                               placeholder="0000 0000 0000 0000"
                               className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white text-sm focus:border-primary/50 outline-none transition-all placeholder:text-white/10"
                             />
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-textMuted uppercase tracking-widest ml-1">Expiración</label>
                             <input 
                               type="text" 
                               placeholder="MM / YY"
                               className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white text-sm focus:border-primary/50 outline-none transition-all placeholder:text-white/10"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-textMuted uppercase tracking-widest ml-1">CVC / CVV</label>
                             <div className="relative">
                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
                                <input 
                                  type="password" 
                                  placeholder="•••"
                                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white text-sm focus:border-primary/50 outline-none transition-all placeholder:text-white/10"
                                />
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-4 p-5 border border-white/[0.05] rounded-2xl bg-white/[0.02]">
                       <ShieldCheck className="text-primary shrink-0" size={20} />
                       <p className="text-[10px] text-textMuted font-medium leading-relaxed uppercase tracking-widest">
                          Tus datos están protegidos por encriptación AES-256. <br />
                          Procesado oficialmente por <span className="text-white">Wompi (Bancolombia).</span>
                       </p>
                    </div>

                    <Button onClick={handleNext} className="w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] group">
                       Pagar ${plan.price} COP <Zap size={16} className="ml-2 group-hover:scale-125 transition-transform" />
                    </Button>
                  </motion.div>
                )}

                {step === 'processing' && (
                  <motion.div 
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-20 flex flex-col items-center justify-center text-center space-y-8"
                  >
                    <div className="relative">
                       <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                       <Loader2 className="animate-spin text-primary relative z-10" size={80} strokeWidth={1} />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Infraestructura Verificando...</h3>
                       <p className="text-sm text-textMuted font-medium uppercase tracking-[0.2em]">No cierres esta ventana.</p>
                    </div>
                  </motion.div>
                )}

                {step === 'success' && (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 flex flex-col items-center justify-center text-center space-y-10"
                  >
                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_50px_-10px_rgba(59,130,246,0.5)]">
                       <CheckCircle2 size={48} strokeWidth={1} />
                    </div>
                    <div className="space-y-4">
                       <h2 className="text-5xl font-black text-white tracking-tighter leading-none uppercase italic">¡Acceso <br /><span className="text-primary italic">Concedido!</span></h2>
                       <p className="text-sm text-textMuted font-medium uppercase tracking-widest max-w-xs mx-auto">
                          Tu suscripción <span className="text-white font-black">{plan.name}</span> ha sido activada correctamente.
                       </p>
                    </div>
                    
                    <div className="w-full p-6 rounded-3xl bg-white/5 border border-white/10 text-left space-y-3 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Globe size={100} />
                       </div>
                       <div className="text-[9px] font-black text-textMuted uppercase tracking-widest">ID Transacción: VX-PAY-983H28</div>
                       <div className="text-xs font-bold text-white uppercase tracking-widest">Bienvenido a la red Velox.</div>
                    </div>

                    <Button onClick={onClose} className="w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-white text-black hover:bg-white/90">
                       Ir a mi Dashboard
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
