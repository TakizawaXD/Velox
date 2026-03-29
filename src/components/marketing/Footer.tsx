import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Globe, MessageCircle, Share2, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Plataforma',
      links: [
        { name: 'Características', href: '#features' },
        { name: 'Seguimiento en Vivo', href: '/track/demo' },
        { name: 'Red de Repartidores', href: '#' },
        { name: 'Seguridad y Privacidad', href: '#' },
      ],
    },
    {
      title: 'Compañía',
      links: [
        { name: 'Acerca de Velox', href: '/about' },
        { name: 'Blog de Logística', href: '/blog' },
        { name: 'Contacto', href: '/contact' },
        { name: 'Soporte', href: '/support' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Términos de Servicio', href: '/terms' },
        { name: 'Política de Privacidad', href: '/privacy' },
        { name: 'Cookies', href: '/cookies' },
      ],
    },
  ];

  return (
    <footer className="bg-[#030303] pt-32 pb-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
          {/* Brand and Catchphrase */}
          <div className="lg:col-span-2 space-y-8">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div 
                whileHover={{ rotate: -5, scale: 1.1 }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 border border-white/10 shadow-premium"
              >
                <Package className="h-6 w-6 text-primary" />
              </motion.div>
              <span className="text-3xl font-black tracking-tighter text-white">
                Velox<span className="text-primary italic">.</span>
              </span>
            </Link>
            <p className="text-textMuted text-base max-w-sm font-medium leading-relaxed">
              Infraestructura logística de grado industrial. <br />
              Hecho para empresas que operan a escala global.
            </p>
            <div className="flex gap-4">
              {[MessageCircle, Share2, Globe].map((Icon, i) => (
                <motion.a 
                  key={i}
                  whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  href="#" 
                  className="p-3 rounded-2xl bg-white/5 border border-white/5 text-textMuted hover:text-white transition-all shadow-sm"
                >
                  <Icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-8">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] opacity-50">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-sm font-bold text-textMuted hover:text-white transition-all">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact info and bottom bar */}
        <div className="pt-16 border-t border-white/5 flex flex-col xl:flex-row justify-between items-center gap-12">
          <div className="flex flex-wrap justify-center gap-10">
            {[
              { icon: Mail, text: 'andresmontalvo2222@gmail.com' },
              { icon: Phone, text: '3152738241' },
              { icon: MapPin, text: 'Bucaramanga, Santander' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-xs font-black text-textMuted uppercase tracking-widest">
                <item.icon size={16} className="text-primary" />
                {item.text}
              </div>
            ))}
          </div>
          <div className="text-center xl:text-right space-y-2">
            <p className="text-[10px] font-black text-textMuted uppercase tracking-[0.3em]">
              © {currentYear} Velox Logística
            </p>
            <p className="text-[9px] font-bold text-textMuted/40 uppercase tracking-widest">
              Arquitectado con excelencia en Colombia para el mundo.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
