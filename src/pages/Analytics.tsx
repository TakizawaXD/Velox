import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Package, DollarSign,
  Clock, CheckCircle2, XCircle, BarChart2, TrendingUp
} from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { SEO } from '@/components/common/SEO';
import { StatsSkeleton, ChartSkeleton } from '@/components/common/SkeletonLoaders';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function Analytics() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'semana' | 'mes'>('semana');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const qO = query(collection(db, 'orders'), where('tenantId', '==', currentUser.uid));
    const unsubO = onSnapshot(qO, snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => { unsubO(); };
  }, [currentUser]);

  const total = orders.length;
  const delivered = orders.filter(o => o.status === 'Entregado').length;
  const cancelled = orders.filter(o => o.status === 'Cancelado').length;
  const active = orders.filter(o => !['Entregado', 'Cancelado'].includes(o.status)).length;
  const revenue = orders
    .filter(o => o.status === 'Entregado')
    .reduce((a, o) => a + (Number(o.amount) || 0), 0);
  const deliveryRate = total ? ((delivered / total) * 100).toFixed(1) : '0';
  const avgTicket = delivered ? (revenue / delivered) : 0;
  const efficiencyScore = total ? Math.min(100, (delivered / total) * 105).toFixed(0) : '0';

  const buildVolumeData = () => {
    const isSemana = range === 'semana';
    const source = isSemana ? DAYS : MONTHS;
    const buckets = source.map(name => ({ name, pedidos: 0, entregados: 0, ingresos: 0 }));
    
    orders.forEach(o => {
      const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt || 0);
      const idx = isSemana ? d.getDay() : d.getMonth();
      if (buckets[idx]) {
        buckets[idx].pedidos++;
        if (o.status === 'Entregado') {
          buckets[idx].entregados++;
          buckets[idx].ingresos += Number(o.amount) || 0;
        }
      }
    });
    return buckets;
  };

  const volumeData = buildVolumeData();
  const pieData = [
    { name: 'Entregados', value: delivered },
    { name: 'Activos', value: active },
    { name: 'Cancelados', value: cancelled }
  ].filter(d => d.value > 0);

  const tooltipStyle = {
    contentStyle: { backgroundColor: '#000', borderColor: '#333', borderRadius: '16px', border: '0.5px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' },
    itemStyle: { color: '#fff', fontSize: 12, fontWeight: '700' },
    labelStyle: { color: '#666', marginBottom: 4, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' as const },
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-inter pb-12">
      <SEO title="Analíticas Dashboard" />
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Analíticas<span className="text-primary italic">.</span></h1>
          <p className="text-textMuted text-[10px] font-black uppercase tracking-[0.3em] mt-1">Inteligencia de Datos Logísticos v4</p>
        </div>
        <div className="flex gap-1 bg-surface/50 rounded-2xl p-1 border border-white/5 w-fit backdrop-blur-xl">
          {(['semana', 'mes'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${range === r ? 'bg-white text-black shadow-2xl' : 'text-textMuted hover:text-white'}`}
            >
              {r === 'semana' ? '7 Días' : '30 Días'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {loading ? (
           [...Array(6)].map((_, i) => <StatsSkeleton key={i} />)
        ) : (
          [
            { label: 'Total Pedidos', value: String(total), icon: Package, color: 'text-primary' },
            { label: 'Entregados', value: String(delivered), icon: CheckCircle2, color: 'text-success', sub: `${deliveryRate}% Tasa`, up: true },
            { label: 'En Proceso', value: String(active), icon: Clock, color: 'text-warning' },
            { label: 'Cancelados', value: String(cancelled), icon: XCircle, color: 'text-danger', up: false },
            { label: 'Ingresos COP', value: `$${(revenue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-emerald-400', sub: `Avg: $${(avgTicket / 1000).toFixed(1)}K`, up: true },
            { label: 'Eficiencia AI', value: `${efficiencyScore}%`, icon: TrendingUp, color: 'text-accent', sub: 'Optimized', up: true },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-panel p-6 border-white/5 bg-surface/30 rounded-[24px] hover:border-white/10 transition-colors group">
                <div className={`mb-4 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${s.color} group-hover:bg-white/10 transition-colors`}><s.icon size={20} /></div>
                <p className="text-[10px] text-textMuted font-black uppercase tracking-widest leading-none">{s.label}</p>
                <p className="text-3xl font-black text-white mt-3 italic tracking-tighter leading-none">{s.value}</p>
                {s.sub && (
                  <p className={`text-[9px] font-black mt-4 flex items-center gap-1.5 uppercase tracking-wider ${s.up === false ? 'text-danger' : 'text-success'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${s.up === false ? 'bg-danger' : 'bg-success'}`} />
                    {s.sub}
                  </p>
                )}
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-panel lg:col-span-2 p-8 rounded-[32px] border-white/5 bg-surface/30">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Flujo de Operaciones</h3>
            <Badge variant="primary" className="text-[10px] font-black uppercase border-white/10">Live Optix</Badge>
          </div>
          {loading ? (
             <ChartSkeleton height={320} />
          ) : !isMounted || total === 0 ? (
            <div className="h-80 flex flex-col items-center justify-center text-textMuted gap-3">
              <BarChart2 size={48} className="opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-widest">Esperando Transacciones...</p>
            </div>
          ) : (
            <div className="h-80 w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData}>
                  <defs>
                    <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} tick={{ fontWeight: 700 }} />
                  <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => v} />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="pedidos" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorP)" />
                  <Area type="monotone" dataKey="entregados" stroke="#10b981" strokeWidth={3} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="glass-panel p-8 rounded-[32px] border-white/5 bg-surface/30">
          <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-8">Desempeño</h3>
          {loading ? (
            <ChartSkeleton height={280} />
          ) : !isMounted || pieData.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-textMuted text-[10px] font-black uppercase tracking-widest">Sin Data de Estado</div>
          ) : (
            <div className="h-80 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(v) => <span className="text-[10px] font-black uppercase text-textMuted tracking-wider">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
