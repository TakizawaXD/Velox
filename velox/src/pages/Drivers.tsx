import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Star, UserPlus, Phone, MapPin, Navigation,
  Truck, Clock, AlertCircle, Activity
} from 'lucide-react';
import { collection, onSnapshot, query, updateDoc, doc, addDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

const TIPOS_VEHICULO = [
  'Moto (≤ 125cc)', 'Moto (> 125cc)', 'Bicicleta', 'Bicicleta Eléctrica',
  'Cuatrimoto', 'Carro', 'Camioneta', 'Furgón', 'Camión', 'Furgón Refrigerado',
];

const CIUDADES_CO = [
  'Bogotá D.C.', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena de Indias',
  'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué', 'Pasto',
  'Manizales', 'Neiva', 'Villavicencio', 'Armenia', 'Valledupar', 'Montería',
  'Sincelejo', 'Popayán', 'Medellín Área Metro',
];

const LICENCIAS_CO = ['A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'No aplica'];

const ZONAS = [
  'Zona Norte', 'Zona Sur', 'Zona Este', 'Zona Oeste', 'Zona Centro',
  'Ciudad Completa', 'Área Metropolitana', 'Inter-municipal', 'Nacional',
];

const inputCls = 'w-full rounded-xl border border-white/10 bg-surface/60 py-2.5 px-3 text-sm text-text placeholder:text-textMuted/60 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all';
const labelCls = 'block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1.5';

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={labelCls}>{label}</label>{children}</div>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="h-px flex-1 bg-white/5" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-textMuted/60">{children}</span>
      <div className="h-px flex-1 bg-white/5" />
    </div>
  );
}

const emptyDriver = {
  name: '', cedula: '', phone: '',
  vehicleType: '', plate: '', licenseCategory: 'A2',
  city: 'Bogotá D.C.', zone: 'Ciudad Completa',
  emergencyContact: '', emergencyPhone: '', notes: '',
};

