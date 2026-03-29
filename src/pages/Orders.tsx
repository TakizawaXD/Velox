import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Eye, MapPin, Search, Plus, DollarSign, Download, Truck, X, Activity } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, addDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

const CIUDADES_CO = [
  'Bogotá D.C.', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena de Indias',
  'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué', 'Pasto',
  'Manizales', 'Neiva', 'Villavicencio', 'Armenia', 'Valledupar', 'Montería',
  'Sincelejo', 'Popayán', 'Florencia', 'Tunja', 'Riohacha', 'Quibdó',
  'Yopal', 'Mocoa', 'Inírida', 'Mitú', 'Puerto Carreño', 'San Andrés',
];

const TIPOS_PAQUETE = [
  'Documento / Sobre', 'Paquete Pequeño (< 2 kg)', 'Paquete Mediano (2-10 kg)',
  'Paquete Grande (10-30 kg)', 'Mercancía / Carga', 'Frágil', 'Perecedero / Alimentos',
  'Medicamentos', 'Electrónico', 'Ropa / Textil',
];

const FORMAS_PAGO = [
  'Efectivo (al recibir)', 'Transferencia Bancaria', 'Nequi', 'Daviplata',
  'Bancolombia a la mano', 'Tarjeta Crédito/Débito', 'Contra entrega',
];

const STATUS_FLOW = ['Pendiente', 'Preparando', 'En camino', 'Entregado', 'Cancelado'];

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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pt-2 pb-1">
      <div className="h-px flex-1 bg-white/5" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-textMuted/60">{children}</span>
      <div className="h-px flex-1 bg-white/5" />
    </div>
  );
}

const emptyOrder = {
  client: '', clientPhone: '', clientId: '',
  address: '', city: 'Bogotá D.C.', neighborhood: '',
  packageType: '', weight: '', description: '',
  declaredValue: '', amount: '', paymentMethod: 'Efectivo (al recibir)',
  notes: '',
};

