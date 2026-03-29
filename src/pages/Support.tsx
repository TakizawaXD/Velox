import { motion } from 'framer-motion';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { HelpCircle, Book, MessageSquare, Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SEO } from '@/components/common/SEO';

export function Support() {
  const faqs = [
    {
      q: '¿Cómo rastreo mi pedido?',
      a: 'Usa el enlace público generado por Velox o ingresa el ID de rastreo en nuestra consola pública.'
    },
    {
      q: '¿Qué SLA garantizan?',
      a: 'Nuestro plan Enterprise garantiza una disponibilidad del 99.9% respaldada por infraestructura dedicada.'
    },
    {
      q: '¿Cómo integrar la API técnica?',
      a: 'La documentación técnica está disponible para desarrolladores en la sección de integración del dashboard.'
    },
    {
      q: '¿Cuál es el tiempo de respuesta del soporte?',
      a: 'Los usuarios Pro y Enterprise cuentan con soporte prioritario con respuestas en menos de 15 minutos.'
    }
  ];

  return (
    <div className="bg-[#000] min-h-screen text-text selection:bg-primary/30 font-inter">
      <SEO title="Soporte" />
      <Navbar />
      <main className="pt-48 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-32">
             <h2 className="text-xs font-black text-primary uppercase tracking-[0.6em] mb-8">Centro de Control</h2>
             <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-[0.8] mb-12 uppercase italic">
                Soporte <br />
                <span className="text-primary italic">Técnico.</span>
             </h1>
             <p className="text-xl text-textMuted max-w-2xl mx-auto font-medium leading-relaxed">
                Documentación técnica, guías de usuario e infraestructura de atención al cliente de alto nivel.
             </p>
             
             <div className="max-w-2xl mx-auto relative mt-16 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors" size={24} />
                <input 
                  type="text" 
                  placeholder="Buscar documentación técnica..." 
                  className="w-full h-20 bg-white/[0.02] border border-white/[0.05] rounded-[24px] pl-16 pr-6 text-xl text-white focus:border-primary/40 focus:bg-white/[0.05] outline-none transition-all font-medium"
                />
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-40">
            {[
              { icon: Book, title: 'Documentación', desc: 'Protocolos de API y guías de integración de flota.', label: 'Explorar Docs' },
              { icon: MessageSquare, title: 'Incidencias Live', desc: 'Canal de comunicación directo con ingenieros.', label: 'Abrir Ticket' },
              { icon: ShieldCheck, title: 'System Status', desc: 'Monitorización en tiempo real de nuestros nodos.', label: 'Ver Estado' }
            ].map((card, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-12 rounded-[56px] bg-white/[0.02] border border-white/[0.05] hover:border-primary/20 transition-all text-center group flex flex-col items-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.05] mb-8 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <card.icon size={32} />
                </div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight uppercase tracking-widest text-sm">{card.title}</h3>
                <p className="text-sm text-textMuted mb-12 font-medium leading-relaxed">{card.desc}</p>
                <Button variant="outline" className="w-full py-6 rounded-2xl border-white/[0.05] hover:border-primary/20 font-black text-[10px] tracking-widest uppercase bg-white/[0.02]">
                   {card.label}
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
             <div className="flex items-center gap-6 mb-16">
                <div className="h-px bg-white/[0.08] flex-1" />
                <h2 className="text-[10px] font-black text-textMuted uppercase tracking-[0.5em] flex items-center gap-3">
                   <HelpCircle className="text-primary" size={16} /> FAQ Técnicos
                </h2>
                <div className="h-px bg-white/[0.08] flex-1" />
             </div>
             <div className="grid grid-cols-1 gap-4">
                {faqs.map((faq, i) => (
                  <motion.details 
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="group rounded-[32px] bg-white/[0.01] border border-white/[0.05] p-10 cursor-pointer hover:border-primary/20 transition-all"
                  >
                    <summary className="text-xl font-black text-white list-none flex justify-between items-center pr-4 tracking-tight">
                      {faq.q}
                      <span className="text-primary transition-transform group-open:rotate-180"><ArrowRight className="rotate-90" /></span>
                    </summary>
                    <div className="mt-8 text-lg text-textMuted font-medium leading-relaxed max-w-2xl border-t border-white/[0.05] pt-8">
                      {faq.a}
                    </div>
                  </motion.details>
                ))}
             </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
