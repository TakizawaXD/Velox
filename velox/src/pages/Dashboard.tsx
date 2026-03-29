import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  Package, Users, Clock, DollarSign, Activity, 
  Map as MapIcon, Plus, ChevronRight, Zap, Target,
  ArrowUpRight, List
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Agrupa pedidos por hora del día para la gráfica
function buildChartData(orders: any[]) {
  const hours = ['08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00'];
  const now = new Date();

  return hours.map(h => {
    const [hh] = h.split(':').map(Number);
    const total = orders.filter(o => {
      if (!o.createdAt) return false;
      const d = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
      return d.getHours() === hh && d.toDateString() === now.toDateString();
    }).length;
    const completados = orders.filter(o => {
      if (!o.createdAt) return false;
      const d = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
      return d.getHours() === hh && d.toDateString() === now.toDateString() && o.status === 'Entregado';
    }).length;
    return { time: h, pedidos: total, completados };
  });
}

const QuickAction = ({ icon: Icon, label, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-surfaceHover/40 hover:bg-primary/10 border border-white/5 hover:border-primary/30 transition-all"
  >
    <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
      <Icon size={20} />
    </div>
    <span className="text-xs font-semibold text-textMuted group-hover:text-primary">{label}</span>
  </button>
);

export function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    // Listen to all orders for stats
    const qOrders = query(collection(db, 'orders'), where('tenantId', '==', currentUser.uid));
    const unsubsOrders = onSnapshot(qOrders, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(data);
      setChartData(buildChartData(data));
      setLoading(false);
    });

    // Recent orders (limited for performance)
    const qRecent = query(
      collection(db, 'orders'), 
      where('tenantId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const unsubsRecent = onSnapshot(qRecent, (snapshot) => {
      setRecentOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Drivers info
    const qDrivers = query(collection(db, 'drivers'), where('tenantId', '==', currentUser.uid));
    const unsubsDrivers = onSnapshot(qDrivers, (snapshot) => {
      setDrivers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubsOrders();
      unsubsRecent();
      unsubsDrivers();
    };
  }, [currentUser]);

  const activeOrders = orders.filter(o => o.status !== 'Entregado' && o.status !== 'Cancelado').length;
  const deliveredToday = orders.filter(o => {
    if (!o.createdAt) return false;
    const d = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
    return d.toDateString() === new Date().toDateString() && o.status === 'Entregado';
  }).length;
  
  const totalIncome = orders
    .filter(o => o.status === 'Entregado')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    
  const deliverySuccessRate = orders.length > 0 
    ? Math.round((orders.filter(o => o.status === 'Entregado').length / orders.length) * 100) 
    : 100;

  const onlineDrivers = drivers.filter(d => d.status !== 'Offline').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-textMuted gap-4">
        <div className="relative">
          <Activity size={48} className="animate-spin text-primary" />
          <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
        </div>
        <div className="text-center font-medium">
          <p className="text-xl text-text">Sincronizando Torre de Control</p>
          <p className="text-sm opacity-60">Optimizando rutas y cargando flota...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
      {/* Welcome & Context Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl md:text-4xl font-black text-text tracking-tight flex items-center gap-3"
          >
            Panel de Control <Zap className="text-primary fill-primary" size={28} />
          </motion.h1>
          <p className="text-textMuted text-sm md:text-base font-medium">
            Velox Logistics — <span className="text-primary">{deliveredToday} entregas hoy</span> en tiempo récord.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-surfaceHover/50 border border-white/5 rounded-2xl text-xs font-bold text-textMuted uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            Sistema Operativo
          </div>
          <Button 
            onClick={() => navigate('/orders')} 
            className="shadow-neon-blue gap-2 py-3 px-6 rounded-2xl md:text-base"
          >
            <Plus size={18} /> Nuevo Despacho
          </Button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Operación Activa', 
            value: activeOrders, 
            icon: Package, 
            color: 'text-blue-400', 
            trend: `${orders.length} pedidos hoy`,
            bg: 'bg-blue-400/10'
          },
          { 
            label: 'Ingresos Entregados', 
            value: `$${(totalIncome/1000).toFixed(1)}k`, 
            icon: DollarSign, 
            color: 'text-emerald-400', 
            trend: 'COP liquidados',
            bg: 'bg-emerald-400/10'
          },
          { 
            label: 'Flota Disponible', 
            value: `${onlineDrivers}/${drivers.length}`, 
            icon: Users, 
            color: 'text-amber-400', 
            trend: 'Repartidores activos',
            bg: 'bg-amber-400/10'
          },
          { 
            label: 'Tasa de Éxito', 
            value: `${deliverySuccessRate}%`, 
            icon: Target, 
            color: 'text-purple-400', 
            trend: 'Entregas vs pedidos',
            bg: 'bg-purple-400/10'
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6 glass-panel relative overflow-hidden group hover:border-primary/20 transition-all cursor-default h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-textMuted uppercase tracking-wider mb-2">{stat.label}</p>
                  <h3 className="text-4xl font-black text-text tracking-tighter">{stat.value}</h3>
                  <div className="mt-2 text-xs font-semibold text-textMuted flex items-center gap-1.5">
                    <span className={`p-1 rounded-md ${stat.bg} ${stat.color}`}>
                      <ArrowUpRight size={12} />
                    </span>
                    {stat.trend}
                  </div>
                </div>
                <div className={`p-4 rounded-3xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={28} />
                </div>
              </div>
              {/* Subtle accent line */}
              <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-${stat.color.split('-')[1]}-500 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity`} />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left: Performance Graph */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          <Card className="glass-panel p-6 flex flex-col h-full min-h-[450px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-black text-text">Rendimiento Operativo</h3>
                <p className="text-sm text-textMuted font-medium">Frecuencia de entregas en tiempo real (Ciclo 24h)</p>
              </div>
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5 self-start sm:self-auto">
                <Badge variant="primary">Hoy</Badge>
                <div className="px-3 py-1 text-xs text-textMuted font-bold hover:text-text transition-colors cursor-pointer">Semana</div>
              </div>
            </div>

            <div className="flex-1 w-full relative">
              {orders.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-textMuted text-center">
                  <Package size={64} className="opacity-10 mb-4" />
                  <p className="font-bold">Sin datos para graficar</p>
                  <p className="text-sm opacity-50 px-6 max-w-sm">Registra pedidos para activar el monitor de rendimiento visual.</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="glowPedidos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="5 5" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#ffffff20" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      dy={10}
                      className="font-mono font-bold"
                    />
                    <YAxis 
                      stroke="#ffffff20" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false} 
                      allowDecimals={false}
                      className="font-mono"
                    />
                    <Tooltip
                      cursor={{ stroke: '#3b82f620', strokeWidth: 2 }}
                      contentStyle={{ 
                        backgroundColor: '#111', 
                        borderColor: '#333', 
                        borderRadius: '20px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                        borderWidth: '2px'
                      }}
                      itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                      labelStyle={{ color: '#666', marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pedidos" 
                      name="Pedidos Registrados" 
                      stroke="#3b82f6" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#glowPedidos)" 
                      animationDuration={2000}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="completados" 
                      name="Entregas Exitosas" 
                      stroke="#10b981" 
                      strokeWidth={2} 
                      strokeDasharray="5 5"
                      fill="transparent"
                      animationDuration={2500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Quick Actions Footer (Mobile mostly, visible on all) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction icon={MapIcon} label="Ver Mapa en Vivo" color="bg-primary/20 text-primary" onClick={() => navigate('/map')} />
            <QuickAction icon={List} label="Gestionar Historial" color="bg-emerald-400/20 text-emerald-400" onClick={() => navigate('/orders')} />
            <QuickAction icon={Users} label="Panel de Flota" color="bg-amber-400/20 text-amber-400" onClick={() => navigate('/drivers')} />
            <QuickAction icon={Activity} label="Analíticas Avanzadas" color="bg-purple-400/20 text-purple-400" onClick={() => navigate('/analytics')} />
          </div>
        </div>

        {/* Right: Latest Activity Sidebar */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <Card className="glass-panel p-6 flex flex-col h-full bg-surface/30">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-text">Últimas Alertas</h3>
                <p className="text-xs text-textMuted font-bold uppercase tracking-widest mt-1">Actividad Reciente</p>
              </div>
              <Badge variant="primary" className="animate-pulse shadow-neon-blue px-3 py-1">EN VIVO</Badge>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {recentOrders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative flex items-center gap-4 p-4 rounded-3xl bg-surfaceHover/30 border border-white/5 hover:border-white/10 transition-all cursor-default"
                  >
                    <div className={`p-3 rounded-2xl ${
                      order.status === 'Entregado' ? 'bg-success/20 text-success' : 
                      order.status === 'Cancelado' ? 'bg-danger/20 text-danger' : 
                      'bg-primary/20 text-primary'
                    }`}>
                      <Package size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-text truncate">{order.client}</p>
                        <span className="text-[10px] font-mono text-textMuted shrink-0">#{order.id?.substring(0, 6)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-textMuted flex items-center gap-1">
                          <Clock size={12} className="opacity-50" />
                          {order.status}
                        </p>
                        <p className="text-sm font-black text-text">${Number(order.amount).toLocaleString('es-CO')}</p>
                      </div>
                    </div>
                    {/* Hover state arrow */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0">
                      <ChevronRight size={18} className="text-textMuted" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {recentOrders.length === 0 && (
                <div className="py-20 text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <Zap size={20} className="text-textMuted opacity-20" />
                  </div>
                  <p className="text-sm text-textMuted">No hay actividad reciente en tu tenant.</p>
                </div>
              )}
            </div>

            <Button 
              variant="outline" 
              onClick={() => navigate('/orders')}
              className="mt-6 w-full border-white/10 hover:bg-white/5 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest gap-2"
            >
              Ver Todo el Historial <ChevronRight size={14} />
            </Button>
          </Card>

          {/* Mini Stats / Tips */}
          <Card className="glass-panel p-4 bg-gradient-to-br from-primary/20 to-accent/5 border-primary/20 border-2">
            <div className="flex gap-4">
              <div className="p-3 bg-primary rounded-2xl text-white shadow-neon-blue shrink-0">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-text">Tip de Eficiencia</p>
                <p className="text-xs text-textMuted mt-1 leading-relaxed">
                  Las rutas optimizadas hoy pueden reducir tus costos en un <span className="text-primary font-bold">15%</span>. Usa el mapa en vivo para monitorear desviaciones.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
