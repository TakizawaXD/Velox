import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { SEO } from '@/components/common/SEO';

export function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Acceso denegado. Credenciales incorrectas o usuario no encontrado.');
      } else {
        setError('Error al autenticar con el servidor B2B.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#000] font-inter selection:bg-primary/30">
      <SEO title="Ingreso Administrativo" />
      
      {/* Absolute Minimalism Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[120px]" />
      </div>

      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-0 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md p-6"
      >
        <div className="glass-panel border-white/5 bg-surface/30 p-10 backdrop-blur-3xl rounded-[40px] shadow-2xl">
          <div className="mb-12 text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#fff] shadow-[0_0_40px_rgba(255,255,255,0.1)] mb-8"
            >
              <Package size={40} className="text-black" />
            </motion.div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none mb-2">
              Velox <span className="text-primary italic">Supreme.</span>
            </h1>
            <p className="text-[10px] font-black text-textMuted uppercase tracking-[0.4em] flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Operación de Grado Militar
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 p-4 rounded-2xl bg-danger/10 border border-danger/20 text-danger text-xs font-bold flex items-center gap-3"
              >
                <AlertCircle size={16} />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-textMuted uppercase tracking-widest ml-1">
                Credencial de Acceso
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-sm text-text placeholder:text-textMuted/30 focus:border-primary/50 focus:bg-white/[0.08] focus:outline-none transition-all font-medium"
                  placeholder="admin@velox.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-textMuted uppercase tracking-widest ml-1">
                Clave de Seguridad
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-sm text-text placeholder:text-textMuted/30 focus:border-primary/50 focus:bg-white/[0.08] focus:outline-none transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-7 rounded-2xl bg-primary hover:bg-primaryHover text-white shadow-neon-blue font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
              isLoading={isLoading}
            >
              Autenticar Sistema <ArrowRight size={18} />
            </Button>
          </form>

          <div className="mt-12 text-center space-y-4">
            <div className="h-px bg-white/5 w-full" />
            <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest">
              ¿No tienes una licencia corporativa? 
              <Link to="/register" className="text-primary hover:text-white ml-2 underline decoration-primary/30 underline-offset-4">
                Adquirir Velox v4
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-6 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all">
           <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Firebase_Logo.svg" alt="Firebase" className="h-5" />
           <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React" className="h-5" />
        </div>
      </motion.div>
    </div>
  );
}
