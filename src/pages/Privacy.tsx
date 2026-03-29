import { motion } from 'framer-motion';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { Lock } from 'lucide-react';

export function Privacy() {
  return (
    <div className="bg-[#000] min-h-screen text-text selection:bg-primary/30 font-inter">
       <Navbar />
       <main className="pt-48 pb-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
             <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               className="mb-24"
             >
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20"><Lock size={20} /></div>
                  <span className="text-xs font-black text-textMuted uppercase tracking-[0.4em] leading-none">Seguridad de Datos</span>
                </div>
                <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter mb-8 italic uppercase leading-[0.8]">
                   Privacidad <br />
                   <span className="text-primary italic">Velox.</span>
                </h1>
                <p className="text-sm font-black text-textMuted uppercase tracking-widest opacity-60">Última actualización: 29 de Marzo, 2026</p>
             </motion.div>

             <div className="prose prose-invert prose-primary max-w-none space-y-16">
                <section className="space-y-6">
                   <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
                      <div className="w-1.5 h-8 bg-primary rounded-full" /> 1. Información que Recopilamos
                   </h2>
                   <p className="text-xl text-textMuted leading-relaxed font-medium">
                      En Velox, la infraestructura de privacidad es nuestra prioridad técnica absoluta. Recopilamos datos mínimos necesarios para la excelencia operativa:
                   </p>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                      {[
                        'Datos de Registro: NIT, email corporativo y teléfono.',
                        'Telemetría de Envío: Coordenadas GPS y sellos de tiempo.',
                        'Metadatos Técnicos: IP y huella digital del dispositivo.'
                      ].map(item => (
                        <div key={item} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] text-sm font-bold text-textMuted uppercase tracking-widest">{item}</div>
                      ))}
                   </div>
                </section>

                <section className="space-y-6">
                   <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
                      <div className="w-1.5 h-8 bg-primary rounded-full" /> 2. Seguridad de Grado Industrial
                   </h2>
                   <p className="text-xl text-textMuted leading-relaxed font-medium">
                      Implementamos protocolos de encriptación AES-256 en reposo y TLS 1.3 en tránsito. El acceso a los nodos de datos está restringido bajo estrictos controles de identidad y auditoría en tiempo real.
                   </p>
                </section>

                <section className="mt-20 pt-20 border-t border-white/[0.08]">
                    <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] text-center">
                       <p className="text-xs font-black text-textMuted uppercase tracking-[0.4em] leading-loose">
                          Sus derechos ARCO están garantizados por nuestra arquitectura. <br />
                          Contacto de Protección de Datos: <br />
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
