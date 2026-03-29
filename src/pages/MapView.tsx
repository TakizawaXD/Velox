import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Box, Info, Maximize, Target, Phone, User } from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { SEO } from '@/components/common/SEO';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const createIcon = (color: string) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueIcon = createIcon('blue');
const greenIcon = createIcon('green');
const redIcon = createIcon('red');
const goldIcon = createIcon('gold');

// Bogotá center as default
const BOGOTA_CENTER: [number, number] = [4.624335, -74.063644];

// Component to recenter map
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export function MapView() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>(BOGOTA_CENTER);
  const [zoom, setZoom] = useState(12);
  const [hasReferencedDriver, setHasReferencedDriver] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const qO = query(collection(db, 'orders'), where('tenantId', '==', currentUser.uid));
    const unsubO = onSnapshot(qO, (snap) => {
        setOrders(snap.docs.map((d) => {
            const data = d.data();
            return {
                id: d.id,
                ...data,
                // Use coordinates from document if available, otherwise random offset from Bogota
                lat: data.lat || (BOGOTA_CENTER[0] + (Math.random() - 0.5) * 0.1),
                lng: data.lng || (BOGOTA_CENTER[1] + (Math.random() - 0.5) * 0.1),
            };
        }));
    });

    const qD = query(collection(db, 'drivers'), where('tenantId', '==', currentUser.uid));
    const unsubD = onSnapshot(qD, (snap) => {
        setDrivers(snap.docs.map((d) => {
            const data = d.data();
            return {
                id: d.id,
                ...data,
                lat: data.lat || (BOGOTA_CENTER[0] + (Math.random() - 0.5) * 0.08),
                lng: data.lng || (BOGOTA_CENTER[1] + (Math.random() - 0.5) * 0.08),
            };
        }));
    });

    return () => { unsubO(); unsubD(); };
  }, [currentUser]);

  // Handle focused entity from navigation state (Mobile optimization)
  useEffect(() => {
    if (location.state && !hasReferencedDriver) {
      if (location.state.selectedDriverId && drivers.length > 0) {
        const target = drivers.find(d => d.id === location.state.selectedDriverId);
        if (target && target.lat && target.lng) {
          setMapCenter([target.lat, target.lng]);
          setZoom(17);
          setHasReferencedDriver(true);
        }
      } else if (location.state.selectedOrderId && orders.length > 0) {
        const target = orders.find(o => o.id === location.state.selectedOrderId);
        if (target && target.lat && target.lng) {
          setMapCenter([target.lat, target.lng]);
          setZoom(17);
          setHasReferencedDriver(true);
        }
      } else if (location.state.selectedCustomerId && orders.length > 0) {
        // Focus on the most recent order for this customer
        const target = orders.find(o => o.clientId === location.state.selectedCustomerId);
        if (target && target.lat && target.lng) {
          setMapCenter([target.lat, target.lng]);
          setZoom(17);
          setHasReferencedDriver(true);
        }
      }
    }
  }, [drivers, orders, location.state, hasReferencedDriver]);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-8 font-inter">
      <SEO title="Logística en Vivo" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Mapa<span className="text-primary italic">.</span></h1>
          <p className="text-textMuted text-[10px] font-black uppercase tracking-[0.3em] mt-1">Soberanía de Datos en Tiempo Real</p>
        </div>
        
        <div className="flex items-center gap-2">
           <Badge variant="success" className="gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"/> Sistema GPS Activo</Badge>
           <div className="h-8 w-px bg-white/5 mx-2" />
           <p className="text-[10px] font-black text-textMuted uppercase tracking-widest">{drivers.length} Vehículos · {orders.length} Puntos</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Map Container */}
        <Card className="lg:col-span-9 glass-panel p-0 relative overflow-hidden border-white/5 shadow-2xl min-h-[450px] lg:min-h-0">
          <MapContainer 
            center={mapCenter} 
            zoom={zoom} 
            style={{ height: '100%', width: '100%', background: '#111' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            <ChangeView center={mapCenter} zoom={zoom} />

            {/* Order Markers */}
            {orders.map(order => (
              <Marker 
                key={order.id} 
                position={[order.lat, order.lng]} 
                icon={order.status === 'Entregado' ? greenIcon : blueIcon}
              >
                <Popup className="velox-popup">
                  <div className="p-1 space-y-2">
                    <p className="font-black text-sm text-[#111]">#{order.id}</p>
                    <p className="text-xs text-gray-600 font-bold">{order.client}</p>
                    <Badge variant={order.status === 'Entregado' ? 'success' : 'primary'}>{order.status}</Badge>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Driver Markers */}
            {drivers.filter(d => d.status !== 'Offline').map(driver => (
              <Marker 
                key={driver.id} 
                position={[driver.lat, driver.lng]} 
                icon={driver.status === 'Disponible' ? goldIcon : redIcon}
              >
                <Popup className="velox-popup">
                   <div className="p-3 min-w-[200px] space-y-3">
                      <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="font-black text-sm text-gray-900 leading-none">{driver.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Repartidor Velox</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-gray-400 uppercase">Vehículo</span>
                          <span className="text-xs font-bold text-gray-700">{driver.vehicleType || 'Moto'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-gray-400 uppercase">Placa</span>
                          <span className="text-xs font-bold text-primary tracking-widest">{driver.plate || '---'}</span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                           <Badge variant={driver.status === 'Disponible' ? 'success' : 'primary'} className="text-[9px]">
                             {driver.status}
                           </Badge>
                           <span className="text-[10px] font-bold text-gray-400">{driver.zone || 'Bogotá'}</span>
                        </div>
                        
                        <a 
                          href={`tel:${driver.phone}`} 
                          className="flex items-center justify-center gap-2 w-full py-2 bg-primary text-white text-[10px] font-black rounded-lg hover:bg-primary-dark transition-colors no-underline shadow-sm"
                        >
                          <Phone size={12} /> LLAMAR AHORA
                        </a>
                      </div>
                   </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          
          {/* Custom Overlay Controls */}
          <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
             <button onClick={() => setZoom(z => z + 1)} className="p-3 bg-surface border border-white/10 rounded-xl hover:bg-white/5 transition-all shadow-xl text-text">
                <Maximize size={18} />
             </button>
             <button onClick={() => { setMapCenter(BOGOTA_CENTER); setZoom(12); }} className="p-3 bg-primary text-white rounded-xl hover:scale-105 transition-all shadow-neon-blue">
                <Target size={18} />
             </button>
          </div>

          <div className="absolute bottom-6 left-6 z-[1000]">
             <div className="bg-surface/80 backdrop-blur-md border border-white/10 p-4 rounded-[24px] shadow-2xl flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-blue-500" />
                   <span className="text-[10px] font-black text-text uppercase tracking-widest">Pedido</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-yellow-500" />
                   <span className="text-[10px] font-black text-text uppercase tracking-widest">Repartidor</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-green-500" />
                   <span className="text-[10px] font-black text-text uppercase tracking-widest">Entregado</span>
                </div>
             </div>
          </div>
        </Card>

        {/* Right Info Panel */}
        <Card className="lg:col-span-3 glass-panel p-6 border-white/5 flex flex-col gap-6 overflow-hidden bg-surface/30">
           <h3 className="font-black text-text flex items-center gap-2">
              <Box size={18} className="text-primary" /> Tracking en Tiempo Real
           </h3>
           
           <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {orders.slice(0, 8).map(order => (
                <div key={order.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-primary font-bold">{order.id}</span>
                      <Badge variant={order.status === 'Entregado' ? 'success' : 'primary'} className="text-[9px]">{order.status}</Badge>
                   </div>
                   <p className="text-sm font-black text-text truncate">{order.client}</p>
                   <p className="text-xs text-textMuted mt-1 truncate">{order.address}</p>
                </div>
              ))}
           </div>

           <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <div className="flex gap-3">
                 <Info size={16} className="text-primary shrink-0" />
                 <p className="text-[10px] text-textMuted leading-relaxed">
                    Las ubicaciones de los pedidos son simuladas para visualización. Los repartidores usan GPS real.
                 </p>
              </div>
           </div>
        </Card>

      </div>
    </div>
  );
}
