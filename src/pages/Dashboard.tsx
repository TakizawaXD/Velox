import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Package, Truck, 
  Clock, CheckCircle2, Plus,
  ArrowUpRight, ArrowDownRight, Zap, Activity
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { seedDemoData } from '@/lib/seeds';
import { toast } from 'react-hot-toast';
import { SEO } from '@/components/common/SEO';

interface OrderData {
  id: string;
  status?: string;
  createdAt?: any;
  client?: string;
  city?: string;
  amount?: number;
}

// Agrupa pedidos por hora del día para la gráfica
function buildChartData(orders: any[]) {
  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    pedidos: 0,
    completados: 0
  }));

  orders.forEach(order => {
    if (order.createdAt) {
      const date = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      const h = date.getHours();
      hours[h].pedidos++;
      if (order.status === 'Entregado') hours[h].completados++;
    }
  });

  return hours;
}

export function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeDrivers: 0,
    deliveredToday: 0,
    pendingOrders: 0
  });
  const [allOrders, setAllOrders] = useState<OrderData[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<OrderData[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSeed = async () => {
    if (!currentUser) return;
    if (!window.confirm('¿Deseas generar datos de prueba? Se añadirán 15 pedidos, 8 repartidores y 6 clientes con cobertura en Colombia.')) return;
    
    setIsSeeding(true);
    const id = toast.loading('Generando entorno de logística...');
    try {
      await seedDemoData(currentUser.uid);
      toast.success('¡Operación Velox activada! Datos cargados correctamente.', { id });
    } catch (err) {
      console.error(err);
      toast.error('Error al sincronizar datos demo.', { id });
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    // Listen for orders
    const qO = query(collection(db, 'orders'), where('tenantId', '==', currentUser.uid));
    const unsubO = onSnapshot(qO, (snap) => {
      const ordersArray = snap.docs.map(d => ({ id: d.id, ...d.data() })) as OrderData[];
      setAllOrders(ordersArray);
      
      setStats(prev => ({
        ...prev,
        totalOrders: ordersArray.length,
        deliveredToday: ordersArray.filter(o => o.status === 'Entregado').length,
        pendingOrders: ordersArray.filter(o => o.status === 'Pendiente' || o.status === 'Preparando').length
      }));
      
      setChartData(buildChartData(ordersArray));
      setRecentOrders(ordersArray.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      }).slice(0, 5));
    });

    // Listen for drivers
    const qD = query(collection(db, 'drivers'), where('tenantId', '==', currentUser.uid), where('status', '==', 'Disponible'));
    const unsubD = onSnapshot(qD, (snap) => {
      setStats(prev => ({ ...prev, activeDrivers: snap.size }));
    });

    return () => { unsubO(); unsubD(); };
  }, [currentUser]);

  const kpis = [
    { 
      label: 'Despachos Totales', 
      value: stats.totalOrders, 
      icon: Package, 
      trend: '+12%', 
      up: true,
      color: 'from-blue-500/20 to-indigo-500/20',
      iconColor: 'text-blue-400'
    },
    { 
      label: 'Drivers Activos', 
      value: stats.activeDrivers, 
      icon: Truck, 
      trend: 'En vivo', 
      up: true,
      color: 'from-emerald-500/20 to-teal-500/20',
      iconColor: 'text-emerald-400'
    },
    { 
      label: 'Entregas Hoy', 
      value: stats.deliveredToday, 
      icon: CheckCircle2, 
      trend: '+5%', 
      up: true,
      color: 'from-amber-500/20 to-orange-500/20',
      iconColor: 'text-amber-400'
    },
    { 
      label: 'Pendientes', 
      value: stats.pendingOrders, 
      icon: Clock, 
      trend: '-2%', 
      up: false,
      color: 'from-rose-500/20 to-pink-500/20',
      iconColor: 'text-rose-400'
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <SEO title="Dashboard" />
      {/* Header with Glassmorphism */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-2">
            <span className="w-8 h-[2px] bg-primary" /> 
            Sistema Operativo
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-text tracking-tighter flex items-baseline gap-2">
            Velox <span className="text-primary animate-pulse">Core</span>
          </h1>
          <p className="text-textMuted font-medium mt-1">Monitor de flujo logístico en tiempo real.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={handleSeed}
            isLoading={isSeeding}
            className="border-primary/20 hover:bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-2xl hidden sm:flex items-center gap-2"
          >
            <Zap size={14} className="fill-primary" /> Generar Demo
          </Button>
          <Button 
            onClick={() => navigate('/orders')} 
            className="shadow-neon-blue gap-2 py-3 px-6 rounded-2xl md:text-base font-bold"
          >
            <Plus size={18} /> Nuevo Despacho
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`relative overflow-hidden border-white/5 bg-gradient-to-br ${kpi.color} p-6 group hover:scale-[1.02] transition-all`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-surface shadow-xl ${kpi.iconColor}`}>
                   <kpi.icon size={24} />
                </div>
                <div className={`flex items-center text-xs font-black ${kpi.up ? 'text-success' : 'text-danger'}`}>
                  {kpi.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {kpi.trend}
                </div>
              </div>
              <h3 className="text-textMuted text-xs font-bold uppercase tracking-widest">{kpi.label}</h3>
              <p className="text-3xl font-black text-text mt-1">{kpi.value}</p>
              
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <kpi.icon size={100} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Operatividad de Flota */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="md:col-span-2 glass-panel border-white/5 bg-surface/30 p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-primary/20 transition-all">
           <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Activity size={32} />
           </div>
           <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-black text-text uppercase tracking-tighter">Eficiencia de Flota</h3>
              <p className="text-sm text-textMuted mt-1">Monitoreo de rendimiento basado en entregas completadas y tiempos de respuesta.</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                 <div className="px-3 py-1.5 bg-surface rounded-xl border border-white/10 text-[10px] font-bold text-success flex items-center gap-1.5">
                    <CheckCircle2 size={12} /> Operación Estable
                 </div>
                 <div className="px-3 py-1.5 bg-surface rounded-xl border border-white/10 text-[10px] font-bold text-primary flex items-center gap-1.5">
                    <Truck size={12} /> Flota activa
                 </div>
              </div>
           </div>
           <Button variant="outline" onClick={() => navigate('/map')} className="border-white/10 text-white uppercase font-bold text-[10px] tracking-widest hover:border-primary/50">
              Ver Mapa en Vivo
           </Button>
        </Card>
        
        <Card className="glass-panel border-accent/20 bg-accent/5 p-6">
           <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black text-accent uppercase tracking-widest">Score Operativo</h4>
              <Badge variant="primary" className="bg-accent/20 text-accent border-0">A+</Badge>
           </div>
           <div className="text-4xl font-black text-text font-mono">98.4<span className="text-xl text-textMuted">%</span></div>
           <p className="text-[10px] text-textMuted mt-1">Eficiencia de flota por encima del promedio nacional.</p>
           <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-accent" style={{ width: '98.4%' }} />
           </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart */}
        <Card className="lg:col-span-8 glass-panel p-8 border-white/5 flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-text flex items-center gap-2">
                <TrendingUp size={20} className="text-primary" /> Rendimiento Operativo (24H)
              </h3>
              <p className="text-xs text-textMuted font-medium italic">Distribución de carga por horas en Colombia</p>
            </div>
          </div>
          
          <div className="flex-1 w-full relative">
            {allOrders.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-textMuted text-center p-6">
                <Package size={64} className="opacity-10 mb-4" />
                <p className="font-bold text-lg text-text">Base de Datos de Logística Vacía</p>
                <p className="text-sm opacity-60 max-w-sm mb-6">
                  Para comenzar la demostración con datos de toda Colombia, puedes generar un entorno de prueba ahora mismo.
                </p>
                <Button 
                  onClick={handleSeed} 
                  isLoading={isSeeding}
                  className="shadow-neon-blue gap-2 py-4 px-8 rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  <Zap size={16} className="fill-white" /> Generar Entorno Operativo (Colombia)
                </Button>
              </div>
            ) : (
              <div className="h-[350px] w-full relative">
                {isMounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="hour" 
                      stroke="#ffffff40" 
                      fontSize={10} 
                      tickLine={false}
                      axisLine={false}
                      interval={3}
                    />
                    <YAxis 
                      stroke="#ffffff40" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#111', 
                        borderColor: '#ffffff10',
                        borderRadius: '16px',
                        fontSize: '12px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pedidos" 
                      stroke="#3b82f6" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorPed)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-4 glass-panel p-8 border-white/5 flex flex-col bg-surface/30">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-text flex items-center gap-2">
              <Activity size={20} className="text-accent" /> Actividad Live
            </h3>
            <button onClick={() => navigate('/orders')} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
              Ver Todo
            </button>
          </div>

          <div className="space-y-6 flex-1">
            {recentOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-textMuted opacity-30 italic text-sm">
                Esperando señales...
              </div>
            ) : (
              recentOrders.map((order, i) => (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-[20px] bg-white/5 border border-white/5 hover:border-primary/20 transition-all group cursor-pointer"
                  onClick={() => navigate('/orders')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                       <div className="p-2 rounded-lg bg-surface group-hover:bg-primary/20 transition-colors">
                          <Package size={14} className="text-primary" />
                       </div>
                       <span className="text-[10px] font-mono text-textMuted font-bold">#{order.id?.substring(0, 8)}</span>
                    </div>
                    <Badge variant={order.status === 'Entregado' ? 'success' : 'primary'} className="text-[9px]">
                      {order.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-black text-text truncate group-hover:text-primary transition-colors">{order.client}</p>
                    <p className="text-[10px] text-textMuted font-bold uppercase tracking-wider">
                      {order.city} · <span className="opacity-60">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Hace poco'}</span>
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/5">
             <div className="bg-primary/10 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-xs font-bold text-primary">Margen Operativo</span>
                <span className="text-lg font-black text-text">94.2%</span>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
