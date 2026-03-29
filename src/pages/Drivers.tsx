import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
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

  const handleToggleStatus = async (e: React.MouseEvent, driver: any) => {
    e.stopPropagation();
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

      {/* Grid/Table de Repartidores */}
      <Card className="glass-panel overflow-hidden p-0 border-white/5 relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center text-textMuted py-20 gap-4">
            <Activity className="animate-spin text-primary" size={32} />
            <p className="font-bold tracking-widest uppercase text-xs">Sincronizando Flota Live...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Repartidor</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Mantenimiento</TableHead>
                    <TableHead>Calificación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredDrivers.map((driver) => (
                      <motion.tr
                        key={driver.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group border-b border-white/5 hover:bg-surfaceHover/40 transition-colors"
                      >
                        <TableCell className="font-medium flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-surface border border-white/10 flex items-center justify-center font-black text-primary">
                            {driver.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-text font-bold">{driver.name}</p>
                            <p className="text-[10px] text-textMuted uppercase font-bold tracking-tighter">{driver.phone || '-'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={driver.status === 'Disponible' ? 'success' : driver.status === 'Offline' ? 'default' : 'primary'}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={(e) => handleToggleStatus(e, driver)}
                          >
                            {driver.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-text">{driver.vehicleType}</div>
                          <div className="text-[10px] text-textMuted font-mono">{driver.plate || 'No registrado'}</div>
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center gap-2">
                              <div className={`h-1.5 w-16 rounded-full ${ (driver.maintenanceKm || 0) > 4500 ? 'bg-danger' : 'bg-success/50' } overflow-hidden`}>
                                <div className="h-full bg-success" style={{ width: `${Math.max(0, 100 - (driver.maintenanceKm || 0) / 50)}%` }} />
                              </div>
                              <span className="text-[10px] font-bold text-text/60">{(driver.maintenanceKm || 0)}km</span>
                           </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs text-yellow-400">
                             <Star size={12} className="fill-yellow-400" /> {driver.rating || 5.0}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary"
                              onClick={() => navigate('/map', { state: { selectedDriverId: driver.id } })}
                            >
                              <Navigation size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={(e) => handleOpenEditModal(e, driver)}>
                              <Edit2 size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={(e) => handleDeleteDriver(e, driver.id)}>
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 p-4">
              <AnimatePresence>
                {filteredDrivers.map((driver, i) => (
                  <motion.div
                    key={driver.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate('/map', { state: { selectedDriverId: driver.id } })}
                    className="p-5 rounded-[28px] bg-white/5 border border-white/5 active:scale-[0.98] transition-all space-y-4 relative overflow-hidden group shadow-xl"
                  >
                    <div 
                      onClick={(e) => handleToggleStatus(e, driver)}
                      className={`absolute top-0 right-0 p-3 ${statusBg(driver.status)} bg-opacity-20 text-text rounded-bl-2xl font-black text-[10px] cursor-pointer hover:bg-opacity-40 transition-all`}
                    >
                       {driver.status?.toUpperCase()}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-surface border-2 border-white/10 flex items-center justify-center font-black text-2xl text-primary shadow-neon-blue">
                        {driver.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-text leading-tight">{driver.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                           <span className="flex items-center gap-1 text-[10px] text-yellow-400 font-black"><Star size={10} className="fill-yellow-400" /> {driver.rating || 5.0}</span>
                           <span className="text-[10px] text-textMuted font-bold uppercase">{driver.deliveries || 0} ENVÍOS</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-textMuted uppercase tracking-tighter leading-none">Vehículo</p>
                          <p className="text-xs font-bold text-text truncate">{driver.vehicleType}</p>
                          <p className="text-[9px] font-mono text-primary font-black">{driver.plate || 'SIN PLACA'}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold text-textMuted uppercase tracking-tighter leading-none">Ciudad / Zona</p>
                          <p className="text-xs font-bold text-text truncate">{driver.city}</p>
                          <p className="text-[9px] text-textMuted font-medium">{driver.zone}</p>
                       </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="h-2 w-24 bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full bg-primary" style={{ width: `${Math.min((driver.deliveries || 0) * 5, 100)}%` }} />
                          </div>
                          <span className="text-[9px] font-black text-primary uppercase">Rendimiento</span>
                       </div>
                       <div className="flex gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenEditModal(e, driver); }}
                            className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-textMuted hover:bg-white/10 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); navigate('/map', { state: { selectedDriverId: driver.id } }); }}
                            className="px-4 h-10 bg-primary/20 rounded-xl text-[10px] font-black uppercase text-primary hover:bg-primary/30 transition-colors"
                          >
                            Ver En Mapa
                          </button>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredDrivers.length === 0 && (
              <div className="py-20 text-center text-textMuted">
                <Truck size={48} className="mx-auto opacity-10 mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">No hay flota registrada.</p>
                <p className="text-xs mt-1">Añade tu primer repartidor para empezar a monitorear.</p>
              </div>
            )}
          </>
        )}
      </Card>

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