export function Drivers() {
  const { currentUser } = useAuth();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDriver, setNewDriver] = useState(emptyDriver);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'drivers'), where('tenantId', '==', currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      setDrivers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setIsLoading(false);
    });
    return unsub;
  }, [currentUser]);

  const handleToggleStatus = async (driver: any) => {
    try {
      const newStatus = driver.status === 'Offline' ? 'Disponible' : 'Offline';
      await updateDoc(doc(db, 'drivers', driver.id), { status: newStatus });
    } catch (e) { console.error(e); }
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsCreating(true);
    try {
      await addDoc(collection(db, 'drivers'), {
        ...newDriver,
        vehicle: `${newDriver.vehicleType} · ${newDriver.plate}`,
        status: 'Disponible',
        rating: 5.0,
        deliveries: 0,
        x: Math.floor(Math.random() * 70) + 15,
        y: Math.floor(Math.random() * 70) + 15,
        tenantId: currentUser.uid,
        createdAt: new Date(),
      });
      setIsModalOpen(false);
      setNewDriver(emptyDriver);
    } catch (err) { console.error(err); }
    finally { setIsCreating(false); }
  };

  const field = (key: keyof typeof emptyDriver) => ({
    value: newDriver[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setNewDriver({ ...newDriver, [key]: e.target.value }),
  });

  const statusColor = (s: string) => s === 'Disponible' ? 'text-success' : s === 'Entregando' ? 'text-primary' : 'text-textMuted';
  const statusBg = (s: string) => s === 'Disponible' ? 'bg-success' : s === 'Entregando' ? 'bg-primary' : 'bg-textMuted/30';

  const stats = {
    total: drivers.length,
    online: drivers.filter(d => d.status !== 'Offline').length,
    delivering: drivers.filter(d => d.status === 'Entregando').length,
    avgRating: drivers.length ? (drivers.reduce((a, d) => a + (d.rating || 0), 0) / drivers.length).toFixed(1) : '0',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">Flota de Repartidores</h1>
          <p className="text-textMuted text-sm">Gestión de conductores y mensajeros en Colombia</p>
        </div>
        <Button className="shadow-neon-blue gap-2 w-fit" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={16} /> Añadir Repartidor
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Flota', value: stats.total, icon: Truck, color: 'text-primary' },
          { label: 'En Línea', value: stats.online, icon: Navigation, color: 'text-success' },
          { label: 'Entregando', value: stats.delivering, icon: Clock, color: 'text-warning' },
          { label: 'Rating Prom.', value: `⭐ ${stats.avgRating}`, icon: Star, color: 'text-yellow-400' },
        ].map(k => (
          <Card key={k.label} className="glass-card p-4">
            <p className="text-xs text-textMuted mb-1">{k.label}</p>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
          </Card>
        ))}
      </div>

      {/* Grid de Repartidores */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-textMuted gap-4">
          <Activity className="animate-spin text-primary" size={32} />
          <p className="font-bold tracking-widest uppercase text-xs">Sincronizando Flota Live...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {drivers.map((driver, i) => (
              <motion.div
                key={driver.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card 
                  className="glass-panel hover:border-primary/30 transition-all group overflow-hidden cursor-pointer p-0 relative" 
                  onClick={() => setSelectedDriver(driver)}
                >
                  {/* Status Indicator Bar */}
                  <div className={`h-1 w-full ${statusBg(driver.status)} opacity-80`} />
                  
                  <div className="p-6">
                    {/* Cabecera */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface flex items-center justify-center border-2 border-white/5 group-hover:border-primary/20 transition-all shadow-xl">
                            <span className="text-2xl font-black text-text/80">
                              {driver.name?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[#09090b] ${statusBg(driver.status)} shadow-lg`} />
                        </div>
                        <div>
                          <h3 className="font-black text-text text-lg leading-tight truncate max-w-[140px]">{driver.name}</h3>
                          <div className="flex items-center text-xs font-bold text-textMuted gap-2 mt-1">
                            <span className="flex items-center gap-1 text-yellow-400">
                              <Star size={12} className="fill-yellow-400" />
                              {driver.rating || 5.0}
                            </span>
                            <span className="opacity-20">|</span>
                            <span>{driver.deliveries || 0} envíos</span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={driver.status === 'Disponible' ? 'success' : driver.status === 'Offline' ? 'default' : 'primary'}
                        className={`text-[10px] font-black tracking-widest uppercase px-2 shadow-sm ${driver.status === 'Entregando' ? 'animate-pulse' : ''}`}
                      >
                        {driver.status}
                      </Badge>
                    </div>

                    {/* Stats mini grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mb-1">Vehículo</p>
                        <p className="text-xs font-bold text-text truncate">{driver.vehicle?.split('·')[0] || driver.vehicleType}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mb-1">Placa</p>
                        <p className="text-xs font-bold text-primary tracking-widest">{driver.plate || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-xs text-textMuted">
                        <MapPin size={14} className="text-primary/60" />
                        <span className="font-medium">{driver.city} · <span className="text-text/60 italic">{driver.zone}</span></span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-textMuted">
                        <Phone size={14} className="text-primary/60" />
                        <span className="font-medium">{driver.phone || 'Sin contacto'}</span>
                      </div>
                    </div>

                    {/* Acciones Rápidas en Card */}
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <Button variant="outline" className="flex-1 text-[11px] font-black uppercase tracking-wider rounded-xl h-10 gap-2 border-white/10 hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all">
                        <Navigation size={14} /> Rastrear
                      </Button>
                      <button
                        onClick={() => handleToggleStatus(driver)}
                        className={`px-4 rounded-xl font-bold text-xs transition-all ${
                          driver.status === 'Offline' 
                          ? 'bg-primary text-white shadow-neon-blue' 
                          : 'bg-white/5 text-textMuted hover:bg-white/10'
                        }`}
                      >
                        {driver.status === 'Offline' ? 'Activar' : 'Cerrar'}
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {drivers.length === 0 && (
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-20 bg-surfaceHover/20 rounded-2xl border border-dashed border-white/10">
              <div className="mx-auto w-16 h-16 bg-surfaceHover rounded-full flex items-center justify-center mb-4">
                <Truck size={28} className="text-textMuted" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Flota Vacía</h3>
              <p className="text-textMuted text-sm max-w-sm mx-auto mb-6">
                Registra tu primer repartidor para comenzar a asignar pedidos en Colombia.
              </p>
              <Button onClick={() => setIsModalOpen(true)} className="shadow-neon-blue gap-2">
                <UserPlus size={16} /> Registrar Primer Conductor
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ===================== MODAL DETALLE ===================== */}
      <Modal isOpen={!!selectedDriver} onClose={() => setSelectedDriver(null)} title="Perfil del Repartidor">
        {selectedDriver && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-white/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white shadow-neon-blue">
                {selectedDriver.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-text">{selectedDriver.name}</h3>
                <div className={`flex items-center gap-1.5 text-sm ${statusColor(selectedDriver.status)}`}>
                  <span className={`w-2 h-2 rounded-full ${statusBg(selectedDriver.status)}`} />
                  {selectedDriver.status}
                </div>
              </div>
              <div className="ml-auto text-right">
                <div className="flex items-center gap-1 justify-end">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-xl font-bold text-text">{selectedDriver.rating || 5.0}</span>
                </div>
                <p className="text-xs text-textMuted">{selectedDriver.deliveries || 0} entregas</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { l: 'Cédula de Ciudadanía', v: selectedDriver.cedula || '-' },
                { l: 'Teléfono', v: selectedDriver.phone || '-' },
                { l: 'Tipo de Vehículo', v: selectedDriver.vehicleType || selectedDriver.vehicle || '-' },
                { l: 'Placa', v: selectedDriver.plate || '-' },
                { l: 'Licencia de Conducción', v: selectedDriver.licenseCategory || '-' },
                { l: 'Ciudad Base', v: selectedDriver.city || '-' },
                { l: 'Zona de Cobertura', v: selectedDriver.zone || '-' },
                { l: 'Contacto Emergencia', v: selectedDriver.emergencyContact || '-' },
                { l: 'Tel. Emergencia', v: selectedDriver.emergencyPhone || '-' },
              ].map(({ l, v }) => (
                <div key={l} className="bg-surfaceHover/40 rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] text-textMuted uppercase tracking-wider mb-0.5">{l}</p>
                  <p className="font-medium text-sm text-text">{v}</p>
                </div>
              ))}
            </div>

            {selectedDriver.notes && (
              <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                <p className="text-[10px] text-primary uppercase tracking-wider mb-1">Notas</p>
                <p className="text-sm text-text">{selectedDriver.notes}</p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant={selectedDriver.status === 'Offline' ? 'primary' : 'secondary'}
                className="flex-1"
                onClick={() => { handleToggleStatus(selectedDriver); setSelectedDriver(null); }}
              >
                {selectedDriver.status === 'Offline' ? '✓ Activar Repartidor' : 'Poner Offline'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ===================== MODAL NUEVO REPARTIDOR ===================== */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Nuevo Repartidor">
        <form onSubmit={handleCreateDriver} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <SectionTitle>👤 Datos Personales</SectionTitle>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldGroup label="Nombre Completo *">
              <input required className={inputCls} placeholder="Ej. Andrés Felipe García" {...field('name')} />
            </FieldGroup>
            <FieldGroup label="Cédula de Ciudadanía *">
              <input required className={inputCls} placeholder="Ej. 1020304050" {...field('cedula')} />
            </FieldGroup>
            <FieldGroup label="Teléfono Celular *">
              <input required className={inputCls} type="tel" placeholder="+57 310 000 0000" {...field('phone')} />
            </FieldGroup>
            <FieldGroup label="Ciudad Base *">
              <select required className={inputCls} {...field('city')}>
                {CIUDADES_CO.map(c => <option key={c}>{c}</option>)}
              </select>
            </FieldGroup>
          </div>

          <SectionTitle>🚗 Datos del Vehículo</SectionTitle>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldGroup label="Tipo de Vehículo *">
              <select required className={inputCls} {...field('vehicleType')}>
                <option value="">Seleccionar...</option>
                {TIPOS_VEHICULO.map(t => <option key={t}>{t}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Placa del Vehículo">
              <input
                className={inputCls + ' uppercase'}
                placeholder="Ej. ABC 123"
                {...field('plate')}
                onChange={e => setNewDriver({ ...newDriver, plate: e.target.value.toUpperCase() })}
              />
            </FieldGroup>
            <FieldGroup label="Categoría de Licencia *">
              <select required className={inputCls} {...field('licenseCategory')}>
                {LICENCIAS_CO.map(l => <option key={l}>{l}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Zona de Cobertura *">
              <select required className={inputCls} {...field('zone')}>
                {ZONAS.map(z => <option key={z}>{z}</option>)}
              </select>
            </FieldGroup>
          </div>

          <SectionTitle>📞 Contacto de Emergencia</SectionTitle>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldGroup label="Nombre del Contacto">
              <input className={inputCls} placeholder="Ej. María García (mamá)" {...field('emergencyContact')} />
            </FieldGroup>
            <FieldGroup label="Teléfono de Emergencia">
              <input className={inputCls} type="tel" placeholder="+57 311 000 0000" {...field('emergencyPhone')} />
            </FieldGroup>
            <div className="sm:col-span-2">
              <FieldGroup label="Notas / Observaciones">
                <textarea
                  className={inputCls + ' resize-none h-16'}
                  placeholder="Ej. Solo disponible lunes a sábado, conoce bien el sur de Bogotá"
                  value={newDriver.notes}
                  onChange={e => setNewDriver({ ...newDriver, notes: e.target.value })}
                />
              </FieldGroup>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex gap-2 text-xs text-textMuted">
            <AlertCircle size={14} className="text-primary shrink-0 mt-0.5" />
            Al registrar un repartidor confirmas que verificaste su documentación (cédula, SOAT, Tecnomecánica) según normativa Colombia.
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isCreating} className="shadow-neon-blue gap-2">
              <UserPlus size={15} /> Registrar en Flota
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
