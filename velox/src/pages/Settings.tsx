import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Globe, Bell, Shield, User as UserIcon,
  Building2, Mail, Phone, CheckCircle2, AlertCircle, LogOut, KeyRound,
  FileText, MapPin, ExternalLink, Info, CreditCard, Laptop, Trash2
} from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential, signOut } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

type Tab = 'perfil' | 'organizacion' | 'notificaciones' | 'seguridad' | 'facturacion';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'perfil', label: 'Mi Perfil', icon: UserIcon },
  { id: 'organizacion', label: 'Organización', icon: Building2 },
  { id: 'facturacion', label: 'Facturación', icon: CreditCard },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
  { id: 'seguridad', label: 'Seguridad', icon: Shield },
];

function SettingField({ label, children, hint, required }: { label: string; children: React.ReactNode; hint?: string; required?: boolean }) {
  return (
    <div className="space-y-1.5 flex flex-col">
      <label className="text-sm font-bold text-text/80 flex items-center gap-1.5">
        {label} {required && <span className="text-primary">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-textMuted/60 flex items-center gap-1"><Info size={10} /> {hint}</p>}
    </div>
  );
}

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      type="button"
      id={id}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-primary' : 'bg-white/10'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}

export function Settings() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('perfil');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Perfil state
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Organización state
  const [company, setCompany] = useState('');
  const [brandName, setBrandName] = useState('');
  const [nit, setNit] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [orgType, setOrgType] = useState('');
  const [role, setRole] = useState('');

  // Notificaciones state
  const [notifPedidos, setNotifPedidos] = useState(true);
  const [notifFlota, setNotifFlota] = useState(true);
  const [notifReportes, setNotifReportes] = useState(false);
  const [notifEmail, setNotifEmail] = useState(true);

  // Seguridad state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [secError, setSecError] = useState('');

  // Perfil completeness
  const [completeness, setCompleteness] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    setEmail(currentUser.email || '');
    setDisplayName(currentUser.displayName || '');

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setPhone(data.phone || '');
          setCompany(data.company || '');
          setBrandName(data.brandName || data.company || '');
          setNit(data.nit || '');
          setAddress(data.address || '');
          setWebsite(data.website || '');
          setSupportEmail(data.supportEmail || '');
          setOrgType(data.organizationType || '');
          setRole(data.role || '');
          setNotifPedidos(data.notifPedidos ?? true);
          setNotifFlota(data.notifFlota ?? true);
          setNotifReportes(data.notifReportes ?? false);
          setNotifEmail(data.notifEmail ?? true);

          // Calculate completeness simple logic
          const fields = [data.phone, data.company, data.nit, data.address, data.website];
          const filled = fields.filter(f => f && f.length > 0).length;
          setCompleteness(Math.round((filled / fields.length) * 100));
        }
      } catch {
        console.warn('Settings: Firestore offline.');
      }
    };
    fetchUserData();
  }, [currentUser]);

  const showStatus = (status: 'success' | 'error') => {
    setSaveStatus(status);
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleSavePerfil = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      await updateProfile(currentUser, { displayName });
      await updateDoc(doc(db, 'users', currentUser.uid), { name: displayName, phone });
      showStatus('success');
    } catch {
      showStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveOrg = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        company,
        brandName: brandName || company,
        nit,
        address,
        website,
        supportEmail,
        organizationType: orgType,
      });
      showStatus('success');
    } catch {
      showStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotif = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { notifPedidos, notifFlota, notifReportes, notifEmail });
      showStatus('success');
    } catch {
      showStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setSecError('');
    if (!currentUser || !currentUser.email) return;
    if (newPassword !== confirmNewPassword) { setSecError('Las contraseñas nuevas no coinciden.'); return; }
    if (newPassword.length < 6) { setSecError('La nueva contraseña debe tener al menos 6 caracteres.'); return; }
    setIsSaving(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
      showStatus('success');
    } catch {
      setSecError('Contraseña actual incorrecta. Verifica e intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut(auth);
    navigate('/login');
  };

  const inputClass = "w-full rounded-xl border border-white/10 bg-surface/50 py-3 px-4 text-text placeholder:text-textMuted/40 focus:border-primary/50 focus:bg-surface focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all font-medium text-sm shadow-sm";

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20 px-4 sm:px-0">
      
      {/* Dynamic Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-white/5 pb-10">
        <div className="space-y-2">
          <Badge variant="primary" className="mb-2">Centro de Configuración</Badge>
          <h1 className="text-4xl font-black text-text tracking-tight">Preferencias del Sistema</h1>
          <p className="text-textMuted text-base max-w-xl font-medium">
            Control total sobre tu experiencia en <span className="text-primary">Velox</span>. Gestiona identidad, flota y seguridad.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <AnimatePresence mode="wait">
            {saveStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-success text-sm font-bold bg-success/10 px-4 py-2.5 rounded-2xl border border-success/20"
              >
                <CheckCircle2 size={16} /> Cambios Aplicados
              </motion.div>
            )}
            {saveStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-danger text-sm font-bold bg-danger/10 px-4 py-2.5 rounded-2xl border border-danger/20"
              >
                <AlertCircle size={16} /> Error en Sincronización
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            className="gap-2 text-danger hover:bg-danger/10 py-2.5 px-5 rounded-2xl font-bold"
            onClick={handleLogout}
            isLoading={isLoggingOut}
          >
            <LogOut size={18} /> Salir del Sistema
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Navigation Sidebar (Floating feeling) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-surfaceHover/20 rounded-[32px] p-6 border border-white/5 flex flex-col items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-primary to-accent p-1.5 shadow-neon-blue group-hover:rotate-6 transition-transform">
                <div className="w-full h-full rounded-[24px] bg-surface flex items-center justify-center text-3xl font-black text-white">
                  {displayName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-success h-6 w-6 rounded-full border-4 border-[#09090b] shadow-lg" />
            </div>
            
            <div className="text-center mt-6 space-y-1">
              <p className="font-black text-text text-xl">{displayName || 'Usuario Velox'}</p>
              <p className="text-xs text-textMuted font-bold uppercase tracking-widest">{role || 'Administrador'}</p>
              <p className="text-sm text-textMuted/60 mt-1 truncate max-w-[200px]">{email}</p>
            </div>

            {/* Profile Progress */}
            <div className="w-full mt-8 space-y-3">
              <div className="flex justify-between text-[11px] font-bold text-textMuted uppercase tracking-widest">
                <span>Perfil completado</span>
                <span className="text-primary">{completeness}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${completeness}%` }}
                  className="h-full bg-primary shadow-neon-blue rounded-full"
                />
              </div>
              <p className="text-[10px] text-textMuted/60 leading-relaxed text-center">
                Completa los datos de tu organización para mejorar tu posicionamiento en el mapa.
              </p>
            </div>
          </div>

          <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 p-1 custom-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 px-5 py-4 text-sm font-bold rounded-[20px] transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-neon-blue'
                    : 'text-textMuted hover:bg-white/5 hover:text-text'
                }`}
              >
                <tab.icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            
            {/* === TAB: PERFIL === */}
            {activeTab === 'perfil' && (
              <motion.div 
                key="perfil" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
              >
                <Card className="p-8 border-white/5 bg-surface/40 backdrop-blur-md rounded-[32px] space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-3xl bg-primary/10 text-primary">
                      <UserIcon size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-text tracking-tight">Identidad del Gestor</h2>
                      <p className="text-sm text-textMuted font-medium">Controladores personificados de la plataforma.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SettingField label="Nombre para Mostrar" required hint="Cómo te verán los repartidores en sus apps.">
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
                        <input
                          type="text"
                          className={inputClass + ' pl-10'}
                          value={displayName}
                          onChange={e => setDisplayName(e.target.value)}
                          placeholder="Tu nombre completo"
                        />
                      </div>
                    </SettingField>

                    <SettingField label="Número Celular" hint="Para contacto directo en urgencias.">
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
                        <input
                          type="tel"
                          className={inputClass + ' pl-10'}
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+57 321 000 0000"
                        />
                      </div>
                    </SettingField>

                    <div className="md:col-span-2">
                      <SettingField label="Correo Electrónico (Principal)" hint="Utilizado para inicio de sesión y recuperación.">
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
                          <input
                            type="email"
                            className={inputClass + ' pl-10 opacity-50 cursor-not-allowed'}
                            value={email}
                            disabled
                          />
                          <Badge variant="default" className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black">LOGIN ID</Badge>
                        </div>
                      </SettingField>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-xs text-textMuted/60 leading-tight max-w-sm">
                      Velox protege tus datos bajo la ley de protección de datos personales. Ninguna información es compartida con terceros.
                    </p>
                    <Button onClick={handleSavePerfil} isLoading={isSaving} className="shadow-neon-blue px-10 rounded-2xl h-14 font-black">
                      Actualizar Identidad
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* === TAB: ORGANIZACIÓN === */}
            {activeTab === 'organizacion' && (
              <motion.div key="organizacion" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-6">
                <Card className="p-8 border-white/5 bg-surface/40 backdrop-blur-md rounded-[32px] space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-3xl bg-amber-400/10 text-amber-400">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-text tracking-tight">Core Empresarial</h2>
                      <p className="text-sm text-textMuted font-medium">Configura los cimientos de tu hub logístico.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SettingField label="Razón Social" required>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
                        <input
                          type="text"
                          className={inputClass + ' pl-10'}
                          value={company}
                          onChange={e => setCompany(e.target.value)}
                          placeholder="Nombre legal de la empresa"
                        />
                      </div>
                    </SettingField>

                    <SettingField label="NIT / RUT" required hint="Requerido para facturación electrónica.">
                      <div className="relative">
                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
                        <input
                          type="text"
                          className={inputClass + ' pl-10'}
                          value={nit}
                          onChange={e => setNit(e.target.value)}
                          placeholder="Ej: 900.123.456-7"
                        />
                      </div>
                    </SettingField>

                    <div className="md:col-span-2">
                      <SettingField label="Nombre Exclusivo de Marca (Sidebar)" hint="Este es el nombre que se verá en el menú lateral de Velox.">
                        <input
                          type="text"
                          className={inputClass}
                          value={brandName}
                          onChange={e => setBrandName(e.target.value)}
                          placeholder="Ej: Velox Plus, LogísticaExpress"
                        />
                      </SettingField>
                    </div>

                    <div className="md:col-span-2">
                      <SettingField label="Dirección Operativa Principal" required>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
                          <input
                            type="text"
                            className={inputClass + ' pl-10'}
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            placeholder="Ej: Carrera 7 # 100 - 01, Bogotá"
                          />
                        </div>
                      </SettingField>
                    </div>

                    <SettingField label="Sitio Web / Catálogo" hint="Mostrar a clientes en recibos digitales.">
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
                        <input
                          type="url"
                          className={inputClass + ' pl-10'}
                          value={website}
                          onChange={e => setWebsite(e.target.value)}
                          placeholder="https://tuempresa.com"
                        />
                      </div>
                    </SettingField>

                    <SettingField label="Email de Soporte" hint="Dónde tus clientes pueden pedir ayuda.">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
                        <input
                          type="email"
                          className={inputClass + ' pl-10'}
                          value={supportEmail}
                          onChange={e => setSupportEmail(e.target.value)}
                          placeholder="soporte@tuempresa.co"
                        />
                      </div>
                    </SettingField>
                  </div>

                  <div className="bg-primary/5 rounded-[24px] p-6 border border-primary/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex gap-4">
                      <CreditCard className="text-primary shrink-0" size={24} />
                      <div>
                        <p className="text-sm font-black text-text">Facturación Activa</p>
                        <p className="text-xs text-textMuted mt-1">Tu plan SaaS expira en <span className="text-primary font-bold">24 días</span>.</p>
                      </div>
                    </div>
                    <Button variant="outline" className="rounded-xl font-bold h-11 px-6 text-xs gap-2">
                      Gestionar Plan <ExternalLink size={14} />
                    </Button>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex justify-end">
                    <Button onClick={handleSaveOrg} isLoading={isSaving} className="shadow-neon-blue px-10 rounded-2xl h-14 font-black">
                      Confirmar Datos de Empresa
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* === TAB: NOTIFICACIONES === */}
            {activeTab === 'notificaciones' && (
              <motion.div key="notificaciones" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}>
                <Card className="p-8 border-white/5 bg-surface/40 backdrop-blur-md rounded-[32px] space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-3xl bg-primary/10 text-primary">
                      <Bell size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-text tracking-tight">Centro de Alertas</h2>
                      <p className="text-sm text-textMuted font-medium">Controla cómo y cuándo Velox te comunica eventos críticos.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {[
                      { id: 'pedidos', label: 'Nuevos Pedidos', desc: 'Recibir alertas inmediatas cuando un cliente genere un despacho.', value: notifPedidos, set: setNotifPedidos },
                      { id: 'flota', label: 'Incidencias de Flota', desc: 'Notificar si un repartidor se desconecta o tiene retrasos.', value: notifFlota, set: setNotifFlota },
                      { id: 'reportes', label: 'Reportes de Rendimiento', desc: 'Resumen diario de métricas operativas al cierre.', value: notifReportes, set: setNotifReportes },
                      { id: 'email', label: 'Comunicaciones via Email', desc: 'Enviar duplicados de alertas críticas a tu buzón principal.', value: notifEmail, set: setNotifEmail },
                    ].map((item, i) => (
                      <div key={item.id} className={`flex items-center justify-between py-5 ${i > 0 ? 'border-t border-white/5' : ''}`}>
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-text leading-tight">{item.label}</h4>
                          <p className="text-xs text-textMuted max-w-[280px] leading-relaxed">{item.desc}</p>
                        </div>
                        <Toggle id={item.id} checked={item.value} onChange={item.set} />
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-white/5 flex justify-end">
                    <Button onClick={handleSaveNotif} isLoading={isSaving} className="shadow-neon-blue px-10 rounded-2xl h-14 font-black">
                      Sincronizar Alertas
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* === TAB: SEGURIDAD === */}
            {activeTab === 'seguridad' && (
              <motion.div key="seguridad" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <Card className="p-8 border-white/5 bg-surface/40 backdrop-blur-md rounded-[32px] space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-3xl bg-danger/10 text-danger">
                      <Shield size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-text tracking-tight">Protocolos de Seguridad</h2>
                      <p className="text-sm text-textMuted font-medium">Bóveda de acceso y blindaje de credenciales.</p>
                    </div>
                  </div>

                  {secError && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 rounded-2xl bg-danger/10 p-4 border border-danger/20 text-danger text-sm font-bold">
                      <AlertCircle size={18} className="shrink-0" />
                      {secError}
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 gap-6 max-w-md">
                    <SettingField label="Contraseña Actual" required>
                      <input
                        type="password"
                        className={inputClass}
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </SettingField>
                    
                    <div className="h-px bg-white/5 my-2" />

                    <SettingField label="Nueva Contraseña" required hint="Mínimo 8 caracteres, incluye números y símbolos.">
                      <input
                        type="password"
                        className={inputClass}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Nueva bóveda de acceso"
                      />
                    </SettingField>

                    <SettingField label="Confirmar Cambio" required>
                      <input
                        type="password"
                        className={inputClass}
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        placeholder="Validar nueva contraseña"
                      />
                    </SettingField>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-white/5">
                    <Button onClick={handleChangePassword} isLoading={isSaving} className="shadow-neon-blue px-8 rounded-2xl h-14 font-black gap-2">
                       <KeyRound size={18} /> Reestablecer Credenciales
                    </Button>
                  </div>
                </Card>

                <Card className="p-8 border-danger/10 bg-danger/[0.02] rounded-[32px] space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-danger uppercase tracking-wider">Zona de Blindaje</h3>
                    <p className="text-sm text-textMuted font-medium italic">Acciones de alto riesgo con impacto estructural.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 rounded-3xl bg-danger/5 border border-danger/10">
                    <div>
                      <h4 className="font-black text-text flex items-center gap-2">
                        <Trash2 size={16} className="text-danger" /> Eliminación de Organización
                      </h4>
                      <p className="text-xs text-textMuted mt-1 leading-relaxed max-w-sm">
                        Esto borrará permanentemente todos tus clientes, repartidores y registros de Firestore. Esta acción no tiene reversa.
                      </p>
                    </div>
                    <Button variant="danger" className="rounded-xl font-black py-4 px-6 h-auto text-xs whitespace-nowrap">
                      ELIMINAR TODO EL TENANT
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Placeholder for missing tabs */}
             {['facturacion', 'notificaciones'].includes(activeTab) && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                 <Card className="p-20 border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-4">
                   <div className="p-6 rounded-full bg-white/5 text-textMuted">
                     <Laptop size={48} className="opacity-20" />
                   </div>
                   <h3 className="text-xl font-bold text-text">Módulo en Desarrollo</h3>
                   <p className="text-sm text-textMuted max-w-xs">Estamos optimizando esta sección para que cumpla con los estándares de Velox v2.</p>
                   <Button variant="outline" onClick={() => setActiveTab('perfil')} className="rounded-xl font-bold">Volver al Perfil</Button>
                 </Card>
               </motion.div>
             )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
