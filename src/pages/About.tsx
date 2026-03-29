import { motion } from 'framer-motion';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { Shield, Target, Globe, Zap, ArrowRight, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SEO } from '@/components/common/SEO';

export function About() {
  return (
    <div className="bg-[#000] min-h-screen text-text selection:bg-primary/30 font-inter">
      <SEO title="Nosotros" />
      <Navbar />
      
      <main className="pt-48 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-40"
          >
            <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-[0.8] mb-12 uppercase italic">
              Ingeniería <br />
              <span className="text-primary italic">Logística.</span>
            </h1>
            <p className="text-xl md:text-2xl text-textMuted max-w-2xl mx-auto font-medium leading-relaxed">
              Redefiniendo el movimiento de carga a través de la precisión matemática y el software de alto rendimiento.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-40">
            {/* Mission Statement - Large Bento */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-8 p-16 rounded-[48px] bg-white/[0.02] border border-white/[0.05] h-full flex flex-col justify-between"
            >
              <div className="space-y-8">
                <h2 className="text-5xl font-black text-white tracking-tighter">Misión Crítica.</h2>
                <p className="text-xl text-textMuted leading-relaxed font-medium max-w-xl">
                  Velox nació para eliminar la fricción técnica en la última milla. No solo movemos paquetes; arquitectamos redes de distribución que operan con autonomía y precisión absoluta.
                </p>
              </div>
              <div className="pt-12 flex gap-8">
                 <div className="text-center">
                    <div className="text-4xl font-black text-white">+10M</div>
                    <div className="text-[10px] font-black text-textMuted uppercase tracking-widest mt-2">Paquetes</div>
                 </div>
                 <div className="text-center">
                    <div className="text-4xl font-black text-white">99.9%</div>
                    <div className="text-[10px] font-black text-textMuted uppercase tracking-widest mt-2">Uptime</div>
                 </div>
              </div>
            </motion.div>

            {/* Vision - Small Bento */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:col-span-4 p-12 rounded-[48px] bg-white/[0.02] border border-white/[0.05] flex flex-col items-center text-center justify-center group"
            >
               <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 transition-transform">
                  <Target size={40} />
               </div>
               <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Visión 2030</h3>
               <p className="text-sm text-textMuted font-medium leading-relaxed">
                  Liderar la red de logística inteligente más eficiente de Latinoamérica mediante automatización pura.
               </p>
            </motion.div>

            {/* Values - Row */}
            {[
              { title: 'Escalabilidad', icon: Layers, desc: 'Infraestructura diseñada para crecer al infinito.' },
              { title: 'Privacidad', icon: Shield, desc: 'Encriptación de punta en cada punto de contacto.' },
              { title: 'Conectividad', icon: Globe, desc: 'Integración vía API con cualquier ecosistema.' },
              { title: 'Velocidad', icon: Zap, desc: 'Tiempos de respuesta reducidos a micro-segundos.' }
            ].map((v, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="md:col-span-3 p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:border-primary/20 transition-all group"
              >
                <v.icon className="text-textMuted mb-6 group-hover:text-primary transition-colors" size={24} />
                <h4 className="text-lg font-black text-white mb-2 tracking-tight">{v.title}</h4>
                <p className="text-xs text-textMuted font-medium leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-20 rounded-[64px] bg-primary text-center relative overflow-hidden group"
          >
             <div className="relative z-10">
               <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-10">Únete a la Revolución.</h2>
               <Button asChild size="lg" className="rounded-2xl h-16 px-12 bg-white text-black font-black hover:bg-white/90 transition-all group">
                  <a href="/register" className="flex items-center gap-3">
                    Construir mi Flota <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </a>
               </Button>
             </div>
             <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <BarChart size={300} stroke="white" />
             </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Internal icons helper since I used Layers in the map
function Layers({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
      <path d="m2.6 11.27 8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83"/>
      <path d="m2.6 15.17 8.58 3.9a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83"/>
    </svg>
  );
}
