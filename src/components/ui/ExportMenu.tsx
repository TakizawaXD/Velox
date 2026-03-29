import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface ExportMenuProps {
  onExportExcel: () => void;
  onExportPDF: () => Promise<void>;
  disabled?: boolean;
  label?: string;
}

export function ExportMenu({ onExportExcel, onExportPDF, disabled, label = 'Exportar' }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<'pdf' | 'excel' | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExcel = () => {
    setLoading('excel');
    setOpen(false);
    try {
      onExportExcel();
      toast.success('Archivo Excel descargado correctamente');
    } catch (err) {
      console.error(err);
      toast.error('Error al exportar Excel');
    } finally {
      setLoading(null);
    }
  };

  const handlePDF = async () => {
    setLoading('pdf');
    setOpen(false);
    try {
      await onExportPDF();
      toast.success('Reporte PDF generado — usa Ctrl+P o el diálogo de impresión');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? 'Error al generar PDF');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={disabled || loading !== null}
        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-[11px] font-black uppercase tracking-widest text-textMuted hover:bg-white/10 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? (
          <svg className="animate-spin w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 12l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        )}
        {label}
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-[9px] font-black text-textMuted uppercase tracking-[0.4em]">Formato de Exportación</p>
            </div>

            {/* PDF Option */}
            <button
              onClick={handlePDF}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors group text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 group-hover:bg-red-500/20 transition-colors">
                {/* PDF icon */}
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-black text-white uppercase tracking-tight">PDF</p>
                <p className="text-[9px] text-textMuted font-medium">Reporte con diseño Velox</p>
              </div>
            </button>

            {/* Excel Option */}
            <button
              onClick={handleExcel}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors group text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                {/* Excel/spreadsheet icon */}
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M6 3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-black text-white uppercase tracking-tight">Excel (.xlsx)</p>
                <p className="text-[9px] text-textMuted font-medium">Compatible con Microsoft Excel</p>
              </div>
            </button>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-white/5 bg-white/[0.02]">
              <p className="text-[8px] text-white/20 font-bold uppercase tracking-widest text-center">Velox Supreme v4</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