export function Orders() {
  const { currentUser } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState(emptyOrder);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'orders'),
      where('tenantId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setIsLoading(false);
    });
    return unsub;
  }, [currentUser]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
    } catch (e) { console.error(e); }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsCreating(true);
    try {
      const now = new Date();
      const ref = await addDoc(collection(db, 'orders'), {
        ...newOrder,
        amount: Number(newOrder.amount),
        declaredValue: Number(newOrder.declaredValue),
        weight: Number(newOrder.weight),
        status: 'Pendiente',
        driver: 'Por Asignar',
        time: '-',
        tenantId: currentUser.uid,
        createdAt: now,
      });
      await updateDoc(ref, { id: `ORD-${ref.id.substring(0, 6).toUpperCase()}` });
      setIsNewModalOpen(false);
      setNewOrder(emptyOrder);
    } catch (err) { console.error(err); }
    finally { setIsCreating(false); }
  };

  const field = (key: keyof typeof emptyOrder) => ({
    value: newOrder[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setNewOrder({ ...newOrder, [key]: e.target.value }),
  });

  const filteredOrders = orders.filter(o => {
    const matchSearch = !searchTerm ||
      o.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'Todos' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string) => ({
    'Pendiente': <Badge variant="warning">Pendiente</Badge>,
    'Preparando': <Badge variant="primary">Preparando</Badge>,
    'En camino': <Badge variant="primary" className="animate-pulse">En camino</Badge>,
    'Entregado': <Badge variant="success">Entregado</Badge>,
    'Cancelado': <Badge variant="danger">Cancelado</Badge>,
  }[status] ?? <Badge>{status}</Badge>);

  const exportCSV = () => {
    const headers = 'ID,Cliente,Teléfono,Ciudad,Dirección,Tipo,Tarifa,Pago,Estado,Repartidor';
    const rows = orders.map(o =>
      `${o.id},${o.client},${o.clientPhone},${o.city},${o.address},${o.packageType},${o.amount},${o.paymentMethod},${o.status},${o.driver}`
    );
    const blob = new Blob([headers + '\n' + rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'pedidos-velox.csv'; a.click();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">Gestión de Pedidos</h1>
          <p className="text-textMuted text-sm">Despachos y seguimiento en Colombia · {orders.length} registros</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="gap-2 text-sm" onClick={exportCSV}>
            <Download size={15} /> CSV
          </Button>
          <Button className="gap-2 shadow-neon-blue text-sm" onClick={() => setIsNewModalOpen(true)}>
            <Plus size={16} /> Nuevo Pedido
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
          <input
            type="text"
            placeholder="Buscar por ID, cliente, ciudad..."
            className="w-full bg-surface border border-white/10 text-sm text-text placeholder:text-textMuted rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary/50"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['Todos', ...STATUS_FLOW].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === s ? 'bg-primary text-white shadow-neon-blue' : 'bg-surface text-textMuted hover:bg-surfaceHover border border-white/10'}`}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      {/* Table / Grid */}
      <Card className="glass-panel overflow-hidden p-0 border-white/5">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center text-textMuted gap-4">
             <Activity className="animate-spin text-primary" size={32} />
             <p className="font-bold">Cargando base de datos...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Ciudad / Barrio</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Repartidor</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Tarifa</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right whitespace-nowrap px-4">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredOrders.map((order, i) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="group border-b border-white/5 hover:bg-surfaceHover/40 transition-colors"
                      >
                        <TableCell className="font-mono text-primary text-xs font-bold">{order.id}</TableCell>
                        <TableCell>
                          <div className="font-medium text-sm text-text">{order.client}</div>
                          <div className="text-xs text-textMuted">{order.clientPhone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{order.city}</div>
                          <div className="text-xs text-textMuted truncate max-w-[140px]">{order.neighborhood}</div>
                        </TableCell>
                        <TableCell className="text-xs text-textMuted whitespace-nowrap">{order.packageType}</TableCell>
                        <TableCell className="text-sm text-textMuted whitespace-nowrap">{order.driver}</TableCell>
                        <TableCell className="text-xs text-textMuted whitespace-nowrap">{order.paymentMethod}</TableCell>
                        <TableCell className="font-mono font-black text-text whitespace-nowrap">
                          ${Number(order.amount || 0).toLocaleString('es-CO')}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right pr-4">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-xl hover:bg-primary/20 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye size={16} />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-white/5">
              {filteredOrders.map((order, i) => (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedOrder(order)}
                  className="p-4 active:bg-white/5 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-primary text-[10px] font-black">{order.id}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="font-black text-text text-base leading-tight">{order.client}</p>
                    </div>
                    <p className="font-black text-text text-sm">${Number(order.amount || 0).toLocaleString('es-CO')}</p>
                  </div>
                  
                  <div className="flex items-center justify-between gap-4 text-xs text-textMuted">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin size={12} className="shrink-0" />
                      <span className="truncate">{order.city} · {order.neighborhood}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Truck size={12} />
                      <span className="font-bold">{order.driver?.split(' ')[0]}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-20 px-6 space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                   <Search size={28} className="text-textMuted opacity-20" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text">No se encontraron resultados</h3>
                  <p className="text-sm text-textMuted max-w-xs mx-auto">Intenta ajustar los filtros o verifica el ID del despacho.</p>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* ===================== MODAL DETALLE ===================== */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Pedido ${selectedOrder?.id}`}>
        {selectedOrder && (
          <div className="space-y-5">
            {/* Estado + Acciones */}
            <div className="flex items-center justify-between">
              {getStatusBadge(selectedOrder.status)}
              <div className="flex gap-2 flex-wrap">
                {selectedOrder.status !== 'Entregado' && selectedOrder.status !== 'Cancelado' && (
                  <>
                    {selectedOrder.status === 'Pendiente' && (
                      <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(selectedOrder.id, 'Preparando')}>
                        Preparar
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="border-primary text-primary" onClick={() => handleUpdateStatus(selectedOrder.id, 'En camino')}>
                      En Camino
                    </Button>
                    <Button size="sm" variant="success" onClick={() => handleUpdateStatus(selectedOrder.id, 'Entregado')}>
                      Entregado ✓
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(selectedOrder.id, 'Cancelado')}>
                      <X size={14} />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { l: 'Cliente', v: selectedOrder.client },
                { l: 'Cédula/NIT', v: selectedOrder.clientId || '-' },
                { l: 'Teléfono', v: selectedOrder.clientPhone || '-' },
                { l: 'Repartidor', v: selectedOrder.driver },
                { l: 'Ciudad', v: selectedOrder.city || '-' },
                { l: 'Barrio', v: selectedOrder.neighborhood || '-' },
                { l: 'Tipo Paquete', v: selectedOrder.packageType || '-' },
                { l: 'Peso', v: selectedOrder.weight ? `${selectedOrder.weight} kg` : '-' },
                { l: 'Forma de Pago', v: selectedOrder.paymentMethod || '-' },
                { l: 'Valor Declarado', v: selectedOrder.declaredValue ? `$${Number(selectedOrder.declaredValue).toLocaleString('es-CO')}` : '-' },
              ].map(({ l, v }) => (
                <div key={l} className="bg-surfaceHover/40 rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] text-textMuted uppercase tracking-wider mb-0.5">{l}</p>
                  <p className="font-medium text-sm text-text">{v}</p>
                </div>
              ))}
            </div>

            <div className="bg-surfaceHover/40 rounded-xl p-3 border border-white/5">
              <p className="text-[10px] text-textMuted uppercase tracking-wider mb-1">Dirección Completa</p>
              <p className="text-sm text-text flex items-start gap-1.5">
                <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                {selectedOrder.address}, {selectedOrder.neighborhood}, {selectedOrder.city}
              </p>
            </div>

            {selectedOrder.description && (
              <div className="bg-surfaceHover/40 rounded-xl p-3 border border-white/5">
                <p className="text-[10px] text-textMuted uppercase tracking-wider mb-1">Contenido / Descripción</p>
                <p className="text-sm text-text">{selectedOrder.description}</p>
              </div>
            )}

            {selectedOrder.notes && (
              <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                <p className="text-[10px] text-primary uppercase tracking-wider mb-1">Notas Especiales</p>
                <p className="text-sm text-text">{selectedOrder.notes}</p>
              </div>
            )}

            <div className="border-t border-white/10 pt-4 flex items-center justify-between">
              <span className="text-textMuted text-sm font-medium">Tarifa de Envío</span>
              <span className="text-2xl font-bold font-mono text-text">
                ${Number(selectedOrder.amount || 0).toLocaleString('es-CO')} COP
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* ===================== MODAL NUEVO PEDIDO ===================== */}
      <Modal isOpen={isNewModalOpen} onClose={() => setIsNewModalOpen(false)} title="Generar Nuevo Pedido">
        <form onSubmit={handleCreateOrder} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <SectionTitle>📦 Información del Cliente</SectionTitle>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldGroup label="Nombre Completo *">
              <input required className={inputCls} placeholder="Ej. Carlos Rodríguez" {...field('client')} />
            </FieldGroup>
            <FieldGroup label="Cédula / NIT">
              <input className={inputCls} placeholder="Ej. 1020304050" {...field('clientId')} />
            </FieldGroup>
            <FieldGroup label="Teléfono de Contacto *">
              <input required className={inputCls} placeholder="+57 310 000 0000" type="tel" {...field('clientPhone')} />
            </FieldGroup>
            <FieldGroup label="Forma de Pago *">
              <select required className={inputCls} {...field('paymentMethod')}>
                {FORMAS_PAGO.map(p => <option key={p}>{p}</option>)}
              </select>
            </FieldGroup>
          </div>

          <SectionTitle>📍 Destino de Entrega</SectionTitle>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldGroup label="Ciudad / Municipio *">
              <select required className={inputCls} {...field('city')}>
                {CIUDADES_CO.map(c => <option key={c}>{c}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Barrio / Sector">
              <input className={inputCls} placeholder="Ej. Chapinero, El Poblado" {...field('neighborhood')} />
            </FieldGroup>
            <div className="sm:col-span-2">
              <FieldGroup label="Dirección de Entrega *">
                <input required className={inputCls} placeholder="Ej. Cra 7 #45-20, Apto 301, junto al banco" {...field('address')} />
              </FieldGroup>
            </div>
          </div>

          <SectionTitle>🚚 Detalles del Paquete</SectionTitle>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldGroup label="Tipo de Paquete *">
              <select required className={inputCls} {...field('packageType')}>
                <option value="">Seleccionar...</option>
                {TIPOS_PAQUETE.map(t => <option key={t}>{t}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Peso Aproximado (kg)">
              <input className={inputCls} type="number" step="0.1" min="0" placeholder="Ej. 1.5" {...field('weight')} />
            </FieldGroup>
            <div className="sm:col-span-2">
              <FieldGroup label="Descripción del Contenido">
                <textarea
                  className={inputCls + ' resize-none h-16'}
                  placeholder="Ej. 2 camisas azules, 1 pantalón negro"
                  value={newOrder.description}
                  onChange={e => setNewOrder({ ...newOrder, description: e.target.value })}
                />
              </FieldGroup>
            </div>
          </div>

          <SectionTitle>💰 Valores y Tarifa</SectionTitle>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldGroup label="Valor Declarado de la Mercancía (COP)">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
                <input className={inputCls + ' pl-8'} type="number" min="0" placeholder="0" {...field('declaredValue')} />
              </div>
            </FieldGroup>
            <FieldGroup label="Tarifa de Envío (COP) *">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
                <input required className={inputCls + ' pl-8'} type="number" min="1" placeholder="0" {...field('amount')} />
              </div>
            </FieldGroup>
            <div className="sm:col-span-2">
              <FieldGroup label="Notas / Instrucciones Especiales">
                <textarea
                  className={inputCls + ' resize-none h-16'}
                  placeholder="Ej. Llamar antes de llegar, no dejar con portero"
                  value={newOrder.notes}
                  onChange={e => setNewOrder({ ...newOrder, notes: e.target.value })}
                />
              </FieldGroup>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-white/5">
            <Button type="button" variant="outline" onClick={() => setIsNewModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isCreating} className="shadow-neon-blue gap-2">
              <Truck size={16} /> Registrar Pedido
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
