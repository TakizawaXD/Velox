import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, ArrowRight, AlertCircle, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { SEO } from '@/components/common/SEO';

// Inyección rápida de datos base con TenantID
const seedData = async (tenantId: string) => {
  const batch = writeBatch(db);
  const orders = [
    { id: `ORD-${Math.floor(Math.random() * 1000) + 1000}`, client: 'Empresa A', address: 'Zona Central', driver: 'Pendiente', time: '-', status: 'Pendiente', amount: 150.00, tenantId },
    { id: `ORD-${Math.floor(Math.random() * 1000) + 1000}`, client: 'Distribución XYZ', address: 'Puerto Norte', driver: 'Julio C.', time: '18 min', status: 'En camino', amount: 89.50, tenantId },
  ];
  orders.forEach(order => {
    batch.set(doc(collection(db, 'orders')), { ...order, createdAt: new Date() });
  });

  const drivers = [
    { id: `DRV-${Math.floor(Math.random() * 100) + 10}`, name: 'Ricardo P.', status: 'Entregando', vehicle: 'Camión - ABC-123', deliveries: 450, rating: 4.8, x: 50, y: 50, tenantId },
    { id: `DRV-${Math.floor(Math.random() * 100) + 10}`, name: 'Elena G.', status: 'Disponible', vehicle: 'Furgoneta - DEF-456', deliveries: 120, rating: 4.9, x: 30, y: 70, tenantId },
  ];
  drivers.forEach(driver => {
    batch.set(doc(collection(db, 'drivers'), driver.id), driver);
  });

  await batch.commit();
};

