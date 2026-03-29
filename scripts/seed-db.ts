import { seedDemoData } from '../src/lib/seeds';

// If running as a standalone script
const tenantId = process.env.VITE_TENANT_ID || 'DEMO_TENANT_01';

console.log(`🚀 Iniciando carga de datos colombianos para el tenant: ${tenantId}...`);

seedDemoData(tenantId)
  .then((res) => {
    console.log('✅ Carga exitosa!');
    if (res) {
      console.log(`   - Clientes: ${res.customers?.length || 0}`);
      console.log(`   - Repartidores: ${res.drivers?.length || 0}`);
      console.log(`   - Pedidos: ${res.orders?.length || 0}`);
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error en la carga:', err);
    process.exit(1);
  });
