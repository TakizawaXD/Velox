import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Package, DollarSign,
  Star, Clock, CheckCircle2, XCircle, Activity, BarChart2
} from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];


export function Analytics() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'semana' | 'mes'>('semana');

  useEffect(() => {
    if (!currentUser) return;

    const qO = query(collection(db, 'orders'), where('tenantId', '==', currentUser.uid));
    const unsubO = onSnapshot(qO, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    const qD = query(collection(db, 'drivers'), where('tenantId', '==', currentUser.uid));
    const unsubD = onSnapshot(qD, snap => {
      setDrivers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubO(); unsubD(); };
  }, [currentUser]);

  // ——— derivaciones ———
  const total = orders.length;
  const delivered = orders.filter(o => o.status === 'Entregado').length;
  const cancelled = orders.filter(o => o.status === 'Cancelado').length;
  const active = orders.filter(o => !['Entregado', 'Cancelado'].includes(o.status)).length;
  const revenue = orders
    .filter(o => o.status === 'Entregado')
    .reduce((a, o) => a + (Number(o.amount) || 0), 0);
  const deliveryRate = total ? ((delivered / total) * 100).toFixed(1) : '0';
  const avgTicket = delivered ? (revenue / delivered) : 0;
  const avgRating = drivers.length
    ? (drivers.reduce((a, d) => a + (Number(d.rating) || 0), 0) / drivers.length).toFixed(1)
    : '5.0';

  // ——— gráfica de volumen por día/semana ———
  const buildVolumeData = () => {
    if (range === 'semana') {
      const buckets = DAYS.map(d => ({ name: d, pedidos: 0, entregados: 0, ingresos: 0 }));
      orders.forEach(o => {
        const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt || 0);
        const idx = d.getDay();
        buckets[idx].pedidos++;
        if (o.status === 'Entregado') {
          buckets[idx].entregados++;
          buckets[idx].ingresos += Number(o.amount) || 0;
        }
      });
      return buckets;
    } else {
      const buckets = MONTHS.map(m => ({ name: m, pedidos: 0, entregados: 0, ingresos: 0 }));
      orders.forEach(o => {
        const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt || 0);
        const idx = d.getMonth();
        buckets[idx].pedidos++;
        if (o.status === 'Entregado') {
          buckets[idx].entregados++;
          buckets[idx].ingresos += Number(o.amount) || 0;
        }
      });
      return buckets;
    }
  };

  // ——— dona de estados ———
  const pieData = [
    { name: 'Entregados', value: delivered },
    { name: 'Activos', value: active },
    { name: 'Cancelados', value: cancelled },
  ].filter(d => d.value > 0);

  // ——— top ciudades ———
  const cityCount: Record<string, number> = {};
  orders.forEach(o => { if (o.city) cityCount[o.city] = (cityCount[o.city] || 0) + 1; });
  const topCities = Object.entries(cityCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

  // ——— formas de pago ———
  const paymentCount: Record<string, number> = {};
  orders.forEach(o => {
    const p = o.paymentMethod || 'Sin especificar';
    paymentCount[p] = (paymentCount[p] || 0) + 1;
  });
  const paymentData = Object.entries(paymentCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // ——— top repartidores ———
  const topDrivers = [...drivers]
    .sort((a, b) => (b.deliveries || 0) - (a.deliveries || 0))
    .slice(0, 5);

  const volumeData = buildVolumeData();

  const tooltipStyle = {
    contentStyle: { backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px' },
    itemStyle: { color: '#f4f4f5', fontSize: 12 },
    labelStyle: { color: '#a1a1aa', marginBottom: 4 },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-textMuted gap-2">
        <Activity size={18} className="animate-spin text-primary" /> Calculando métricas...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">Analíticas</h1>
          <p className="text-textMuted text-sm">Métricas en tiempo real de tu operación logística en Colombia</p>
        </div>
        <div className="flex gap-1.5 bg-surface rounded-xl p-1 border border-white/5 w-fit">
          {(['semana', 'mes'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${range === r ? 'bg-primary text-white shadow-neon-blue' : 'text-textMuted hover:text-text'}`}
            >
              {r === 'semana' ? 'Esta Semana' : 'Este Año'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Pedidos', value: String(total), icon: Package, color: 'text-primary' },
          { label: 'Entregados', value: String(delivered), icon: CheckCircle2, color: 'text-success', sub: `${deliveryRate}% tasa`, up: true },
          { label: 'En Proceso', value: String(active), icon: Clock, color: 'text-warning' },
          { label: 'Cancelados', value: String(cancelled), icon: XCircle, color: 'text-danger', up: false },
          { label: 'Ingresos COP', value: `$${(revenue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-emerald-400', sub: `Ticket prom: $${avgTicket.toFixed(0)}`, up: true },
          { label: 'Rating Flota', value: `⭐ ${avgRating}`, icon: Star, color: 'text-yellow-400' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="glass-card p-4">
              <div className={`mb-2 ${s.color}`}><s.icon size={18} /></div>
              <p className="text-[10px] text-textMuted uppercase tracking-wider">{s.label}</p>
              <p className="text-xl font-bold text-text mt-0.5">{s.value}</p>
              {s.sub && (
                <p className={`text-[10px] mt-1 ${s.up === false ? 'text-danger' : 'text-success'}`}>{s.sub}</p>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Volumen + Dona */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Área: volumen */}
        <Card className="glass-panel lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text">Volumen de Pedidos</h3>
            <Badge variant="primary" className="text-[10px]">TIEMPO REAL</Badge>
          </div>
          {total === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-textMuted gap-2">
              <BarChart2 size={36} className="opacity-20" />
              <p className="text-sm">Registra pedidos para ver la gráfica</p>
            </div>
          ) : (
            <div className="h-60 min-h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gPedidos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gEntregados" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip {...tooltipStyle} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#a1a1aa' }} />
                  <Area type="monotone" dataKey="pedidos" name="Pedidos" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gPedidos)" />
                  <Area type="monotone" dataKey="entregados" name="Entregados" stroke="#10b981" strokeWidth={2.5} fill="url(#gEntregados)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Dona: estados */}
        <Card className="glass-panel">
          <h3 className="font-semibold text-text mb-4">Distribución por Estado</h3>
          {pieData.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-textMuted text-sm">Sin datos</div>
          ) : (
            <div className="h-60 min-h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={85}
                    paddingAngle={4} dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#a1a1aa' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Ingresos por período */}
      <Card className="glass-panel">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text">Ingresos (COP) por {range === 'semana' ? 'Día' : 'Mes'}</h3>
          <span className="text-xs text-textMuted">
            Total: <span className="text-success font-bold">${revenue.toLocaleString('es-CO')}</span>
          </span>
        </div>
        {total === 0 ? (
          <div className="h-52 flex items-center justify-center text-textMuted text-sm">Sin ingresos registrados</div>
        ) : (
          <div className="h-52 min-h-[208px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false}
                  tickFormatter={v => v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`}
                />
                <Tooltip
                  {...tooltipStyle}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={((v: any) => [`$${Number(v ?? 0).toLocaleString('es-CO')} COP`, 'Ingresos']) as any}
                />
                <Bar dataKey="ingresos" name="Ingresos" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                  {volumeData.map((_, i) => (
                    <Cell key={i} fill={`hsl(${210 + i * 8}, 80%, ${50 + i * 2}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Top Ciudades + Formas de Pago + Top Repartidores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Top ciudades */}
        <Card className="glass-panel">
          <h3 className="font-semibold text-text mb-4">📍 Top Ciudades</h3>
          {topCities.length === 0 ? (
            <p className="text-sm text-textMuted py-6 text-center">Sin datos de ciudades</p>
          ) : (
            <div className="space-y-3">
              {topCities.map((c, i) => (
                <div key={c.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text font-medium truncate">{c.name}</span>
                    <span className="text-textMuted shrink-0 ml-2">{c.value} pedidos</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.value / (topCities[0].value || 1)) * 100}%` }}
                      transition={{ delay: i * 0.1, duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Formas de pago */}
        <Card className="glass-panel">
          <h3 className="font-semibold text-text mb-4">💳 Formas de Pago</h3>
          {paymentData.length === 0 ? (
            <p className="text-sm text-textMuted py-6 text-center">Sin datos de pago</p>
          ) : (
            <div className="space-y-3">
              {paymentData.map((p, i) => (
                <div key={p.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text font-medium truncate max-w-[160px]">{p.name}</span>
                    <span className="text-textMuted shrink-0 ml-2">
                      {total > 0 ? `${((p.value / total) * 100).toFixed(0)}%` : '0%'}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(p.value / (paymentData[0].value || 1)) * 100}%` }}
                      transition={{ delay: i * 0.1, duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top repartidores */}
        <Card className="glass-panel">
          <h3 className="font-semibold text-text mb-4">🏆 Top Repartidores</h3>
          {topDrivers.length === 0 ? (
            <p className="text-sm text-textMuted py-6 text-center">Sin repartidores registrados</p>
          ) : (
            <div className="space-y-3">
              {topDrivers.map((d, i) => (
                <div key={d.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-zinc-400' : i === 2 ? 'bg-amber-700' : 'bg-surface'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">{d.name}</p>
                    <p className="text-xs text-textMuted">{d.vehicle || d.vehicleType || 'Vehículo N/A'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-text">{d.deliveries || 0}</p>
                    <p className="text-[10px] text-textMuted">entregas</p>
                  </div>
                  <div className="text-yellow-400 text-xs font-bold">
                    ⭐ {Number(d.rating || 5).toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Tabla resumen por tipo de paquete */}
      <Card className="glass-panel">
        <h3 className="font-semibold text-text mb-4">📦 Análisis por Tipo de Paquete</h3>
        {orders.length === 0 ? (
          <p className="text-sm text-textMuted text-center py-6">Sin pedidos para analizar</p>
        ) : (() => {
          const typeMap: Record<string, { count: number; revenue: number; delivered: number }> = {};
          orders.forEach(o => {
            const t = o.packageType || 'Sin especificar';
            if (!typeMap[t]) typeMap[t] = { count: 0, revenue: 0, delivered: 0 };
            typeMap[t].count++;
            if (o.status === 'Entregado') {
              typeMap[t].revenue += Number(o.amount) || 0;
              typeMap[t].delivered++;
            }
          });
          const rows = Object.entries(typeMap).sort((a, b) => b[1].count - a[1].count);
          return (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-textMuted text-xs uppercase tracking-wider">
                    <th className="text-left py-2 pr-4">Tipo</th>
                    <th className="text-right py-2 px-4">Pedidos</th>
                    <th className="text-right py-2 px-4">Entregados</th>
                    <th className="text-right py-2 px-4">Tasa</th>
                    <th className="text-right py-2 pl-4">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(([type, data]) => (
                    <tr key={type} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-4 text-text font-medium">{type}</td>
                      <td className="py-3 px-4 text-right text-textMuted">{data.count}</td>
                      <td className="py-3 px-4 text-right text-success">{data.delivered}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-medium ${(data.delivered / data.count) >= 0.8 ? 'text-success' : 'text-warning'}`}>
                          {data.count > 0 ? ((data.delivered / data.count) * 100).toFixed(0) : 0}%
                        </span>
                      </td>
                      <td className="py-3 pl-4 text-right font-mono text-text font-bold">
                        ${data.revenue.toLocaleString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </Card>
    </div>
  );
}
