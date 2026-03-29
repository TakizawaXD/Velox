import { motion } from 'framer-motion';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { FileText, Scale, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SEO } from '@/components/common/SEO';

export function Terms() {
  return (
    <div className="bg-[#000] min-h-screen text-text selection:bg-primary/30 font-inter">
       <SEO title="Términos" />
       <Navbar />
       <main className="pt-48 pb-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
             <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               className="mb-24 text-center md:text-left"
             >
                <div className="flex items-center gap-4 mb-8 justify-center md:justify-start">
                  <div className="p-3 rounded-2xl bg-white/[0.05] text-primary border border-white/[0.1]"><Scale size={20} /></div>
                  <span className="text-xs font-black text-textMuted uppercase tracking-[0.5em] leading-none">Documentación Técnica</span>
                </div>
                <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter mb-8 italic uppercase leading-[0.8] mb-12">
                   Términos <br />
                   <span className="text-primary italic">Velox.</span>
                </h1>
                <p className="text-sm font-black text-textMuted uppercase tracking-widest opacity-60">Status de Servicio: Oficial 2026</p>
             </motion.div>

             <div className="prose prose-invert prose-primary max-w-none space-y-16">
                <section className="space-y-8 p-12 rounded-[40px] bg-white/[0.02] border border-white/[0.05]">
                   <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
                      <FileText className="text-primary" /> 1. Acuerdo de Licencia (SaaS)
                   </h2>
                   <p className="text-xl text-textMuted leading-relaxed font-medium">
                      Velox es una plataforma de software como servicio (SaaS). Al activar su cuenta, usted adquiere una licencia técnica de uso limitada, no exclusiva y revocable para gestionar sus operaciones logísticas bajo nuestros protocolos de ingeniería.
                   </p>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="p-10 rounded-[32px] bg-white/[0.04] border border-white/[0.05] space-y-4">
                      <h3 className="text-xl font-black text-white tracking-tight">Responsabilidad</h3>
                      <p className="text-sm text-textMuted font-medium leading-relaxed">
                         Velox proporciona la infraestructura de rastreo y optimización, pero la gestión de los conductores y vehículos sigue siendo responsabilidad legal absoluta del Cliente.
                      </p>
                   </div>
                   <div className="p-10 rounded-[32px] bg-white/[0.04] border border-white/[0.05] space-y-4">
                      <h3 className="text-xl font-black text-white tracking-tight">Propiedad</h3>
                      <p className="text-sm text-textMuted font-medium leading-relaxed">
                         Toda la infraestructura de código, algoritmos de ruta y diseño visual son propiedad intelectual única de Velox Logística SAS bajo leyes internacionales.
                      </p>
                   </div>
                </section>

                <section className="mt-20 pt-20 border-t border-white/[0.08]">
                    <div className="p-12 rounded-[48px] bg-primary text-center">
                       <h2 className="text-4xl font-black text-white italic tracking-tighter mb-8">Consultas Legales.</h2>
                       <p className="text-xs font-black text-white uppercase tracking-[0.3em] leading-loose opacity-80 mb-10">
                          Departamento Técnico-Jurídico Velox
                       </p>
                       <Button asChild size="lg" className="rounded-2xl h-16 px-12 bg-white text-black font-black hover:bg-white/90 transition-all group">
                          <a href="mailto:andresmontalvo2222@gmail.com" className="flex items-center gap-2">
                             Contactar Legal <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                          </a>
                       </Button>
                    </div>
                </section>
             </div>
          </div>
       </main>
       <Footer />
    </div>
  );
}
