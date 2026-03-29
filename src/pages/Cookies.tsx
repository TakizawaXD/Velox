import { motion } from 'framer-motion';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { ShieldCheck, Cookie, Info } from 'lucide-react';

export function Cookies() {
  return (
    <div className="bg-[#000] min-h-screen text-text selection:bg-primary/30 font-inter">
       <Navbar />
       <main className="pt-48 pb-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
             <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               className="mb-24 text-center md:text-left"
             >
                <div className="flex items-center gap-4 mb-8 justify-center md:justify-start">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20"><Cookie size={20} /></div>
                  <span className="text-xs font-black text-textMuted uppercase tracking-[0.5em] leading-none">Arquitectura de Tracking</span>
                </div>
                <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter mb-8 italic uppercase leading-[0.8] mb-12">
                   Cookies <br />
                   <span className="text-primary italic">Velox.</span>
                </h1>
                <p className="text-sm font-black text-textMuted uppercase tracking-widest opacity-60">Status: Operacional Marzo 2026</p>
             </motion.div>

             <div className="prose prose-invert prose-primary max-w-none space-y-16">
                <section className="space-y-8 p-12 rounded-[40px] bg-white/[0.02] border border-white/[0.05]">
                   <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
                      <div className="w-1.5 h-8 bg-primary rounded-full" /> 1. Gestión de Datos Efímeros
                   </h2>
                   <p className="text-xl text-textMuted leading-relaxed font-medium">
                      Velox utiliza cookies técnicas esenciales para mantener la integridad de la sesión del usuario y la precisión del rastreo en tiempo real. No utilizamos cookies de publicidad de terceros.
                   </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="p-10 rounded-[32px] bg-white/[0.04] border border-white/[0.05] space-y-4">
                      <div className="flex items-center gap-3 text-primary mb-4">
                         <ShieldCheck size={20} />
                         <h3 className="text-xl font-black text-white tracking-tight uppercase tracking-widest text-[10px]">Técnicas</h3>
                      </div>
                      <p className="text-sm text-textMuted font-medium leading-relaxed">
                         Esenciales para la autenticación en el dashboard y la persistencia de filtros logísticos complejos.
                      </p>
                   </div>
                   <div className="p-10 rounded-[32px] bg-white/[0.04] border border-white/[0.05] space-y-4">
                      <div className="flex items-center gap-3 text-primary mb-4">
                         <Info size={20} />
                         <h3 className="text-xl font-black text-white tracking-tight uppercase tracking-widest text-[10px]">Rendimiento</h3>
                      </div>
                      <p className="text-sm text-textMuted font-medium leading-relaxed">
                         Monitorean la latencia de carga para optimizar la respuesta de nuestros servidores globales.
                      </p>
                   </div>
                </div>

                <section className="mt-20 pt-20 border-t border-white/[0.08]">
                    <div className="p-10 rounded-[32px] bg-white/[0.02] border border-white/[0.05] text-center">
                       <p className="text-xs font-black text-textMuted uppercase tracking-[0.3em] leading-loose">
                          Control Total del Navegador <br />
                          Consultas Técnicas: <br />
                          <a href="mailto:andresmontalvo2222@gmail.com" className="text-primary hover:underline italic text-lg mt-4 block tracking-normal lowecase">andresmontalvo2222@gmail.com</a>
                       </p>
                    </div>
                </section>
             </div>
          </div>
       </main>
       <Footer />
    </div>
  );
}
