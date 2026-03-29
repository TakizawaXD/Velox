import { motion } from 'framer-motion';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SEO } from '@/components/common/SEO';

export function Cookies() {
  return (
    <div className="bg-[#000] min-h-screen text-text selection:bg-primary/30 font-inter">
       <SEO title="Política de Cookies" />
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
                
                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-8 uppercase italic">
                   Política de <span className="text-primary italic">Cookies.</span>
                </h1>
                <p className="text-xl text-textMuted font-medium max-w-2xl leading-relaxed">
                   Velox utiliza tecnologías de rastreo de grado técnico para optimizar la experiencia operativa y analítica en nuestra red global.
                </p>
             </motion.div>

             <div className="space-y-16">
                <section className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:border-primary/20 transition-all group">
                   <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-4 uppercase italic">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      01. Tecnología Identificativa
                   </h2>
                   <p className="text-textMuted font-medium leading-relaxed">
                      Las cookies son paquetes de datos técnicos que nuestro servidor deposita en su terminal para identificar flujos de sesión, preferencias de configuración y telemetría de rendimiento. Sin estas, la coordinación de alta velocidad de Velox se vería comprometida.
                   </p>
                </section>

                <section className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:border-primary/20 transition-all group">
                   <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-4 uppercase italic">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      02. Clasificación de Datos
                   </h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                         <h3 className="text-primary font-black mb-2 uppercase text-xs tracking-widest">Esenciales</h3>
                         <p className="text-sm text-textMuted font-medium">Permitir el acceso seguro al Dashboard y la autenticación de grado bancario.</p>
                      </div>
                      <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                         <h3 className="text-primary font-black mb-2 uppercase text-xs tracking-widest">Analíticas</h3>
                         <p className="text-sm text-textMuted font-medium">Monitorear la latencia de red y la eficiencia de la interfaz de usuario.</p>
                      </div>
                   </div>
                </section>

                <section className="p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:border-primary/20 transition-all group">
                   <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-4 uppercase italic">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      03. Gestión de Firewall de Sesión
                   </h2>
                   <p className="text-textMuted font-medium leading-relaxed mb-8">
                      El operador puede configurar su firewall de navegación para rechazar estas balizas de datos. Tenga en cuenta que la desactivación de cookies puede resultar en una degradación masiva de la experiencia logística en tiempo real.
                   </p>
                   <Button variant="outline" className="rounded-2xl border-white/10 hover:border-primary/50 text-xs font-black uppercase tracking-widest px-8">
                      Configurar Preferencias
                   </Button>
                </section>
             </div>
          </div>
       </main>
       <Footer />
    </div>
  );
}
