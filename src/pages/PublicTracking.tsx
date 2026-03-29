import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Package, MapPin, Clock, CheckCircle2, 
  Truck, ArrowLeft, Phone, Info, Navigation
} from 'lucide-react';

// Fix Leaflet icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

export function PublicTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;
      try {
        const snap = await getDoc(doc(db, 'orders', orderId));
        if (snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() });
        } else {
          setError(true);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4"
        />
        <p className="text-textMuted font-medium animate-pulse">Localizando tu pedido Velox...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-danger/10 rounded-full flex items-center justify-center text-danger mb-6">
          <Info size={40} />
        </div>
        <h1 className="text-2xl font-bold text-text mb-2">Pedido no encontrado</h1>
        <p className="text-textMuted mb-8 max-w-sm">No pudimos encontrar un pedido con ese número de guía. Por favor verifica el enlace.</p>
        <Link to="/login">
          <Button variant="outline">
            <ArrowLeft className="mr-2" size={16} /> Ir al Inicio
          </Button>
        </Link>
      </div>
    );
  }

  const steps = [
    { label: 'Pendiente', icon: Clock, status: 'Pendiente' },
    { label: 'En camino', icon: Truck, status: 'En Camino' },
    { label: 'Entregado', icon: CheckCircle2, status: 'Entregado' }
  ];

  const currentStep = steps.findIndex(s => s.status === order.status);
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-text selection:bg-primary/30">
      {/* Background patterns */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 py-12 lg:py-20">
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-12 text-center">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-neon-blue mb-4"
          >
            <Package className="h-6 w-6 text-white" />
          </motion.div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-1">Rastreo de Pedido</h1>
          <p className="text-textMuted font-medium text-sm">Logística Inteligente by Velox</p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-panel border-white/5 p-6 md:p-8 mb-6 overflow-hidden relative">
            {/* Status Banner */}
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-[10px] font-black text-textMuted uppercase tracking-[0.2em] mb-1">Guía de Envío</p>
                <h2 className="text-xl font-mono font-black text-primary">#{order.id?.slice(0, 10).toUpperCase()}</h2>
              </div>
              <Badge variant={order.status === 'Entregado' ? 'success' : order.status === 'En Camino' ? 'primary' : 'default'} className="px-4 py-1 text-xs font-black uppercase tracking-wider">
                {order.status}
              </Badge>
            </div>

            {/* Visual Progress Bar */}
            <div className="relative mb-12 px-2">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2 rounded-full" />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-primary to-accent -translate-y-1/2 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
              />
              
              <div className="flex justify-between relative z-10">
                {steps.map((step, i) => {
                  const isActive = i <= currentStep;
                  const Icon = step.icon;
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 shadow-xl ${
                        isActive ? 'bg-primary text-white scale-110 shadow-neon-blue' : 'bg-surface border border-white/5 text-textMuted'
                      }`}>
                        <Icon size={18} />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest mt-3 transition-colors ${
                        isActive ? 'text-text' : 'text-textMuted'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/[0.02] rounded-[24px] border border-white/5">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-textMuted uppercase tracking-wider mb-1">Dirección de Entrega</p>
                    <p className="text-sm font-bold text-text">{order.address}</p>
                    <p className="text-xs text-textMuted">{order.city || 'Colombia'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                    <Navigation size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-textMuted uppercase tracking-wider mb-1">Destinatario</p>
                    <p className="text-sm font-bold text-text">{order.client}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-textMuted uppercase tracking-wider mb-1">Última Actualización</p>
                    <p className="text-sm font-bold text-text">
                      {order.updatedAt?.toDate ? order.updatedAt.toDate().toLocaleString('es-CO') : new Date().toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
                {order.driverPhone && (
                   <a 
                    href={`tel:${order.driverPhone}`}
                    className="flex items-center justify-center gap-3 w-full py-3 bg-success/10 border border-success/20 rounded-xl text-success font-black text-[11px] uppercase tracking-widest hover:bg-success/20 transition-all no-underline"
                   >
                     <Phone size={14} /> Contactar Repartidor
                   </a>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Live Map Tracking (Simplified) */}
        {order.lat && order.lng && (
           <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
           >
              <Card className="glass-panel border-white/5 p-0 overflow-hidden shadow-2xl h-[300px] relative group">
                <div className="absolute top-4 left-4 z-[1000] pointer-events-none">
                   <Badge variant="primary" className="bg-primary shadow-neon-blue border-none px-3 font-black text-[10px] animate-pulse">
                     GPS LIVE
                   </Badge>
                </div>
                <MapContainer 
                  center={[order.lat, order.lng]} 
                  zoom={15} 
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                  <Marker position={[order.lat, order.lng]} />
                  <ChangeView center={[order.lat, order.lng]} />
                </MapContainer>
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                   <p className="text-[10px] text-white/60 font-medium italic text-center">Ubicación aproximada del paquete en tiempo real</p>
                </div>
              </Card>
           </motion.div>
        )}

        <footer className="mt-12 text-center">
           <p className="text-[11px] text-textMuted font-bold uppercase tracking-[0.3em]">Velox Logistics Cloud v4.5</p>
        </footer>
      </div>
    </div>
  );
}
