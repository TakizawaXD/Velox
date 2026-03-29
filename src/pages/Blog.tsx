import { motion } from 'framer-motion';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { Calendar, User, ArrowRight, BookOpen, Settings, Zap, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Blog() {
  const posts = [
    {
      id: 1,
      title: 'La Transformación de la Última Milla en Colombia 2026',
      excerpt: 'Cómo las nuevas tecnologías están optimizando las entregas urbanas en Bogotá y Medellín.',
      author: 'Carlos Velásquez',
      date: 'Mar 25, 2026',
      category: 'Tecnología',
      icon: Terminal,
      color: 'from-primary/20 to-primary/5'
    },
    {
      id: 2,
      title: '5 Tips para Mejorar la Eficiencia de tu Flota',
      excerpt: 'Estrategias probadas para reducir costos de combustible y tiempos de entrega.',
      author: 'Elena Gómez',
      date: 'Mar 20, 2026',
      category: 'Logística',
      icon: Settings,
      color: 'from-accent/20 to-accent/5'
    },
    {
      id: 3,
      title: 'Sostenibilidad y Logística Verde',
      excerpt: 'Hacia una red de reparto libre de emisiones con vehículos eléctricos.',
      author: 'Sofía Martínez',
      date: 'Mar 15, 2026',
      category: 'Innovación',
      icon: Zap,
      color: 'from-white/10 to-white/5'
    }
  ];

  return (
    <div className="bg-[#000] min-h-screen text-text selection:bg-primary/30 font-inter">
      <Navbar />
      <main className="pt-48 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-40"
          >
            <h2 className="text-xs font-black text-primary uppercase tracking-[0.6em] mb-8">Publicaciones Técnicas</h2>
            <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-[0.8] mb-12 uppercase">
              Insights <br />
              <span className="text-primary italic">Velox.</span>
            </h1>
            <p className="text-xl text-textMuted max-w-2xl mx-auto font-medium leading-relaxed">
               Análisis profundo sobre el futuro de la logística, la ingeniería de transporte y la infraestructura digital.
            </p>
          </motion.div>

          {/* Featured Post - Highlight */}
          <div className="mb-40">
             <motion.div 
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="p-16 rounded-[48px] bg-white/[0.02] border border-white/[0.05] flex flex-col md:flex-row gap-16 items-center group cursor-pointer hover:border-primary/20 transition-all"
             >
                <div className="w-full md:w-1/2 aspect-[16/10] rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-grid-white/[0.02]" />
                   <BookOpen size={120} className="text-primary opacity-20 group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="w-full md:w-1/2 space-y-8">
                   <span className="px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">Destacado</span>
                   <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none group-hover:text-primary transition-colors">Infraestructura Crítica: El Futuro del Reparto Autónomo.</h2>
                   <p className="text-lg text-textMuted font-medium leading-relaxed">Exploramos cómo la integración de hardware y software está redefiniendo los tiempos de respuesta en entornos urbanos densos.</p>
                   <div className="flex items-center gap-6 text-[10px] font-black text-textMuted uppercase tracking-widest">
                      <div className="flex items-center gap-2"><Calendar size={14} /> Mar 29, 2026</div>
                      <div className="flex items-center gap-2"><User size={14} /> Equipo Velox</div>
                   </div>
                </div>
             </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.article 
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-10 rounded-[40px] bg-white/[0.02] border border-white/[0.05] hover:border-primary/20 transition-all flex flex-col h-full"
              >
                <div className={`aspect-[16/10] rounded-2xl bg-gradient-to-br ${post.color} mb-10 flex items-center justify-center relative overflow-hidden`}>
                   <div className="absolute inset-0 bg-grid-white/[0.02]" />
                   <post.icon size={64} className="text-white opacity-20 group-hover:scale-110 transition-transform duration-500" />
                </div>

                <div className="flex-1 space-y-6">
                   <div className="flex items-center justify-between text-[10px] font-black text-textMuted uppercase tracking-widest">
                      <span className="text-primary italic">{post.category}</span>
                      <span>{post.date}</span>
                   </div>
                   <h3 className="text-2xl font-black text-white tracking-tight leading-tight group-hover:text-primary transition-colors">
                      {post.title}
                   </h3>
                   <p className="text-sm text-textMuted font-medium leading-relaxed line-clamp-3">
                      {post.excerpt}
                   </p>
                </div>

                <Button variant="outline" className="mt-12 w-full h-14 rounded-2xl border-white/[0.05] hover:border-primary/20 group/btn bg-white/[0.02]">
                   <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                      Analizar Publicación <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                   </span>
                </Button>
              </motion.article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
