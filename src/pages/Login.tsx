import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Lock, Mail, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -left-1/4 -top-1/4 h-[800px] w-[800px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 h-[800px] w-[800px] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface blur-[80px]" />
      </div>

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0gMjAgMCBMMCAwIDAgMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIiAvPgo8L3N2Zz4=')] opacity-30 mix-blend-overlay z-0 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-6"
      >
        <div className="rounded-3xl border border-white/5 bg-surface/50 p-8 shadow-glass backdrop-blur-xl">
          <div className="mb-10 text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-neon-blue mb-6"
            >
              <Package size={32} className="text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-textMuted inline-block">
              Velox Central
            </h1>
            <p className="mt-2 text-textMuted font-medium flex items-center justify-center gap-1.5">
              <Shield size={14} className="text-success" /> Acceso Restringido
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="flex items-center gap-2 rounded-lg bg-danger/10 p-3 border border-danger/20 text-danger text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  <p>{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group space-y-2">
              <label className="text-sm font-medium text-textMuted transition-colors group-focus-within:text-primary">
                Correo Corporativo
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textMuted transition-colors group-focus-within:text-primary" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-surface/80 py-3 pl-10 pr-4 text-text placeholder:text-textMuted/50 focus:border-primary/50 focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                  placeholder="admin@empresa.com"
                  required
                />
              </div>
            </div>

            <div className="group space-y-2">
              <label className="text-sm font-medium text-textMuted transition-colors group-focus-within:text-primary">
                Contraseña Administrativa
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textMuted transition-colors group-focus-within:text-primary" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-surface/80 py-3 pl-10 pr-4 text-text placeholder:text-textMuted/50 focus:border-primary/50 focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end py-1">
              <a href="#" className="text-sm text-primary hover:text-primaryHover transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button
              type="submit"
              size="lg"
              className="mt-4 w-full justify-between pr-2 text-base font-semibold shadow-neon-blue"
              isLoading={isLoading}
            >
              Iniciar Sesión Segura
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 ml-2">
                <ArrowRight size={18} />
              </div>
            </Button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <span className="text-sm text-textMuted">¿Solución para flotas nuevas?</span>
            <Link to="/register" className="ml-2 text-sm font-semibold text-primary hover:text-primaryHover transition-colors">
              Adquirir Licencia Velox
            </Link>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
