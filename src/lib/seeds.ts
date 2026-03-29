import { collection, addDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CIUDADES_DATA: Record<string, { lat: number, lng: number }> = {
  'Bogotá D.C.': { lat: 4.6243, lng: -74.0636 },
  'Medellín': { lat: 6.2442, lng: -75.5812 },
  'Cali': { lat: 3.4516, lng: -76.5320 },
  'Barranquilla': { lat: 10.9639, lng: -74.7964 },
  'Cartagena de Indias': { lat: 10.3910, lng: -75.4794 },
  'Cúcuta': { lat: 7.8939, lng: -72.5078 },
  'Bucaramanga': { lat: 7.1193, lng: -73.1227 },
  'Pereira': { lat: 4.8133, lng: -75.6961 },
  'Santa Marta': { lat: 11.2408, lng: -74.1990 },
  'Ibagué': { lat: 4.4389, lng: -75.2322 }
};

const CIUDADES = Object.keys(CIUDADES_DATA);
const STATUS_DRIVERS = ['Disponible', 'Offline', 'Entregando'];
const STATUS_ORDERS = ['Pendiente', 'Preparando', 'En camino', 'Entregado'];
const METODOS_PAGO = ['Efectivo (al recibir)', 'Nequi', 'Daviplata', 'Transferencia Bancaria'];
const PAQUETES = ['Documento / Sobre', 'Paquete Pequeño', 'Paquete Mediano', 'Electrónico', 'Ropa / Textil'];

const CLIENTES = [
  { name: 'Tienda de Moda "La Elegancia"', idNumber: '900.123.456-1', city: 'Bucaramanga' },
  { name: 'Distribuidora Medellín S.A.S.', idNumber: '830.005.112-5', city: 'Medellín' },
  { name: 'Frubana Cali Express', idNumber: '1020304051', city: 'Cali' },
  { name: 'Electrónicos Bogotá Centro', idNumber: '901.555.222-0', city: 'Bogotá D.C.' },
  { name: 'Restaurante Sabor Costeño', idNumber: '800.666.333-2', city: 'Barranquilla' },
  { name: 'Papelería El Faro IT', idNumber: '1010202030', city: 'Cartagena de Indias' },
];

const REPARTIDORES = [
  { name: 'Nelson Alberto Rodríguez', vehicleType: 'Moto (≤ 125cc)', plate: 'ABC 12D', zone: 'Zona Norte' },
  { name: 'Sandra Milena Martínez', vehicleType: 'Moto (> 125cc)', plate: 'XYZ 98F', zone: 'Zona Sur' },
  { name: 'Juan Carlos López', vehicleType: 'Carro', plate: 'GHI 456', zone: 'Ciudad Completa' },
  { name: 'Mauricio Gómez', vehicleType: 'Camioneta', plate: 'KKL 102', zone: 'Metropolitana' },
  { name: 'Paula Andrea Ríos', vehicleType: 'Bicicleta Eléctrica', plate: 'N/A', zone: 'Zona Centro' },
];

export async function seedDemoData(tenantId: string) {
  if (!tenantId) return;

  const results: { customers: string[], drivers: string[], orders: string[] } = {
    customers: [], drivers: [], orders: []
  };

  // 1. Seed Customers
  for (const c of CLIENTES) {
    const ref = await addDoc(collection(db, 'customers'), {
      ...c,
      phone: `+57 3${Math.floor(10 + Math.random() * 15)} ${Math.floor(100 + Math.random() * 800)} ${Math.floor(1000 + Math.random() * 8000)}`,
      email: `${c.name.split(' ')[0].toLowerCase()}@empresa.com.co`,
      address: `Calle ${Math.floor(Math.random() * 100)} # ${Math.floor(Math.random() * 50)} - ${Math.floor(Math.random() * 60)}`,
      neighborhood: 'Barrio Central',
      tenantId,
      createdAt: serverTimestamp(),
    });
    results.customers.push(ref.id);
  }

  // 2. Seed Drivers
  for (const d of REPARTIDORES) {
    const city = CIUDADES[Math.floor(Math.random() * CIUDADES.length)];
    const cityCoords = CIUDADES_DATA[city];

    const ref = await addDoc(collection(db, 'drivers'), {
      ...d,
      phone: `+57 300 ${Math.floor(100 + Math.random() * 800)} ${Math.floor(1000 + Math.random() * 8000)}`,
      cedula: `1.0${Math.floor(10 + Math.random() * 80)} ${Math.floor(100 + Math.random() * 800)} ${Math.floor(100 + Math.random() * 800)}`,
      city,
      licenseCategory: 'A2',
      status: STATUS_DRIVERS[Math.floor(Math.random() * STATUS_DRIVERS.length)],
      rating: (Math.random() * (5 - 4) + 4).toFixed(1),
      deliveries: Math.floor(Math.random() * 150),
      lat: cityCoords.lat + (Math.random() - 0.5) * 0.05,
      lng: cityCoords.lng + (Math.random() - 0.5) * 0.05,
      tenantId,
      createdAt: serverTimestamp(),
    });
    results.drivers.push(ref.id);
  }

  // 3. Seed Orders (15 Orders)
  for (let i = 0; i < 15; i++) {
    const customer = CLIENTES[Math.floor(Math.random() * CLIENTES.length)];
    const city = customer.city;
    const cityCoords = CIUDADES_DATA[city] || CIUDADES_DATA['Bogotá D.C.'];
    const amount = Math.floor(15000 + Math.random() * 45000);
    
    const hour = Math.floor(Math.random() * 24);
    const date = new Date();
    date.setHours(hour, Math.floor(Math.random() * 60));

    const status = STATUS_ORDERS[Math.floor(Math.random() * STATUS_ORDERS.length)];
    const driver = REPARTIDORES[Math.floor(Math.random() * REPARTIDORES.length)].name;

    const ref = await addDoc(collection(db, 'orders'), {
      client: customer.name,
      clientId: customer.idNumber,
      clientPhone: `+57 3${Math.floor(10 + Math.random() * 15)} ${Math.floor(100 + Math.random() * 800)} ${Math.floor(1000 + Math.random() * 8000)}`,
      city,
      address: `Carrera ${Math.floor(Math.random() * 50)} # ${Math.floor(Math.random() * 80)}`,
      neighborhood: 'Zona Operativa',
      packageType: PAQUETES[Math.floor(Math.random() * PAQUETES.length)],
      weight: (Math.random() * 15).toFixed(1),
      description: 'Envío de prueba Velox Logística',
      amount,
      declaredValue: amount * 10,
      paymentMethod: METODOS_PAGO[Math.floor(Math.random() * METODOS_PAGO.length)],
      status,
      driver: status === 'Pendiente' ? 'Por Asignar' : driver,
      time: status === 'Entregado' ? '1h 20m' : '-',
      lat: cityCoords.lat + (Math.random() - 0.5) * 0.08,
      lng: cityCoords.lng + (Math.random() - 0.5) * 0.08,
      tenantId,
      createdAt: Timestamp.fromDate(date),
    });
    
    await updateDoc(ref, { id: `ORD-${ref.id.substring(0, 6).toUpperCase()}` });
    results.orders.push(ref.id);
  }

  return results;
}
