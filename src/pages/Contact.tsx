import { motion } from 'framer-motion';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SEO } from '@/components/common/SEO';

export function Contact() {
  return (
    <div className="bg-[#000] min-h-screen text-text selection:bg-primary/30 font-inter">
      <SEO title="Contacto" />
      <Navbar />
      <main className="pt-40 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-stretch">
            {/* Info Side */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col justify-center space-y-12"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em]"
                >
                  Canal de Atención Directa
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                  Hablemos de <br />
                  <span className="text-primary italic">Velox.</span>
                </h1>
                <p className="text-xl text-textMuted max-w-md font-medium leading-relaxed">
                  Infraestructura técnica y comercial disponible para escalar tu operación hoy mismo.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { icon: Mail, label: 'Email Corporativo', value: 'andresmontalvo2222@gmail.com' },
                  { icon: Phone, label: 'Ventas Nacionales', value: '3152738241' },
                  { icon: MapPin, label: 'Sede Principal', value: 'Bucaramanga, Santander' },
                  { icon: MessageCircle, label: 'Soporte WhatsApp', value: 'Disponible 24/7' }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ y: -5 }}
                    className="p-6 rounded-[32px] glass-card space-y-4"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary shadow-sm">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-textMuted mb-1 opacity-50">{item.label}</h4>
                      <p className="font-bold text-white tracking-tight">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="p-8 rounded-[40px] glass-panel border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                   <Clock className="text-primary" size={20} />
                   <span className="text-xs font-black text-white uppercase tracking-[0.2em]">SLA de Respuesta Garantizado</span>
                </div>
                <p className="text-sm text-textMuted font-medium leading-relaxed">
                  Nuestros ingenieros y especialistas logísticos revisan cada solicitud en menos de 120 minutos durante horario comercial (8:00 AM - 6:00 PM).
                </p>
              </div>
            </motion.div>

            {/* Form Side */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-10 md:p-14 rounded-[56px] glass-panel border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[120px] -z-10" />
              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-widest ml-1">Nombre Completo</label>
                    <input type="text" placeholder="Ej: Andres T." className="w-full h-14 bg-white/5 rounded-2xl border border-white/10 px-6 text-white text-sm font-medium focus:border-primary/50 outline-none transition-all placeholder:text-white/20" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-widest ml-1">Compañía</label>
                    <input type="text" placeholder="Ej: Velox S.A.S" className="w-full h-14 bg-white/5 rounded-2xl border border-white/10 px-6 text-white text-sm font-medium focus:border-primary/50 outline-none transition-all placeholder:text-white/20" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-textMuted uppercase tracking-widest ml-1">Email Corporativo</label>
                  <input type="email" placeholder="hola@empresa.com" className="w-full h-14 bg-white/5 rounded-2xl border border-white/10 px-6 text-white text-sm font-medium focus:border-primary/50 outline-none transition-all placeholder:text-white/20" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-textMuted uppercase tracking-widest ml-1">Asunto de Consulta</label>
                  <select className="w-full h-14 bg-surface rounded-2xl border border-white/10 px-6 text-white text-sm font-medium outline-none transition-all cursor-pointer appearance-none">
                    <option>Quiero Escalar mi Logística (Ventas)</option>
                    <option>Soporte Técnico Especializado</option>
                    <option>Relaciones Públicas / Partners</option>
                    <option>Otras Consultas</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-textMuted uppercase tracking-widest ml-1">Mensaje</label>
                  <textarea rows={5} placeholder="Describe brevemente tus requerimientos o retos logísticos..." className="w-full bg-white/5 rounded-3xl border border-white/10 p-6 text-white text-sm font-medium focus:border-primary/50 outline-none transition-all resize-none placeholder:text-white/20" />
                </div>
                <Button variant="premium" size="lg" className="w-full h-16 rounded-[24px] font-black flex items-center justify-center gap-3 text-lg group">
                  Enviar Requerimiento <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
                <p className="text-[10px] text-textMuted text-center font-bold uppercase tracking-widest opacity-40">
                   Protegido por protocolos de seguridad de grado bancario.
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
