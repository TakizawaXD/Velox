import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Download, MoreHorizontal,
  CheckCircle2, Clock, AlertCircle, TrendingUp,
  ArrowUpRight, DollarSign, Plus, Trash2, X
} from 'lucide-react';
import { 
  collection, query, where, onSnapshot, 
  addDoc, serverTimestamp, Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { TableRowSkeleton, StatsSkeleton } from '@/components/ui/SkeletonLoaders';
import { SEO } from '@/components/common/SEO';
import { ExportMenu } from '@/components/ui/ExportMenu';
import { exportInvoices } from '@/lib/exportUtils';
import { toast } from 'react-hot-toast';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  items?: InvoiceItem[];
  total: number;
  status: 'Pagada' | 'Pendiente' | 'Vencida';
  dueDate: Timestamp;
  createdAt: Timestamp;
  notes?: string;
}

const emptyItem = (): InvoiceItem => ({ description: '', quantity: 1, unitPrice: 0 });

const inputCls = 'w-full rounded-xl border border-white/10 bg-white/5 py-2.5 px-3.5 text-sm text-text placeholder:text-textMuted/50 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all';
const labelCls = 'block text-[10px] font-black text-textMuted uppercase tracking-widest mb-1.5';

function generateInvoiceNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'FAC-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function Invoices() {
  const { currentUser } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    dueDate: '',
    notes: '',
    status: 'Pendiente' as 'Pendiente' | 'Pagada' | 'Vencida',
    invoiceNumber: generateInvoiceNumber(),
  });
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()]);

  const total = items.reduce((sum, it) => sum + it.quantity * it.unitPrice, 0);

  const updateItem = (i: number, key: keyof InvoiceItem, value: string | number) => {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [key]: value } : item));
  };

  const addItem = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const openModal = () => {
    setForm({ clientName: '', clientEmail: '', clientPhone: '', dueDate: '', notes: '', status: 'Pendiente', invoiceNumber: generateInvoiceNumber() });
    setItems([emptyItem()]);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!currentUser) return;
    if (!form.clientName.trim()) { toast.error('El nombre del cliente es requerido'); return; }
    if (items.some(it => !it.description.trim())) { toast.error('Todos los ítems deben tener descripción'); return; }
    if (total <= 0) { toast.error('El total debe ser mayor a $0'); return; }

    setSaving(true);
    try {
      await addDoc(collection(db, 'invoices'), {
        ...form,
        items,
        total,
        tenantId: currentUser.uid,
        dueDate: form.dueDate ? Timestamp.fromDate(new Date(form.dueDate + 'T12:00:00')) : Timestamp.fromDate(new Date(Date.now() + 30 * 86400000)),
        createdAt: serverTimestamp(),
      });
      toast.success(`✅ Factura ${form.invoiceNumber} creada exitosamente`);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar la factura');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'invoices'), where('tenantId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Invoice[];
      docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setInvoices(docs);
      setLoading(false);
    });
    return unsubscribe;
  }, [currentUser]);

  const stats = [
    { label: 'Total Facturado', value: `$${invoices.reduce((acc, inv) => acc + inv.total, 0).toLocaleString('es-CO')}`, icon: DollarSign, color: 'text-primary' },
    { label: 'Pendiente Cobro', value: `$${invoices.filter(i => i.status !== 'Pagada').reduce((acc, inv) => acc + inv.total, 0).toLocaleString('es-CO')}`, icon: Clock, color: 'text-accent' },
    { label: 'Facturas Pagadas', value: invoices.filter(i => i.status === 'Pagada').length, icon: CheckCircle2, color: 'text-green-400' },
    { label: 'Eficiencia Pago', value: `${invoices.length > 0 ? Math.round((invoices.filter(i => i.status === 'Pagada').length / invoices.length) * 100) : 0}%`, icon: TrendingUp, color: 'text-blue-400' },
  ];

  const filteredInvoices = invoices.filter(inv =>
    inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <SEO title="Facturación" />

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Control de <span className="text-primary italic">Facturación.</span></h2>
          <p className="text-sm text-textMuted font-medium">Gestión financiera centralizada y sistemas de cobro automático.</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportMenu
            disabled={invoices.length === 0}
            onExportExcel={() => exportInvoices.csv(filteredInvoices)}
            onExportPDF={() => exportInvoices.pdf(filteredInvoices)}
          />
          <Button
            className="rounded-2xl font-black uppercase text-[11px] tracking-widest px-6 shadow-neon-blue gap-2"
            onClick={openModal}
          >
            <Plus size={16} /> Nueva Factura
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <><StatsSkeleton /><StatsSkeleton /><StatsSkeleton /><StatsSkeleton /></>
        ) : stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="p-6 rounded-[32px] bg-white/[0.02] border border-white/[0.05] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <stat.icon size={48} />
            </div>
            <div className={cn("inline-flex p-2 rounded-xl bg-white/5 mb-4", stat.color)}>
              <stat.icon size={20} />
            </div>
            <div className="text-3xl font-black text-white leading-none mb-2">{stat.value}</div>
            <div className="text-[10px] font-black text-textMuted uppercase tracking-widest">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-[40px] bg-white/[0.01] border border-white/[0.05] overflow-hidden">
        <div className="p-6 border-b border-white/[0.05] flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white/[0.02]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
            <input
              type="text" placeholder="Buscar por factura o cliente..."
              className="w-full h-11 bg-white/5 border border-white/5 rounded-2xl pl-11 pr-4 text-sm font-medium focus:border-primary/50 outline-none transition-all"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="h-11 px-4 rounded-2xl bg-white/5 border border-white/5 text-sm font-bold text-text hover:bg-white/10 transition-colors flex items-center gap-2">
            <Filter size={16} /> Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-black text-textMuted uppercase tracking-widest">Factura</th>
                <th className="px-6 py-4 text-[10px] font-black text-textMuted uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-black text-textMuted uppercase tracking-widest">Fecha</th>
                <th className="px-6 py-4 text-[10px] font-black text-textMuted uppercase tracking-widest">Vencimiento</th>
                <th className="px-6 py-4 text-[10px] font-black text-textMuted uppercase tracking-widest">Valor Total</th>
                <th className="px-6 py-4 text-[10px] font-black text-textMuted uppercase tracking-widest">Estado</th>
                <th className="px-6 py-4 text-[10px] font-black text-textMuted uppercase tracking-widest text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {loading ? (
                [...Array(5)].map((_, i) => <tr key={i}><td colSpan={7} className="p-0"><TableRowSkeleton /></td></tr>)
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-textMuted">
                      <DollarSign size={40} className="opacity-10" />
                      <p className="text-sm font-bold">No hay facturas registradas</p>
                      <p className="text-xs opacity-60">Crea tu primera factura con el botón "Nueva Factura"</p>
                    </div>
                  </td>
                </tr>
              ) : filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-textMuted group-hover:text-primary transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="text-sm font-black text-white tracking-widest uppercase">{inv.invoiceNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div>
                      <p className="text-sm font-semibold text-text">{inv.clientName}</p>
                      {inv.clientEmail && <p className="text-xs text-textMuted">{inv.clientEmail}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-textMuted">{inv.createdAt?.toDate?.()?.toLocaleDateString('es-CO') ?? '—'}</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-textMuted">{inv.dueDate?.toDate?.()?.toLocaleDateString('es-CO') ?? '—'}</span>
                  </td>
                  <td className="px-6 py-5 font-bold text-white tracking-tight">
                    ${inv.total.toLocaleString('es-CO')} COP
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      inv.status === 'Pagada' ? "bg-green-400/10 text-green-400 border border-green-400/20" :
                      inv.status === 'Pendiente' ? "bg-accent/10 text-accent border border-accent/20" :
                      "bg-danger/10 text-danger border border-danger/20"
                    )}>
                      {inv.status === 'Pagada' && <CheckCircle2 size={12} />}
                      {inv.status === 'Pendiente' && <Clock size={12} />}
                      {inv.status === 'Vencida' && <AlertCircle size={12} />}
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button title="Descargar PDF" className="p-2 rounded-lg bg-white/5 text-textMuted hover:text-primary hover:bg-primary/10 transition-all">
                        <Download size={16} />
                      </button>
                      <button title="Ver Detalle" className="p-2 rounded-lg bg-white/5 text-textMuted hover:text-white transition-all">
                        <ArrowUpRight size={16} />
                      </button>
                      <button title="Más Opciones" className="p-2 rounded-lg text-textMuted hover:text-white transition-all">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create Invoice Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] bg-[#0a0a0a] border border-white/10 shadow-2xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 border-b border-white/5 bg-[#0a0a0a]">
                <div>
                  <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">Sistema Financiero</p>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight mt-0.5">Nueva Factura</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[9px] text-textMuted uppercase tracking-widest font-bold">N° Factura</p>
                    <p className="text-sm font-black text-primary font-mono">{form.invoiceNumber}</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-white/5 text-textMuted hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="px-8 py-6 space-y-6">
                {/* Client Info */}
                <div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-primary" /> Datos del Cliente
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className={labelCls}>Nombre del Cliente *</label>
                      <input className={inputCls} placeholder="Ej: Empresa Logística S.A.S."
                        value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Email</label>
                      <input className={inputCls} type="email" placeholder="cliente@empresa.com"
                        value={form.clientEmail} onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Teléfono</label>
                      <input className={inputCls} placeholder="+57 300 000 0000"
                        value={form.clientPhone} onChange={e => setForm(f => ({ ...f, clientPhone: e.target.value }))} />
                    </div>
                  </div>
                </div>

                {/* Invoice Config */}
                <div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-primary" /> Configuración
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Fecha de Vencimiento</label>
                      <input className={inputCls} type="date"
                        value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Estado Inicial</label>
                      <select className={inputCls} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Pagada">Pagada</option>
                        <option value="Vencida">Vencida</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-primary" /> Ítems de la Factura
                  </p>
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-2 px-1">
                      <span className="col-span-6 text-[9px] font-black text-textMuted uppercase tracking-widest">Descripción</span>
                      <span className="col-span-2 text-[9px] font-black text-textMuted uppercase tracking-widest text-center">Cant.</span>
                      <span className="col-span-3 text-[9px] font-black text-textMuted uppercase tracking-widest text-right">Precio Unit.</span>
                      <span className="col-span-1" />
                    </div>
                    {items.map((item, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                        <div className="col-span-6">
                          <input
                            className="w-full bg-transparent text-sm text-text placeholder:text-textMuted/40 focus:outline-none"
                            placeholder="Ej: Servicio de Mensajería Express"
                            value={item.description}
                            onChange={e => updateItem(i, 'description', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <input
                            type="number" min="1"
                            className="w-full bg-transparent text-sm text-text text-center focus:outline-none"
                            value={item.quantity}
                            onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number" min="0"
                            className="w-full bg-transparent text-sm text-text text-right focus:outline-none"
                            placeholder="0"
                            value={item.unitPrice || ''}
                            onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))}
                          />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <button onClick={() => removeItem(i)} disabled={items.length === 1}
                            className="p-1 rounded-lg text-textMuted hover:text-danger hover:bg-danger/10 transition-all disabled:opacity-20">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button onClick={addItem}
                      className="w-full py-3 rounded-2xl border border-dashed border-white/10 text-xs font-black text-textMuted hover:text-primary hover:border-primary/30 transition-all flex items-center justify-center gap-2">
                      <Plus size={14} /> Agregar ítem
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className={labelCls}>Notas y Condiciones</label>
                  <textarea
                    rows={2}
                    className={cn(inputCls, 'resize-none')}
                    placeholder="Condiciones de pago, observaciones..."
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </div>

                {/* Total */}
                <div className="flex items-center justify-between p-5 rounded-2xl bg-primary/5 border border-primary/20">
                  <div>
                    <p className="text-[10px] font-black text-textMuted uppercase tracking-widest">Total a Cobrar</p>
                    <p className="text-[9px] text-textMuted mt-0.5">{items.length} ítem(s) · {form.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-white">${total.toLocaleString('es-CO')}</p>
                    <p className="text-[9px] font-bold text-primary uppercase tracking-widest">COP</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 px-8 py-5 border-t border-white/5 bg-[#0a0a0a] flex items-center justify-between gap-3">
                <button onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 rounded-2xl border border-white/10 text-xs font-black uppercase tracking-widest text-textMuted hover:text-white hover:border-white/20 transition-all">
                  Cancelar
                </button>
                <Button
                  className="px-8 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-neon-blue"
                  onClick={handleSave}
                  isLoading={saving}
                >
                  Guardar Factura
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
