import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, Wallet, ShieldCheck, Zap, 
  Settings, Key, ExternalLink, PlusCircle,
  TrendingDown, Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { SEO } from '@/components/common/SEO';

export function Billing() {
  const [activeGateway, setActiveGateway] = useState<'wompi' | 'epayco' | 'stripe'>('wompi');
  
  const gateways = [
    { id: 'wompi', name: 'Wompi (Bancolombia)', icon: Zap, status: 'Activo', color: 'text-primary' },
    { id: 'epayco', name: 'ePayco (Daviplata/Nequi)', icon: Wallet, status: 'Inactivo', color: 'text-accent' },
    { id: 'stripe', name: 'Stripe Global', icon: GlobeIcon, status: 'Inactivo', color: 'text-blue-400' },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <SEO title="Pagos" />
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Configuración de <span className="text-primary italic">Pagos.</span></h2>
        <p className="text-sm text-textMuted font-medium">Gestiona pasarelas de pago, suscripciones e infraestructura de cobros corporativos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column - Payment Gateways */}
        <div className="md:col-span-8 space-y-6">
          <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                  <ShieldCheck className="text-primary" /> Pasarelas de Pago Oficiales
               </h3>
               <span className="text-[10px] font-black text-primary px-3 py-1 bg-primary/10 rounded-full uppercase tracking-widest">Asegurado por Velox</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               {gateways.map((g) => (
                 <button 
                  key={g.id}
                  onClick={() => setActiveGateway(g.id as any)}
                  className={cn(
                    "p-6 rounded-3xl border transition-all text-left flex flex-col gap-4 group",
                    activeGateway === g.id 
                      ? "bg-primary/10 border-primary/30 shadow-neon-blue" 
                      : "bg-white/5 border-white/5 hover:border-white/10"
                  )}
                 >
                    <div className={cn("p-2 rounded-xl bg-white/5 w-fit", g.color)}>
                       <g.icon size={20} />
                    </div>
                    <div>
                       <div className="text-sm font-black text-white">{g.name}</div>
                       <div className={cn("text-[10px] uppercase tracking-widest font-black mt-1", 
                         g.status === 'Activo' ? "text-primary" : "text-textMuted"
                       )}>{g.status}</div>
                    </div>
                 </button>
               ))}
            </div>

            {/* Gateway Configuration Simulation */}
            <div className="mt-8 p-8 rounded-3xl bg-white/5 border border-white/5 space-y-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <Settings className="text-textMuted" size={18} />
                     <span className="text-[10px] font-black text-textMuted uppercase tracking-widest italic">Parámetros de {activeGateway.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-primary">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Producción
                  </div>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-textMuted uppercase tracking-widest ml-1">Clave Pública (Public Key)</label>
                     <div className="relative group">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={14} />
                        <input 
                          type="password" 
                          value="pub_test_98y2h89yhf98y2h389h" 
                          readOnly 
                          className="w-full bg-black/40 border border-white/5 rounded-xl h-12 pl-10 pr-4 text-xs font-mono text-primary/80"
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-textMuted uppercase tracking-widest ml-1">Clave Privada (Private Key)</label>
                     <div className="relative group">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={14} />
                        <input 
                          type="password" 
                          value="prv_test_8923h892h389h238h" 
                          readOnly 
                          className="w-full bg-black/40 border border-white/5 rounded-xl h-12 pl-10 pr-4 text-xs font-mono text-primary/80"
                        />
                     </div>
                  </div>
               </div>
               
               <div className="flex justify-end pt-4">
                  <Button className="rounded-xl px-8 font-black text-[11px] uppercase tracking-widest">Actualizar Integración</Button>
               </div>
            </div>
          </div>

          {/* Statistics Chart Simulation */}
          <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05]">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-white tracking-tight">Comportamiento del Flujo</h3>
                <TrendingDown className="text-accent" size={24} />
             </div>
             <div className="h-48 flex items-end gap-2 px-4 relative">
                {/* Simulated Chart Bars */}
                {[40, 65, 30, 85, 45, 95, 60, 75, 55, 90].map((h, i) => (
                   <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05, duration: 0.8 }}
                    className="flex-1 bg-gradient-to-t from-primary/40 to-primary/10 rounded-t-lg group relative"
                   >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface p-1 rounded-md text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                         ${(h * 1.5).toFixed(1)}M
                      </div>
                   </motion.div>
                ))}
                <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
             </div>
             <div className="grid grid-cols-10 gap-2 mt-4 px-4">
                {['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT'].map(m => (
                   <div key={m} className="text-[9px] font-black text-textMuted text-center tracking-widest">{m}</div>
                ))}
             </div>
          </div>
        </div>

        {/* Right Column - Secondary Controls */}
        <div className="md:col-span-4 space-y-6">
           <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] h-fit">
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-3 mb-8">
                 <CreditCard className="text-primary" /> Métodos de Pago
              </h3>
              
              <div className="space-y-4 mb-8">
                 {[
                    { type: 'Mastercard', last4: '8842', exp: '08/28', bank: 'Bancolombia' },
                    { type: 'Visa', last4: '1205', exp: '11/27', bank: 'Daviplata' }
                 ].map((card, i) => (
                   <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 group hover:border-primary/40 transition-all cursor-pointer">
                      <div className="w-12 h-8 rounded bg-black/40 border border-white/5 flex items-center justify-center text-[10px] font-black italic text-white/40 uppercase group-hover:text-primary transition-colors">
                         {card.type}
                      </div>
                      <div className="flex-1">
                         <div className="text-sm font-black text-white">•••• {card.last4}</div>
                         <div className="text-[10px] text-textMuted font-medium italic uppercase tracking-widest">{card.bank}</div>
                      </div>
                      <div className="text-[10px] font-black text-textMuted italic">{card.exp}</div>
                   </div>
                 ))}
                 
                 <button className="w-full h-14 rounded-2xl border border-dashed border-white/10 text-textMuted hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest">
                    <PlusCircle size={16} /> Añadir Tarjeta
                 </button>
              </div>

              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex gap-4">
                 <Info size={24} className="text-primary shrink-0" />
                 <p className="text-xs text-textMuted leading-relaxed font-medium">
                    Tus datos están protegidos por encriptación de grado bancario y cifrado SSL de 256 bits.
                 </p>
              </div>
           </div>

           <div className="p-8 rounded-[40px] bg-gradient-to-br from-primary/10 to-accent/10 border border-white/5 h-fit text-center">
              <Zap className="mx-auto text-primary mb-6" size={40} />
              <h4 className="text-xl font-black text-white mb-2 italic">¿Necesitas API Avanzada?</h4>
              <p className="text-sm text-textMuted font-medium mb-8">Contacta a nuestro equipo técnico para integraciones personalizadas y volumen Enterprise.</p>
              <Button variant="outline" className="w-full rounded-2xl border-white/10 hover:border-primary/50 font-black text-[10px] tracking-[0.2em] uppercase h-14 flex items-center gap-3">
                 Documentación API <ExternalLink size={16} />
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}

// Simple Globe Icon helper
function GlobeIcon({ size }: { size?: number }) {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
         <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
      </svg>
   )
}
