import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Search, Plus, Edit2, Trash2, Phone, Activity, Star, UserPlus } from 'lucide-react';
import { collection, onSnapshot, query, where, orderBy, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

const CIUDADES_CO = [
  'Bogotá D.C.', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena de Indias',
  'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué', 'Pasto',
  'Manizales', 'Neiva', 'Villavicencio', 'Armenia', 'Valledupar', 'Montería',
  'Sincelejo', 'Popayán', 'Florencia', 'Tunja', 'Riohacha', 'Quibdó',
  'Yopal', 'Mocoa', 'Inírida', 'Mitú', 'Puerto Carreño', 'San Andrés',
];

const inputCls = 'w-full rounded-xl border border-white/10 bg-surface/60 py-2.5 px-3 text-sm text-text placeholder:text-textMuted/60 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all';
const labelCls = 'block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1.5';

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

const emptyCustomer = {
  name: '',
  idNumber: '',
  phone: '',
  email: '',
  address: '',
  city: 'Bogotá D.C.',
  neighborhood: '',
  notes: '',
  isVIP: false,
  subscriptionStatus: 'Ninguno',
  referredBy: '',
};

export function Customers() {
  const { currentUser } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [formData, setFormData] = useState(emptyCustomer);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'customers'),
      where('tenantId', '==', currentUser.uid),
      orderBy('name', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setIsLoading(false);
    });
    return unsub;
  }, [currentUser]);

  const handleOpenModal = (customer: any = null) => {
    if (customer) {
      setSelectedCustomer(customer);
      setFormData({ ...customer });
    } else {
      setSelectedCustomer(null);
      setFormData(emptyCustomer);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);
    try {
      if (selectedCustomer) {
        await updateDoc(doc(db, 'customers', selectedCustomer.id), {
          ...formData,
          updatedAt: new Date(),
        });
        toast.success('Cliente actualizado correctamente');
      } else {
        await addDoc(collection(db, 'customers'), {
          ...formData,
          tenantId: currentUser.uid,
          createdAt: new Date(),
        });
        toast.success('Cliente registrado correctamente');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar cliente');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;
    try {
      await deleteDoc(doc(db, 'customers', id));
      toast.success('Cliente eliminado');
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar cliente');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.idNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">Directorio de Clientes</h1>
          <p className="text-textMuted text-sm">Gestiona la base de datos de tus clientes recurrentes.</p>
        </div>
        <Button className="gap-2 shadow-neon-blue" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Nuevo Cliente
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
        <input
          type="text"
          placeholder="Buscar por nombre, NIT, teléfono..."
          className="w-full bg-surface border border-white/10 text-sm text-text placeholder:text-textMuted rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary/50"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="glass-panel overflow-hidden p-0 border-white/5">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center text-textMuted gap-4">
            <Activity className="animate-spin text-primary" size={32} />
            <p className="font-bold">Cargando base de datos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado VIP</TableHead>
                  <TableHead>Identificación</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredCustomers.map((customer, i) => (
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="group border-b border-white/5 hover:bg-surfaceHover/40 transition-colors"
                    >
                      <TableCell className="font-medium flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${customer.isVIP ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 'bg-primary/10 text-primary'}`}>
                          {customer.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="text-text font-medium flex items-center gap-1.5">
                            {customer.name}
                            {customer.isVIP && <Star size={10} className="fill-yellow-500 text-yellow-500" />}
                          </p>
                          <p className="text-xs text-textMuted">{customer.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-col gap-1">
                            <Badge variant={customer.isVIP ? 'primary' : 'default'} className={customer.isVIP ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30' : ''}>
                              {customer.isVIP ? 'CLIENTE VIP' : 'Estándar'}
                            </Badge>
                            <span className="text-[10px] font-bold text-textMuted uppercase opacity-60">
                               Plan: {customer.subscriptionStatus || 'Ninguno'}
                            </span>
                         </div>
                      </TableCell>
                      <TableCell className="text-sm text-textMuted">
                        {customer.idNumber || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-textMuted">
                          <Phone size={12} className="text-primary" />
                          {customer.phone || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-text">{customer.city}</div>
                        <div className="text-xs text-textMuted truncate max-w-[150px]">{customer.address}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleOpenModal(customer)}>
                            <Edit2 size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => handleDelete(customer.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-20 text-textMuted">
                      No se encontraron clientes.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={selectedCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
      >
        <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldGroup label="Nombre Completo *">
              <input 
                required 
                className={inputCls} 
                placeholder="Ej. Juan Pérez" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </FieldGroup>
            <FieldGroup label="Cédula / NIT">
              <input 
                className={inputCls} 
                placeholder="Ej. 12345678" 
                value={formData.idNumber}
                onChange={e => setFormData({ ...formData, idNumber: e.target.value })}
              />
            </FieldGroup>
            <FieldGroup label="Teléfono *">
              <input 
                required 
                className={inputCls} 
                type="tel" 
                placeholder="310 000 0000" 
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </FieldGroup>
            <FieldGroup label="Correo Electrónico">
              <input 
                className={inputCls} 
                type="email" 
                placeholder="juan@ejemplo.com" 
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </FieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <FieldGroup label="Ciudad *">
              <select 
                required 
                className={inputCls}
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
              >
                {CIUDADES_CO.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Barrio">
              <input 
                className={inputCls} 
                placeholder="Ej. Chapinero" 
                value={formData.neighborhood}
                onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
              />
            </FieldGroup>
            <div className="sm:col-span-2">
              <FieldGroup label="Dirección de Entrega *">
                <input 
                  required 
                  className={inputCls} 
                  placeholder="Ej. Calle 10 #20-30" 
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </FieldGroup>
            </div>
            <div className="sm:col-span-2 grid grid-cols-2 gap-3 pt-2 border-t border-white/5 mt-2">
                <FieldGroup label="Estado de Suscripción">
                    <select 
                        className={inputCls}
                        value={formData.subscriptionStatus}
                        onChange={e => setFormData({ ...formData, subscriptionStatus: e.target.value })}
                    >
                        <option>Ninguno</option>
                        <option>Plan Silver</option>
                        <option>Plan Gold</option>
                        <option>Empresarial</option>
                    </select>
                </FieldGroup>
                <div className="flex flex-col justify-center gap-1">
                   <span className={labelCls}>Membresía VIP</span>
                   <button 
                      type="button"
                      onClick={() => setFormData({ ...formData, isVIP: !formData.isVIP })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${formData.isVIP ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' : 'bg-white/5 border-white/10 text-textMuted'}`}
                   >
                      <Star size={14} className={formData.isVIP ? 'fill-yellow-500' : ''} />
                      <span className="text-xs font-bold uppercase">{formData.isVIP ? 'VIP ACTIVO' : 'Marcar VIP'}</span>
                   </button>
                </div>
                <FieldGroup label="Usuario que Refirió">
                    <div className="relative">
                       <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-textMuted" />
                       <input 
                          className={inputCls + ' pl-9'} 
                          placeholder="@usuario" 
                          value={formData.referredBy}
                          onChange={e => setFormData({ ...formData, referredBy: e.target.value })}
                       />
                    </div>
                </FieldGroup>
            </div>
          </div>

          <FieldGroup label="Notas">
            <textarea
              className={inputCls + ' resize-none h-20'}
              placeholder="Indicaciones especiales de entrega..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </FieldGroup>

          <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isSaving} className="shadow-neon-blue">
              {selectedCustomer ? 'Guardar Cambios' : 'Registrar Cliente'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
