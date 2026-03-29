import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, Home, Search, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SEO } from '@/components/common/SEO';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#000] flex flex-col items-center justify-center p-6 text-center overflow-hidden relative font-inter">
      <SEO title="404 | Ruta No Encontrada" />

      {/* Hero 404 Graphic - Technical Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <div className="flex flex-col items-center mb-16">
          <div className="relative mb-12">
             <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/10 relative z-10">
                <Package size={100} strokeWidth={1} className="text-primary" />
             </div>
             <div className="absolute -top-6 -right-6 p-4 rounded-2xl bg-primary shadow-neon-blue z-20">
                <Search size={28} className="text-white" />
             </div>
             {/* Technical lines decoration */}
             <div className="absolute -left-12 top-1/2 w-24 h-px bg-white/5" />
             <div className="absolute -right-12 top-1/2 w-24 h-px bg-white/5" />
          </div>

          <h1 className="text-[120px] md:text-[200px] font-black text-white leading-none tracking-tighter italic opacity-20 select-none">
            404
          </h1>
          <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
               Ruta <span className="text-primary italic">Extraviada.</span>
            </h2>
          </div>
        </div>

        <div className="max-w-md mx-auto space-y-8">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-4 text-left">
             <AlertCircle className="text-primary shrink-0" size={24} />
             <p className="text-xs text-textMuted font-bold uppercase tracking-widest leading-relaxed">
                El despacho solicitado no ha sido localizado en nuestra red logística global. Status: Error de Enrutamiento 0x404.
             </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full sm:w-auto px-10 h-16 rounded-2xl border-white/5 bg-white/5 text-xs font-black uppercase tracking-widest hover:border-primary/50 transition-all"
            >
              <ArrowLeft size={16} className="mr-2" /> Re-Enrutar
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-10 h-16 rounded-2xl font-black text-xs uppercase tracking-widest shadow-neon-blue h-16"
            >
              <Home size={16} className="mr-2" /> Central de Comando
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Version Footer */}
      <div className="absolute bottom-12 flex flex-col items-center gap-4">
         <div className="text-[9px] font-black uppercase tracking-[0.5em] text-textMuted opacity-30 select-none">
            Velox Operating System · v4.0.0
         </div>
         <div className="w-1 h-12 bg-gradient-to-t from-primary/50 to-transparent rounded-full" />
      </div>

      {/* Technical Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
    </div>
  );
}
