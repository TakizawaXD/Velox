import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Lock, Mail, ArrowRight, AlertCircle, Building2, User as UserIcon, ShieldCheck, CheckCircle2, Briefcase 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';

// Inyección rápida de datos base con TenantID
const seedData = async (tenantId: string) => {
  const batch = writeBatch(db);
  const orders = [
    { id: `ORD-\${Math.floor(Math.random() * 1000) + 1000}`, client: 'Empresa A', address: 'Zona Central', driver: 'Pendiente', time: '-', status: 'Pendiente', amount: 150.00, tenantId },
    { id: `ORD-\${Math.floor(Math.random() * 1000) + 1000}`, client: 'Distribución XYZ', address: 'Puerto Norte', driver: 'Julio C.', time: '18 min', status: 'En camino', amount: 89.50, tenantId },
  ];
  orders.forEach(order => {
    batch.set(doc(collection(db, 'orders')), { ...order, createdAt: new Date() });
  });

  const drivers = [
    { id: `DRV-\${Math.floor(Math.random() * 100) + 10}`, name: 'Ricardo P.', status: 'Entregando', vehicle: 'Camión - ABC-123', deliveries: 450, rating: 4.8, x: 50, y: 50, tenantId },
    { id: `DRV-\${Math.floor(Math.random() * 100) + 10}`, name: 'Elena G.', status: 'Disponible', vehicle: 'Furgoneta - DEF-456', deliveries: 120, rating: 4.9, x: 30, y: 70, tenantId },
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
  
  // Password Strength
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
    if (strength <= 1) return 'Muy débil';
    if (strength <= 2) return 'Aceptable';
    if (strength === 3) return 'Buena';
    return 'Fuerte';
  };

  const validateStep = () => {
    if (step === 1) {
      if (!company.trim()) return "El nombre de la empresa es obligatorio.";
      if (!name.trim()) return "El nombre del administrador es requerido.";
      setStep(2);
      setError('');
    } else {
      if (!email) return "El correo es requerido.";
      if (password.length < 6) return "La contraseña debe tener mínimo 6 caracteres.";
      if (password !== confirmPassword) return "Las contraseñas no coinciden.";
      if (!terms) return "Debes aceptar los términos y condiciones del servicio.";
      return null;
    }
    return "error-handled";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (step === 1) {
      validateStep();
      return;
    }

    const validationError = validateStep();
    if (validationError && validationError !== "error-handled") {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      const tenantId = userCredential.user.uid;

      const userDocRef = doc(db, 'users', tenantId);
      const batch = writeBatch(db);
      batch.set(userDocRef, {
         name,
         email,
         company,
         organizationType,
         role: 'Administrador Principal',
         status: 'Activo',
         tenantId, // Store tenantId for multi-tenancy reference
         createdAt: new Date()
      });
      await batch.commit();
      
      // Auto-población de BD vinculada al Tenant
      await seedData(tenantId);
      
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Detalle completo del error de Firebase:", err, err.code);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo corporativo ya está registrado. Intenta iniciar sesión.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Error: El inicio de sesión con Correo/Contraseña NO está habilitado en tu consola de Firebase.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Error: El formato del correo electrónico no es válido.');
      } else {
        setError('Error al crear la cuenta: ' + (err.message || err.code));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-text">
      
      {/* Columna Izquierda: Branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-surface/80 p-12 relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute -left-1/4 -bottom-1/4 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-neon-blue">
              <Package size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Velox B2B</span>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-6">
            Toma el control absoluto de tus operaciones logísticas.
          </h2>
          <p className="text-textMuted text-lg mb-12 max-w-md">
            Lleva al siguiente nivel las entregas de tu {organizationType.toLowerCase()} operando en nuestra arquitectura multi-tenant de alto rendimiento.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surfaceHover border border-white/10">
                <CheckCircle2 size={24} className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-text">Monitoreo Multi-Tenant</h4>
                <p className="text-sm text-textMuted text-balance">Datos aislados y seguros usando tu propio Tenant ID.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surfaceHover border border-white/10">
                <ShieldCheck size={24} className="text-success" />
              </div>
              <div>
                <h4 className="font-semibold text-text">Base de Datos Dedicada</h4>
                <p className="text-sm text-textMuted text-balance">Módulo CRUD en tiempo real para Pedidos y Choferes.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12 bg-surfaceHover/50 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
          <p className="text-sm text-textMuted italic mb-4 text-balance">"La nueva separación de empresas nos permite gestionar nuestras tres sucursales independientes en Velox sin cruzar información."</p>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">CT</div>
             <div>
               <p className="text-sm font-bold text-text">Carlos Torres</p>
               <p className="text-xs text-textMuted">Director Logístico, EnvialoYa</p>
             </div>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Formulario */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-md">
          
          <div className="mb-10 lg:hidden text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-neon-blue mb-4">
              <Package size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text">Velox B2B</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-text">Comienza Ahora</h2>
            <p className="mt-2 text-textMuted">Configura la cuenta madre de tu organización.</p>
          </div>

          <div className="flex gap-2 mb-8">
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${step >= 1 ? 'bg-primary shadow-neon-blue' : 'bg-white/10'}`}></div>
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${step >= 2 ? 'bg-primary' : 'bg-white/10'}`}></div>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 flex items-center gap-2 rounded-xl bg-danger/10 p-3 border border-danger/20 text-danger text-sm font-medium"
              >
                <AlertCircle size={16} className="shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textMuted">Nombre Comercial</label>
                  <div className="group relative">
                    <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textMuted transition-colors group-focus-within:text-primary" />
                    <input
                      type="text"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-surface/40 py-3 pl-10 pr-4 text-text placeholder:text-textMuted/50 focus:border-primary/50 focus:bg-surface/80 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                      placeholder="Ej. Distribuidora del Norte S.A."
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textMuted">Tipo de Organización</label>
                  <div className="group relative">
                    <Briefcase className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textMuted transition-colors group-focus-within:text-primary z-10 pointer-events-none" />
                    <select
                      value={organizationType}
                      onChange={e => setOrganizationType(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-white/10 bg-surface/40 py-3 pl-10 pr-4 text-text focus:border-primary/50 focus:bg-surface/80 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium cursor-pointer"
                    >
                      <option value="E-commerce">E-commerce / Retail</option>
                      <option value="Restaurante">Restaurante / F&B</option>
                      <option value="Operador Logístico">Operador Logístico 3PL</option>
                      <option value="Servicios Profesionales">Servicios Profesionales de Campo</option>
                      <option value="Farmacia">Farmacia / Salud</option>
                      <option value="Otro">Otro sector...</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="h-4 w-4 text-textMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textMuted">Tu Nombre y Apellido</label>
                  <div className="group relative">
                    <UserIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textMuted transition-colors group-focus-within:text-primary" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-surface/40 py-3 pl-10 pr-4 text-text placeholder:text-textMuted/50 focus:border-primary/50 focus:bg-surface/80 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                      placeholder="Administrador Principal"
                    />
                  </div>
                </div>

                <Button type="button" onClick={() => validateStep() !== "error-handled" && null} className="w-full mt-4 font-bold shadow-neon-blue" size="lg">
                  Continuar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textMuted">Correo de Acceso (Admin)</label>
                  <div className="group relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textMuted transition-colors group-focus-within:text-primary" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-surface/40 py-3 pl-10 pr-4 text-text placeholder:text-textMuted/50 focus:border-primary/50 focus:bg-surface/80 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                      placeholder="admin@empresa.com"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-textMuted">Contraseña Maestra</label>
                    <span className={`text-xs font-semibold ${getStrengthText() === 'Fuerte' || getStrengthText() === 'Buena' ? 'text-success' : 'text-textMuted'}`}>{getStrengthText()}</span>
                  </div>
                  <div className="group relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textMuted transition-colors group-focus-within:text-primary" />
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-surface/40 py-3 pl-10 pr-4 text-text placeholder:text-textMuted/50 focus:border-primary/50 focus:bg-surface/80 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                      placeholder="Mínimo 8 caracteres, números..."
                    />
                  </div>
                  {password.length > 0 && (
                    <div className="flex gap-1 h-1.5 mt-2">
                       <div className={`flex-1 rounded-full transition-colors ${strength >= 1 ? getStrengthColor() : 'bg-white/10'}`}></div>
                       <div className={`flex-1 rounded-full transition-colors ${strength >= 2 ? getStrengthColor() : 'bg-white/10'}`}></div>
                       <div className={`flex-1 rounded-full transition-colors ${strength >= 3 ? getStrengthColor() : 'bg-white/10'}`}></div>
                       <div className={`flex-1 rounded-full transition-colors ${strength >= 4 ? getStrengthColor() : 'bg-white/10'}`}></div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textMuted">Confirmar Contraseña</label>
                  <div className="group relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textMuted transition-colors group-focus-within:text-primary" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-surface/40 py-3 pl-10 pr-4 text-text placeholder:text-textMuted/50 focus:border-primary/50 focus:bg-surface/80 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium"
                      placeholder="Repite la contraseña"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 py-2">
                  <div className="relative flex items-center justify-center mt-0.5">
                    <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} className="peer sr-only" id="terms" />
                    <div className="h-5 w-5 rounded-md border border-white/20 bg-surface/40 transition-all peer-checked:bg-primary peer-checked:border-primary"></div>
                    <motion.svg
                      className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  </div>
                  <label htmlFor="terms" className="text-sm text-textMuted leading-snug cursor-pointer select-none">
                    Acepto los <span className="text-primary hover:underline">Términos de Servicio</span>, y autorizo el modelo de separación de datos (Multi-tenant).
                  </label>
                </div>

                <div className="flex gap-3 mt-4">
                  <Button type="button" variant="secondary" onClick={() => {setStep(1); setError('');}} className="px-3" disabled={isLoading}>
                    Atrás
                  </Button>
                  <Button type="submit" className="flex-1 font-bold shadow-neon-blue" isLoading={isLoading}>
                    Activar Organización Privada
                  </Button>
                </div>
              </motion.div>
            )}
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-textMuted">¿Tu empresa ya usa Velox?</span>
            <Link to="/login" className="ml-2 font-semibold text-primary hover:text-primaryHover transition-colors">
              Iniciar Sesión
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
