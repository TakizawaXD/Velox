import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Star, UserPlus, Navigation,
  Truck, Clock, Activity, Edit2, Trash2, Search
} from 'lucide-react';
import { collection, onSnapshot, query, updateDoc, doc, addDoc, where, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

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
  points: 0, 
  maintenanceKm: 0,
  lastMaintenance: new Date().toISOString().split('T')[0],
};

export function Drivers() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDriver, setNewDriver] = useState(emptyDriver);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);

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
      toast.success(`Repartidor ${newStatus}`);
    } catch (e) { console.error(e); }
  };

  const handleDeleteDriver = async (e: React.MouseEvent, driverId: string) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de eliminar este repartidor?')) return;
    try {
      await deleteDoc(doc(db, 'drivers', driverId));
      toast.success('Repartidor eliminado');
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar repartidor');
    }
  };

  const handleOpenEditModal = (e: React.MouseEvent, driver: any) => {
    e.stopPropagation();
    setNewDriver({
      name: driver.name || '',
      cedula: driver.cedula || '',
      phone: driver.phone || '',
      vehicleType: driver.vehicleType || '',
      plate: driver.plate || '',
      licenseCategory: driver.licenseCategory || 'A2',
      city: driver.city || 'Bogotá D.C.',
      zone: driver.zone || 'Ciudad Completa',
      emergencyContact: driver.emergencyContact || '',
      emergencyPhone: driver.emergencyPhone || '',
      notes: driver.notes || '',
      points: driver.points || 0,
      maintenanceKm: driver.maintenanceKm || 0,
      lastMaintenance: driver.lastMaintenance || new Date().toISOString().split('T')[0],
    });
    setSelectedDriver(driver);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsCreating(true);
    try {
      if (isEditing && selectedDriver) {
        await updateDoc(doc(db, 'drivers', selectedDriver.id), {
          ...newDriver,
          vehicle: `${newDriver.vehicleType} · ${newDriver.plate}`,
          updatedAt: new Date(),
        });
        toast.success('Información actualizada');
      } else {
        await addDoc(collection(db, 'drivers'), {
          ...newDriver,
          vehicle: `${newDriver.vehicleType} · ${newDriver.plate}`,
          status: 'Disponible',
          rating: 5.0,
          deliveries: 0,
          x: Math.floor(Math.random() * 70) + 15,
          y: Math.floor(Math.random() * 70) + 15,
          points: 0,
          maintenanceKm: 0,
          lastMaintenance: new Date().toISOString().split('T')[0],
          tenantId: currentUser.uid,
          createdAt: new Date(),
        });
        toast.success('Repartidor registrado');
      }
      setIsModalOpen(false);
      setNewDriver(emptyDriver);
      setIsEditing(false);
      setSelectedDriver(null);
    } catch (err) { 
      console.error(err); 
      toast.error('Error al guardar datos');
    }
    finally { setIsCreating(false); }
  };

  const field = (key: keyof typeof emptyDriver) => ({
    value: newDriver[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setNewDriver({ ...newDriver, [key]: e.target.value }),
  });

  const statusBg = (s: string) => s === 'Disponible' ? 'bg-success' : s === 'Entregando' ? 'bg-primary' : 'bg-textMuted/30';

  const stats = {
    total: drivers.length,
    online: drivers.filter(d => d.status !== 'Offline').length,
    delivering: drivers.filter(d => d.status === 'Entregando').length,
    avgRating: drivers.length ? (drivers.reduce((a, d) => a + (d.rating || 0), 0) / drivers.length).toFixed(1) : '0',
  };

  const filteredDrivers = drivers.filter(d => 
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">Flota de Repartidores</h1>
          <p className="text-textMuted text-sm font-medium">Gestión de conductores y mensajeros en Colombia</p>
        </div>
        <Button className="shadow-neon-blue gap-2" onClick={() => { setIsEditing(false); setNewDriver(emptyDriver); setIsModalOpen(true); }}>
          <UserPlus size={16} /> Añadir Repartidor
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
        <input
          type="text"
          placeholder="Buscar por nombre, placa o ciudad..."
          className="w-full bg-surface border border-white/10 text-sm text-text placeholder:text-textMuted rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary/50"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
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
            {filteredDrivers.map((driver, i) => (
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
                  <div className={`h-1 w-full ${statusBg(driver.status)} opacity-80`} />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface flex items-center justify-center border-2 border-white/5 group-hover:border-primary/20 transition-all shadow-xl font-black text-text/80 text-2xl">
                          {driver.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-black text-text text-lg leading-tight truncate max-w-[140px]">{driver.name}</h3>
                          <div className="flex items-center text-xs font-bold text-textMuted gap-2 mt-1">
                            <span className="flex items-center gap-1 text-yellow-400"><Star size={12} className="fill-yellow-400" /> {driver.rating || 5.0}</span>
                            <span className="opacity-20">|</span>
                            <span>{driver.deliveries || 0} envíos</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={driver.status === 'Disponible' ? 'success' : driver.status === 'Offline' ? 'default' : 'primary'}>
                        {driver.status}
                      </Badge>
                    </div>

                    {/* Optimization Metrics */}
                    <div className="mb-4 flex items-center justify-between px-1">
                       <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-yellow-400/10 flex items-center justify-center text-yellow-500">
                             <Activity size={12} />
                          </div>
                          <span className="text-[11px] font-black text-text uppercase tracking-wider">{driver.points || 0} Puntos Velox</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] text-textMuted font-bold uppercase">Eficiencia</span>
                          <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full bg-primary" style={{ width: `${Math.min((driver.deliveries || 0) * 5, 100)}%` }} />
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mb-1">Vehículo</p>
                        <p className="text-xs font-bold text-text truncate">{driver.vehicleType || '?'}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5 overflow-hidden relative">
                        <p className="text-[10px] text-textMuted font-bold uppercase tracking-widest mb-1">Cuidado Mecánico</p>
                        <div className="flex items-center gap-2">
                           <div className={`h-1.5 flex-1 rounded-full ${ (driver.maintenanceKm || 0) > 4500 ? 'bg-danger' : 'bg-success/50' } overflow-hidden`}>
                              <div className="h-full bg-success" style={{ width: `${Math.max(0, 100 - (driver.maintenanceKm || 0) / 50)}%` }} />
                           </div>
                           <span className="text-[10px] font-bold text-text/60">{(driver.maintenanceKm || 0)}km</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      <Button 
                        variant="outline" 
                        className="flex-1 text-[11px] font-black uppercase tracking-wider rounded-xl h-10 gap-2 border-white/10 hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/map', { state: { selectedDriverId: driver.id } });
                        }}
                      >
                        <Navigation size={14} /> Rastrear
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-primary border border-white/10" onClick={(e) => handleOpenEditModal(e, driver)}>
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-danger border border-white/10" onClick={(e) => handleDeleteDriver(e, driver.id)}>
                        <Trash2 size={16} />
                      </Button>
                      <button onClick={() => handleToggleStatus(driver)} className={`px-4 rounded-xl font-bold text-xs ${driver.status === 'Offline' ? 'bg-primary text-white' : 'bg-white/5 text-textMuted'}`}>
                        {driver.status === 'Offline' ? 'Activar' : 'Cerrar'}
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ===================== MODALES ===================== */}
      <Modal isOpen={!!selectedDriver} onClose={() => setSelectedDriver(null)} title="Perfil del Repartidor">
        {selectedDriver && <div className="space-y-4">
          <div className="p-4 bg-surfaceHover/40 rounded-2xl space-y-2">
            <h3 className="text-xl font-bold text-text">{selectedDriver.name}</h3>
            <p className="text-sm text-textMuted italic">{selectedDriver.city} · {selectedDriver.zone}</p>
            <div className="flex gap-4 pt-2">
               <div className="flex-1 p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                  <p className="text-[10px] text-textMuted uppercase font-bold mb-1">Cédula</p>
                  <p className="text-sm font-bold text-text">{selectedDriver.cedula || '-'}</p>
               </div>
               <div className="flex-1 p-3 bg-white/5 rounded-xl border border-white/5 text-center">
                  <p className="text-[10px] text-textMuted uppercase font-bold mb-1">Teléfono</p>
                  <p className="text-sm font-bold text-text">{selectedDriver.phone || '-'}</p>
               </div>
            </div>
          </div>
        </div>}
      </Modal>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setIsEditing(false); }} title={isEditing ? 'Editar Repartidor' : 'Registrar Nuevo Repartidor'}>
        <form onSubmit={handleCreateDriver} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <SectionTitle>👤 Datos Personales</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldGroup label="Nombre *"><input required className={inputCls} {...field('name')} /></FieldGroup>
            <FieldGroup label="Cédula *"><input required className={inputCls} {...field('cedula')} /></FieldGroup>
            <FieldGroup label="Teléfono *"><input required className={inputCls} type="tel" {...field('phone')} /></FieldGroup>
            <FieldGroup label="Ciudad *"><select className={inputCls} {...field('city')}>{CIUDADES_CO.map(c => <option key={c}>{c}</option>)}</select></FieldGroup>
          </div>
          <SectionTitle>🚗 Datos del Vehículo</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldGroup label="Tipo Vehículo *"><select required className={inputCls} {...field('vehicleType')}>{TIPOS_VEHICULO.map(t => <option key={t}>{t}</option>)}</select></FieldGroup>
            <FieldGroup label="Placa"><input className={inputCls + ' uppercase'} {...field('plate')} /></FieldGroup>
            <FieldGroup label="Licencia *"><select required className={inputCls} {...field('licenseCategory')}>{LICENCIAS_CO.map(l => <option key={l}>{l}</option>)}</select></FieldGroup>
            <FieldGroup label="Zona *"><select required className={inputCls} {...field('zone')}>{ZONAS.map(z => <option key={z}>{z}</option>)}</select></FieldGroup>
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isCreating} className="shadow-neon-blue">
              {isEditing ? 'Guardar Cambios' : 'Registrar en Flota'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
