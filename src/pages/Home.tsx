import { motion, useScroll } from 'framer-motion';
import { useRef } from 'react';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { 
  MapPin, ArrowRight, CheckCircle2, Layers, 
  Cpu, Activity
} from 'lucide-react';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const partners = [
    'AeroCargo', 'LogisTech', 'ExpressCol', 'SkyFleet', 'UrbanRoute', 'NexLog'
  ];

  const heroText = "Dominio Total de Ruta.";
  const heroWords = heroText.split(" ");

  return (
    <div ref={containerRef} className="bg-[#000] min-h-screen text-text overflow-x-hidden selection:bg-primary/30 selection:text-white font-inter">
      <Navbar />

      {/* Hero Section - Supreme Word Reveal */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-4 text-center overflow-hidden">
        {/* Animated Logistic Paths (SVG) */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1000 1000" fill="none">
            <motion.path
              d="M-100,500 C200,300 400,700 600,500 S800,200 1100,500"
              stroke="url(#grad1)"
              strokeWidth="0.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path
              d="M500,-100 C300,200 700,400 500,600 S200,800 500,1100"
              stroke="url(#grad2)"
              strokeWidth="0.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
                <stop offset="50%" stopColor="#3B82F6" stopOpacity="1" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0" />
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity="1" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-primary text-[10px] font-black uppercase tracking-[0.5em] mb-12"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            SaaS Logístico Autónomo
          </motion.div>

          <h1 className="text-7xl md:text-[10rem] font-black text-white tracking-tighter leading-[0.8] mb-12">
            {heroWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                className={`inline-block mr-4 ${word === 'Ruta.' ? 'text-primary italic' : ''}`}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="max-w-2xl mx-auto text-xl md:text-2xl text-textMuted font-medium leading-relaxed mb-16"
          >
            Infraestructura técnica para el control absoluto de la última milla. 
            Arquitectura de software diseñada para la escala global.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Button asChild variant="premium" size="lg" className="h-16 px-14 rounded-2xl shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)] border-white/10 group">
              <Link to="/register" className="flex items-center gap-3">
                 Empezar Ahora <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="h-16 px-14 rounded-2xl bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.08] transition-all text-white">
              <a href="#demo">Agendar Demo</a>
            </Button>
          </motion.div>
        </div>

        {/* Brand Marquee Supreme */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.2 }}
          className="mt-40 w-full max-w-7xl mx-auto pt-16 border-t border-white/[0.05] relative"
        >
          <div className="overflow-hidden relative mask-fade-edges py-4">
            <motion.div 
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="flex items-center gap-24 md:gap-48 pr-24 md:pr-48"
            >
              {[...Array(2)].map((_, mainIdx) => (
                <div key={mainIdx} className="flex items-center gap-24 md:gap-48">
                  {partners.map((partner) => (
                    <div 
                      key={partner} 
                      className="text-2xl font-black text-white tracking-widest uppercase opacity-40 hover:opacity-100 transition-opacity cursor-default"
                    >
                      {partner}
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Bento-Box Features Section */}
      <section id="features" className="py-48 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-32">
            <h2 className="text-xs font-black text-primary uppercase tracking-[0.6em] mb-6">Módulos Corporativos</h2>
            <h3 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none max-w-4xl">
              Ingeniería aplicada a la eficiencia logística.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-4">
            {/* Main Feature - Large */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:col-span-4 md:row-span-2 p-12 rounded-[48px] bg-white/[0.02] border border-white/[0.05] hover:border-primary/20 transition-all group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5">
                 <MapPin size={200} className="text-primary" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-12">
                 <Layers size={28} />
              </div>
              <h4 className="text-4xl font-black text-white mb-6 tracking-tight">Rastreo de Grado Militar</h4>
              <p className="text-xl text-textMuted max-w-md font-medium leading-relaxed mb-12">
                Monitoreo en tiempo real con precisión de 0.5 metros, telemetría avanzada y geocercas multidimensionales.
              </p>
              <div className="flex gap-4">
                 {['Sincronización 100ms', 'Criptografía AES-256', 'Soporte Offline'].map(tag => (
                   <span key={tag} className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-textMuted uppercase tracking-widest">{tag}</span>
                 ))}
              </div>
            </motion.div>

            {/* Feature 2 - Tall */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="md:col-span-2 p-10 rounded-[48px] bg-white/[0.02] border border-white/[0.05] hover:border-accent/20 transition-all flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                 <Cpu size={24} />
              </div>
              <div>
                <h4 className="text-2xl font-black text-white mb-4 tracking-tight">IA Predictiva</h4>
                <p className="text-sm text-textMuted font-medium leading-relaxed">
                  Algoritmos de aprendizaje profundo que optimizan rutas dinámicamente según el tráfico y el clima.
                </p>
              </div>
            </motion.div>

            {/* Feature 3 - Small */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 }}
               className="md:col-span-2 p-10 rounded-[48px] bg-white/[0.02] border border-white/[0.05] hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                 <Activity size={24} />
              </div>
              <div>
                <h4 className="text-2xl font-black text-white mb-4 tracking-tight">Telemetría Live</h4>
                <p className="text-sm text-textMuted font-medium leading-relaxed">
                  Dashboards de alta velocidad que procesan millones de eventos logísticos por segundo.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section Refined */}
      <section id="pricing" className="py-48 relative border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-40">
            <h3 className="text-7xl md:text-9xl font-black text-white tracking-tighter mb-8 italic">Precios Claros.</h3>
            <p className="text-xl text-textMuted max-w-xl mx-auto font-medium">Sin costos ocultos. Solo escala pura para tu negocio.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {[
              { 
                name: 'Starter', price: '149.000', 
                perks: ['Hasta 5 Conductores', 'Rastreo Realtime (1 min)', 'Geocercas Básicas', 'Soporte vía Email'] 
              },
              { 
                name: 'Professional', price: '399.000', 
                perks: ['Conductores Ilimitados', 'Optimización IA de Rutas', 'API de Integración', 'Firma Digital', 'Soporte 24/7 Priority'],
                popular: true 
              },
              { 
                name: 'Enterprise', price: 'Personalizado', 
                perks: ['Infraestructura Dedicada', 'SLA del 99.9%', 'Panel de Marca Blanca', 'Account Manager Dedicado'] 
              }
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-14 rounded-[56px] border transition-all duration-500 relative flex flex-col ${
                  plan.popular 
                    ? 'bg-[#0A0A0A] border-primary/40 shadow-[0_0_80px_-20px_rgba(59,130,246,0.2)] scale-105 z-10' 
                    : 'bg-transparent border-white/[0.05] hover:border-white/[0.1]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-lg">
                    Recomendado Elite
                  </div>
                )}
                <div className="mb-16">
                  <h4 className="text-xs font-black text-textMuted uppercase tracking-[0.5em] mb-8">{plan.name}</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-textMuted">$</span>
                    <span className="text-6xl font-black text-white tracking-tighter">{plan.price}</span>
                    {plan.price !== 'Personalizado' && <span className="text-sm font-bold text-textMuted uppercase tracking-widest">/mes</span>}
                  </div>
                </div>

                <div className="flex-1 space-y-5 mb-16">
                  {plan.perks.map(p => (
                    <div key={p} className="flex items-center gap-4 text-sm font-bold text-textMuted/70 uppercase tracking-widest italic text-[11px]">
                       <CheckCircle2 size={16} className="text-primary shrink-0" />
                       {p}
                    </div>
                  ))}
                </div>

                <Button variant={plan.popular ? 'premium' : 'outline'} className="w-full h-16 rounded-2xl font-black text-xs tracking-widest uppercase">
                  Solicitar {plan.name}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