export function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  // State
  const [company, setCompany] = useState('');
  const [organizationType, setOrganizationType] = useState('E-commerce');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    let score = 0;
    if (password.length > 5) score += 1;
    if (password.length > 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    setStrength(Math.min(score, 4));
  }, [password]);

  const getStrengthColor = () => {
    if (strength === 0) return 'bg-white/10';
    if (strength <= 1) return 'bg-danger';
    if (strength <= 2) return 'bg-warning';
    if (strength === 3) return 'bg-success/80';
    return 'bg-success shadow-[0_0_10px_rgba(16,185,129,0.5)]';
  };
  const getStrengthText = () => {
    if (strength === 0) return '';
    if (strength <= 1) return 'Básica';
    if (strength <= 2) return 'Media';
    if (strength === 3) return 'Segura';
    return 'Blindada';
  };

  const validateStep = () => {
    if (step === 1) {
      if (!company.trim()) return "Nombre de empresa requerido.";
      if (!name.trim()) return "Nombre de administrador requerido.";
      setStep(2);
      setError('');
    } else {
      if (!email) return "Correo corporativo requerido.";
      if (password.length < 6) return "Mínimo 6 caracteres.";
      if (password !== confirmPassword) return "Las claves no coinciden.";
      if (!terms) return "Acepta los términos de licencia.";
      return null;
    }
    return "error-handled";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (step === 1) { validateStep(); return; }
    const validationError = validateStep();
    if (validationError && validationError !== "error-handled") { setError(validationError); return; }
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      const tenantId = userCredential.user.uid;
      const userDocRef = doc(db, 'users', tenantId);
      const batch = writeBatch(db);
      batch.set(userDocRef, { name, email, company, organizationType, role: 'Administrador Principal', status: 'Activo', tenantId, createdAt: new Date() });
      await batch.commit();
      await seedData(tenantId);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Fallo en el servidor: ' + (err.message || err.code));
    } finally { setIsLoading(false); }
  };

  return (
    <div className="flex min-h-screen bg-[#000] text-text font-inter selection:bg-primary/30">
      <SEO title="Registro Corporativo" />
      
      {/* Columna Izquierda: Industrial Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[40%] bg-[#fff] p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-24">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black shadow-2xl">
              <Package size={24} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-black uppercase italic">Velox<span className="text-primary italic">.</span></span>
          </div>

          <h2 className="text-7xl font-black text-black leading-[0.9] tracking-tighter mb-10 uppercase italic">
            El Futuro de la <span className="text-primary italic">Logística.</span>
          </h2>
          <p className="text-black/60 text-lg font-medium mb-12 max-w-sm leading-tight">
            Despliega tu propia infraestructura multi-tenant en segundos. Control absoluto, latencia cero.
          </p>

          <div className="space-y-8">
            <div className="flex items-center gap-5">
              <div className="h-12 w-12 rounded-full border border-black/10 flex items-center justify-center">
                 <CheckCircle2 size={24} className="text-black" />
              </div>
              <p className="text-sm font-black text-black uppercase tracking-widest">Aislamiento de Datos Nivel 4</p>
            </div>
            <div className="flex items-center gap-5">
              <div className="h-12 w-12 rounded-full border border-black/10 flex items-center justify-center">
                 <ShieldCheck size={24} className="text-black" />
              </div>
              <p className="text-sm font-black text-black uppercase tracking-widest">Base de Datos Dedicada</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
           <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.5em]">Velox Technologies Inc. © 2026</p>
        </div>
      </div>

      {/* Columna Derecha: Formulario High-End */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative bg-[#000]">
        <div className="w-full max-w-md">
          
          <div className="mb-12">
            <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none mb-4">
               {step === 1 ? 'Tu Organización' : 'Acceso Maestro'}
            </h1>
            <p className="text-textMuted font-bold uppercase text-[10px] tracking-[0.4em]">Paso {step} de 2 — Configuración del Entorno</p>
          </div>

          <div className="flex gap-2 mb-12">
            <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary shadow-neon-blue' : 'bg-white/5'}`}></div>
            <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary' : 'bg-white/5'}`}></div>
          </div>

          <AnimatePresence mode="wait">
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

          <form onSubmit={handleSubmit} className="space-y-6 text-white font-inter">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6" key="step1">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-textMuted uppercase tracking-widest">Nombre de la Empresa</label>
                  <input
                    type="text" value={company} onChange={e => setCompany(e.target.value)}
                    className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 px-5 text-sm focus:border-primary/50 focus:bg-white/[0.08] focus:outline-none transition-all font-medium placeholder:text-textMuted/20"
                    placeholder="Ej. Logística Global S.A.S"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-textMuted uppercase tracking-widest">Sector Operativo</label>
                  <select
                    value={organizationType} onChange={e => setOrganizationType(e.target.value)}
                    className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 px-5 text-sm focus:border-primary/50 focus:bg-white/[0.08] focus:outline-none transition-all font-medium cursor-pointer appearance-none"
                  >
                    <option value="E-commerce">E-Commerce</option>
                    <option value="Restaurante">Retail / Restaurante</option>
                    <option value="Operador Logístico">Operador 3PL</option>
                    <option value="Farmacia">Salud / Pharma</option>
                    <option value="Otro">Otro Sector</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-textMuted uppercase tracking-widest">Administrador General</label>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 px-5 text-sm focus:border-primary/50 focus:bg-white/[0.08] focus:outline-none transition-all font-medium placeholder:text-textMuted/20"
                    placeholder="Nombre Completo"
                  />
                </div>

                <Button type="button" onClick={() => validateStep()} className="w-full py-7 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3">
                  Siguiente <ArrowRight size={18} />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6" key="step2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-textMuted uppercase tracking-widest">Correo Corporativo</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 px-5 text-sm focus:border-primary/50 focus:bg-white/[0.08] focus:outline-none transition-all font-medium placeholder:text-textMuted/20"
                    placeholder="admin@empresa.com"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-widest">Clave Maestra</label>
                    <span className="text-[10px] font-black text-primary uppercase">{getStrengthText()}</span>
                  </div>
                  <input
                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 px-5 text-sm focus:border-primary/50 focus:bg-white/[0.08] focus:outline-none transition-all font-medium placeholder:text-textMuted/20"
                    placeholder="Mínimo 8 caracteres"
                  />
                  <div className="flex gap-1 h-1 px-1">
                     {[1,2,3,4].map(i => <div key={i} className={`flex-1 rounded-full transition-all ${strength >= i ? getStrengthColor() : 'bg-white/5'}`} />)}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-textMuted uppercase tracking-widest">Confirmar Clave</label>
                  <input
                    type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 px-5 text-sm focus:border-primary/50 focus:bg-white/[0.08] focus:outline-none transition-all font-medium placeholder:text-textMuted/20"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center gap-3 py-4">
                  <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} className="h-5 w-5 rounded-lg border-white/10 bg-white/5 text-primary focus:ring-primary" id="terms" />
                  <label htmlFor="terms" className="text-[11px] text-textMuted font-bold uppercase tracking-wider cursor-pointer">
                    Acepto la <span className="text-primary hover:underline">Licencia Corporativa</span> v4.
                  </label>
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="secondary" onClick={() => setStep(1)} className="px-8 rounded-2xl border-white/5 font-black uppercase text-[10px] tracking-widest" disabled={isLoading}>
                    Atrás
                  </Button>
                  <Button type="submit" className="flex-1 py-7 rounded-2xl bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-xs shadow-2xl" isLoading={isLoading}>
                    Activar Sistema <CheckCircle2 size={18} className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </form>

          <div className="mt-12 text-center">
            <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest">
              ¿Ya tienes una cuenta? 
              <Link to="/login" className="text-primary hover:text-white ml-2 underline decoration-primary/30 underline-offset-4 font-black">
                Entrar al Dashboard
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
