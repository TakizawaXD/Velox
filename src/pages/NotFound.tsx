import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      {/* Background purely decorative */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-accent/20 blur-[100px] rounded-full opacity-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <div className="relative mb-8 inline-block">
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              y: [0, -10, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 4,
              ease: "easeInOut"
            }}
            className="p-8 rounded-[32px] bg-surface border border-white/10 shadow-2xl relative z-10"
          >
            <Package size={80} className="text-primary" />
          </motion.div>
          <div className="absolute -right-4 -bottom-4 p-3 rounded-2xl bg-accent shadow-neon-blue animate-bounce">
            <Search size={24} className="text-white" />
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-text tracking-tighter mb-4">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-text mb-6">
          Ruta Extraviada en el Mapa
        </h2>
        <p className="text-textMuted max-w-md mx-auto mb-10 font-medium text-lg leading-relaxed">
          Parece que este despacho se ha desviado de su ruta. No te preocupes, el equipo de Velox te llevará de vuelta a la base.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl border-white/10 text-textMuted hover:text-text hover:bg-white/5 gap-2"
          >
            <ArrowLeft size={18} /> Volver Atrás
          </Button>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl shadow-neon-blue gap-2"
          >
            <Home size={18} /> Ir al Dashboard
          </Button>
        </div>
      </motion.div>

      <div className="mt-20 text-[10px] font-black uppercase tracking-[0.4em] text-textMuted/30 relative z-10">
        Velox Operating System · v3.4.0
      </div>
    </div>
  );
}
