import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Package, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Funciones', href: '#features' },
    { name: 'Demo', href: '#demo' },
    { name: 'Precios', href: '#pricing' },
    { name: 'Seguimiento', href: '/track/demo' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled ? 'py-4' : 'py-10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className={`flex justify-between items-center transition-all duration-700 rounded-full px-8 ease-in-out ${
            scrolled 
              ? 'bg-black/40 backdrop-blur-2xl border border-white/[0.08] py-4 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)]' 
              : 'py-2 bg-transparent border-transparent'
          }`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ rotate: -5, scale: 1.1 }}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.05] border border-white/[0.1] shadow-2xl transition-all group-hover:border-primary/50"
            >
              <Package className="h-5 w-5 text-primary" />
            </motion.div>
            <span className="text-2xl font-black tracking-tighter text-white">
              Velox<span className="text-primary italic">.</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href}
                className="text-[10px] font-black text-textMuted hover:text-white transition-all uppercase tracking-[0.3em] relative group/link"
              >
                {link.name}
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all duration-500 group-hover/link:w-2" />
              </a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-8">
            {currentUser ? (
              <Button asChild variant="premium" className="rounded-2xl font-black px-8 h-12 text-xs tracking-widest uppercase shadow-2xl border-white/10">
                <Link to="/dashboard">Console</Link>
              </Button>
            ) : (
              <>
                <NavLink to="/login" className="text-[10px] font-black text-textMuted hover:text-white transition-colors uppercase tracking-widest">
                  Login
                </NavLink>
                <Button asChild variant="premium" size="md" className="rounded-2xl font-black px-8 h-12 text-xs tracking-widest uppercase shadow-2xl border-white/10 group">
                  <Link to="/register" className="flex items-center gap-2">
                    Get Started <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-3 text-textMuted hover:text-white transition-colors rounded-2xl bg-white/[0.02] border border-white/[0.05]"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Supreme */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full left-4 right-4 mt-4 md:hidden bg-black/90 backdrop-blur-3xl rounded-[40px] overflow-hidden shadow-2xl border border-white/[0.1]"
          >
            <div className="px-8 py-12 space-y-10">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block text-4xl font-black text-white hover:text-primary transition-colors tracking-tighter"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-10 border-t border-white/5 flex flex-col gap-6">
                {currentUser ? (
                  <Button asChild variant="premium" className="w-full py-8 text-xl font-black rounded-3xl uppercase tracking-widest">
                    <Link to="/dashboard" onClick={() => setIsOpen(false)}>Ir a Consola</Link>
                  </Button>
                ) : (
                  <>
                    <NavLink to="/login" onClick={() => setIsOpen(false)} className="text-center py-2 font-black text-textMuted uppercase tracking-widest text-sm">
                      Iniciar Sesión
                    </NavLink>
                    <Button asChild variant="premium" className="w-full py-8 text-xl font-black rounded-3xl uppercase tracking-widest">
                      <Link to="/register" onClick={() => setIsOpen(false)}>Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
