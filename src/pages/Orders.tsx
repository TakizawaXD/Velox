import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { 
  Search, Plus, Filter, 
  MapPin, Clock, Truck,
  Edit2, Trash2, User, Navigation, Package
} from 'lucide-react';
import { collection, onSnapshot, query, where, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

const PAYMENT_METHODS = ['Efectivo (al recibir)', 'Nequi', 'Daviplata', 'Transferencia Bancaria', 'Contraentrega Datáfono'];
const SERVICE_TYPES = ['Estándar', 'Express (Premium)', 'Económico'];
const PRIORITIES = ['Baja', 'Media', 'Alta', 'Urgente'];

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

const emptyOrder = {
  client: '',
  clientId: '',
  clientPhone: '',
  address: '',
  city: 'Bogotá D.C.',
  neighborhood: '',
  packageType: 'Paquete Pequeño',
  weight: '',
  amount: '',
  paymentMethod: 'Efectivo (al recibir)',
  description: '',
  declaredValue: '',
  serviceType: 'Estándar',
  priority: 'Media',
};

export function Orders() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [newOrder, setNewOrder] = useState(emptyOrder);
  const [isSaving, setIsSaving] = useState(false);
  
  // Custom Customer Selection
  const [customers, setCustomers] = useState<any[]>([]);
  const [showCustomerList, setShowCustomerList] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'orders'),
      where('tenantId', '==', currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Ordenamiento manual en cliente para evitar error de índice compuesto inicial
      data.sort((a: any, b: any) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });
      setOrders(data);
      setIsLoading(false);
    });

    // Load customers for selection
    const qCust = query(collection(db, 'customers'), where('tenantId', '==', currentUser.uid));
    const unsubCust = onSnapshot(qCust, (snap) => {
      setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsub(); unsubCust(); };
  }, [currentUser]);

  const handleOpenModal = (order: any = null) => {
    if (order) {
      setIsEditing(true);
      setEditingOrderId(order.id);
      setNewOrder({
        client: order.client || '',
        clientId: order.clientId || '',
        clientPhone: order.clientPhone || '',
        address: order.address || '',
        city: order.city || 'Bogotá D.C.',
        neighborhood: order.neighborhood || '',
        packageType: order.packageType || 'Paquete Pequeño',
        weight: order.weight || '',
        amount: order.amount || '',
        paymentMethod: order.paymentMethod || 'Efectivo (al recibir)',
        description: order.description || '',
        declaredValue: order.declaredValue || '',
        serviceType: order.serviceType || 'Estándar',
        priority: order.priority || 'Media',
      });
    } else {
      setIsEditing(false);
      setEditingOrderId(null);
      setNewOrder(emptyOrder);
    }
    setIsModalOpen(true);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);
    try {
      const now = new Date();
      if (isEditing && editingOrderId) {
        await updateDoc(doc(db, 'orders', editingOrderId), {
          ...newOrder,
          amount: Number(newOrder.amount),
          declaredValue: Number(newOrder.declaredValue),
          weight: Number(newOrder.weight),
          updatedAt: now,
        });
        toast.success('Pedido actualizado');
      } else {
        const ref = await addDoc(collection(db, 'orders'), {
          ...newOrder,
          status: 'Pendiente',
          driver: 'Por Asignar',
          time: '-',
          amount: Number(newOrder.amount),
          declaredValue: Number(newOrder.declaredValue),
          weight: Number(newOrder.weight),
          tenantId: currentUser.uid,
          createdAt: serverTimestamp(),
        });
        await updateDoc(ref, { id: `ORD-${ref.id.substring(0, 6).toUpperCase()}` });
        toast.success('Nuevo pedido registrado');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Error al procesar el pedido');
    } finally {
      setIsSaving(false);
    }
  };

  const copyTrackingLink = (id: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/track/${id}`;
    navigator.clipboard.writeText(link);
    toast.success('Enlace de rastreo copiado');
  };

  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este despacho?')) return;
    try {
      await deleteDoc(doc(db, 'orders', id));
      toast.success('Despacho eliminado');
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar despacho');
    }
  };

  const selectCustomer = (c: any) => {
    setNewOrder({
      ...newOrder,
      client: c.name,
      clientId: c.idNumber || '',
      clientPhone: c.phone || '',
      address: c.address || '',
      city: c.city || 'Bogotá D.C.',
      neighborhood: c.neighborhood || '',
    });
    setShowCustomerList(false);
  };

  const filteredOrders = orders.filter(o => 
    o.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.client?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text tracking-tight">Gestión de Despachos</h1>
          <p className="text-textMuted text-sm">Control centralizado de recolecciones y entregas.</p>
        </div>
        <Button className="shadow-neon-blue gap-2" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Crear Envío
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
          <input
            type="text"
            placeholder="Buscar por ID de pedido o cliente..."
            className="w-full bg-surface border border-white/10 text-sm text-text placeholder:text-textMuted rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary/50"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 border-white/10">
          <Filter size={16} /> Filtros
        </Button>
      </div>

      <Card className="glass-panel overflow-hidden p-0 border-white/5 relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center text-textMuted">
            <Activity className="animate-spin text-primary mr-2" size={20} /> Recuperando pedidos activos...
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-white/10">
                    <TableHead>Pedido ID</TableHead>
                    <TableHead>Cliente / Destino</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Repartidor</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="group hover:bg-surfaceHover/30 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        {order.id?.substring(0, 10)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-text">{order.client}</p>
                          <p className="text-xs text-textMuted flex items-center gap-1 mt-0.5">
                            <MapPin size={10} /> {order.address}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          <Badge 
                            variant={order.status === 'Entregado' ? 'success' : order.status === 'En camino' ? 'primary' : 'default'}
                          >
                            {order.status}
                          </Badge>
                          <span className={`text-[9px] font-black uppercase text-center px-1.5 py-0.5 rounded-full border ${
                            order.priority === 'Alta' || order.priority === 'Urgente' ? 'bg-danger/10 text-danger border-danger/20' : 
                            order.priority === 'Media' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-success/10 text-success border-success/20'
                          }`}>
                            Prioridad {order.priority}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            <Truck size={12} className="text-textMuted" />
                          </div>
                          <span className="text-sm font-medium">{order.driver}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-text">
                        ${Number(order.amount).toLocaleString('es-CO')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary/80" onClick={() => copyTrackingLink(order.id)}>
                            <MapPin size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleOpenModal(order)}>
                            <Edit2 size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => handleDeleteOrder(order.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 p-4">
              <AnimatePresence>
                {filteredOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => navigate('/map', { state: { selectedOrderId: order.id } })}
                  className="p-5 rounded-[28px] bg-white/5 border border-white/5 active:scale-[0.98] transition-all space-y-4 relative overflow-hidden group shadow-xl"
                >
                  <div className="absolute top-0 right-0 p-3 bg-primary/20 text-primary rounded-bl-2xl">
                    <Navigation size={16} />
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">{order.id?.substring(0, 10)}</span>
                      <h3 className="text-lg font-black text-text mt-1">{order.client}</h3>
                    </div>
                    <Badge 
                      variant={order.status === 'Entregado' ? 'success' : order.status === 'En camino' ? 'primary' : 'default'}
                      className="text-[10px]"
                    >
                      {order.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-textMuted">
                    <MapPin size={14} className="shrink-0 text-primary" />
                    <p className="text-xs font-medium truncate">{order.address}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-surface border border-white/5 flex items-center justify-center">
                        <Truck size={14} className="text-textMuted" />
                      </div>
                      <div>
                          <p className="text-[9px] text-textMuted uppercase font-bold tracking-tighter leading-none">Repartidor</p>
                          <p className="text-xs font-bold text-text">{order.driver}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-textMuted uppercase font-bold tracking-tighter leading-none">Monto</p>
                      <p className="text-base font-black text-text">${Number(order.amount).toLocaleString('es-CO')}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenModal(order); }}
                      className="flex-1 py-3 bg-white/5 rounded-xl text-xs font-bold text-text hover:bg-white/10 transition-colors"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate('/map', { state: { selectedOrderId: order.id } }); }}
                      className="flex-1 py-3 bg-primary/20 rounded-xl text-xs font-bold text-primary hover:bg-primary/30 transition-colors"
                    >
                      Rastrear
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

            {filteredOrders.length === 0 && (
              <div className="py-20 text-center text-textMuted">
                <Package size={48} className="mx-auto opacity-10 mb-4" />
                <p className="text-sm">No hay pedidos registrados.</p>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={isEditing ? 'Editar Despacho' : 'Nuevo Despacho Velox'}
      >
        <form onSubmit={handleCreateOrder} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="flex justify-between items-center bg-primary/10 p-3 rounded-xl border border-primary/20 mb-4">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <User size={16} /> CLIENTE SELECCIONADO
            </div>
            {!isEditing && (
              <Button type="button" size="sm" variant="outline" className="text-[10px]" onClick={() => setShowCustomerList(!showCustomerList)}>
                {showCustomerList ? 'Cerrar Lista' : 'Elegir de Directorio'}
              </Button>
            )}
          </div>

          {!isEditing && showCustomerList && (
             <div className="bg-surfaceHover/50 rounded-xl p-2 border border-white/10 mb-4 max-h-40 overflow-y-auto space-y-1">
                {customers.length === 0 && <p className="text-[10px] text-center py-2 text-textMuted">No hay clientes en el directorio</p>}
                {customers.map(c => (
                  <button 
                    key={c.id} 
                    type="button"
                    onClick={() => selectCustomer(c)}
                    className="w-full text-left p-2 rounded-lg hover:bg-primary/20 flex items-center justify-between group transition-all"
                  >
                    <span className="text-xs font-bold text-text">{c.name}</span>
                    <span className="text-[10px] text-textMuted opacity-0 group-hover:opacity-100 uppercase font-black">Seleccionar</span>
                  </button>
                ))}
             </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldGroup label="Nombre Cliente / Negocio *">
              <input 
                required 
                className={inputCls} 
                placeholder="Ej. Juan Pérez" 
                value={newOrder.client}
                onChange={e => setNewOrder({ ...newOrder, client: e.target.value })}
              />
            </FieldGroup>
            <FieldGroup label="Cédula / NIT">
              <input 
                className={inputCls} 
                placeholder="Ej. 12345678" 
                value={newOrder.clientId}
                onChange={e => setNewOrder({ ...newOrder, clientId: e.target.value })}
              />
            </FieldGroup>
            <FieldGroup label="Teléfono de Contacto *">
              <input 
                required 
                className={inputCls} 
                type="tel" 
                placeholder="310 000 0000" 
                value={newOrder.clientPhone}
                onChange={e => setNewOrder({ ...newOrder, clientPhone: e.target.value })}
              />
            </FieldGroup>
            <FieldGroup label="Ciudad *">
              <input required className={inputCls} value={newOrder.city} readOnly />
            </FieldGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="sm:col-span-2">
              <FieldGroup label="Dirección Exacta *">
                <input 
                  required 
                  className={inputCls} 
                  placeholder="Ej. Calle 10 #20-30" 
                  value={newOrder.address}
                  onChange={e => setNewOrder({ ...newOrder, address: e.target.value })}
                />
              </FieldGroup>
            </div>
            <FieldGroup label="Barrio / Localidad">
              <input 
                className={inputCls} 
                placeholder="Ej. Chapinero" 
                value={newOrder.neighborhood}
                onChange={e => setNewOrder({ ...newOrder, neighborhood: e.target.value })}
              />
            </FieldGroup>
            <FieldGroup label="Tipo de Paquete">
              <select 
                className={inputCls}
                value={newOrder.packageType}
                onChange={e => setNewOrder({ ...newOrder, packageType: e.target.value })}
              >
                <option>Paquete Pequeño</option>
                <option>Mediano</option>
                <option>Grande / Voluminoso</option>
                <option>Sobre / Documento</option>
              </select>
            </FieldGroup>
            <FieldGroup label="Tipo de Servicio VIP">
              <select 
                className={inputCls}
                value={newOrder.serviceType}
                onChange={e => {
                  const val = e.target.value;
                  // Auto-adjust amount if Express
                  let newAmount = newOrder.amount;
                  if (val.includes('Express') && !newOrder.serviceType.includes('Express')) {
                     newAmount = String(Math.round(Number(newOrder.amount || 0) * 1.3));
                  }
                  setNewOrder({ ...newOrder, serviceType: val, amount: newAmount });
                }}
              >
                {SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Prioridad Logística">
              <select 
                className={inputCls}
                value={newOrder.priority}
                onChange={e => setNewOrder({ ...newOrder, priority: e.target.value })}
              >
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </FieldGroup>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5 mt-4">
            <FieldGroup label="Valor Pedido *">
              <input 
                required 
                type="number" 
                className={inputCls} 
                placeholder="$0" 
                value={newOrder.amount}
                onChange={e => setNewOrder({ ...newOrder, amount: e.target.value })}
              />
            </FieldGroup>
            <FieldGroup label="V. Declarado *">
              <input 
                required 
                type="number" 
                className={inputCls} 
                placeholder="$0" 
                value={newOrder.declaredValue}
                onChange={e => setNewOrder({ ...newOrder, declaredValue: e.target.value })}
              />
            </FieldGroup>
            <FieldGroup label="Peso (Kg)">
              <input 
                type="number" 
                className={inputCls} 
                placeholder="0.0" 
                value={newOrder.weight}
                onChange={e => setNewOrder({ ...newOrder, weight: e.target.value })}
              />
            </FieldGroup>
          </div>

          <FieldGroup label="Método de Pago *">
            <select 
              className={inputCls}
              value={newOrder.paymentMethod}
              onChange={e => setNewOrder({ ...newOrder, paymentMethod: e.target.value })}
            >
              {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </FieldGroup>

          <FieldGroup label="Descripción del Contenido">
            <textarea
              className={inputCls + ' resize-none h-20'}
              placeholder="Ej. Ropa de bebé, frágil..."
              value={newOrder.description}
              onChange={e => setNewOrder({ ...newOrder, description: e.target.value })}
            />
          </FieldGroup>

          <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isSaving} className="shadow-neon-blue">
              {isEditing ? 'Guardar Cambios' : 'Confirmar Despacho'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Activity({ className, size }: { className?: string; size?: number }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      className={className}
    >
      <Clock size={size} />
    </motion.div>
  );
}
