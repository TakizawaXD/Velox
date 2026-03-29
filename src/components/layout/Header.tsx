import { Bell, Search, Menu, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [brandName, setBrandName] = useState('Velox');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (doc) => {
      if (doc.exists()) {
        setBrandName(doc.data().brandName || 'Velox');
      }
    });
    return unsub;
  }, [currentUser]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 flex h-16 lg:h-20 w-full items-center justify-between border-b border-white/5 bg-background/80 px-4 lg:px-8 backdrop-blur-xl"
    >
      {/* Mobile: hamburger + dynamic brand */}
      <div className="flex items-center gap-3 lg:hidden overflow-hidden">
        <button
          onClick={onOpenSidebar}
          className="rounded-xl p-2.5 text-textMuted hover:bg-white/5 hover:text-text transition-all active:scale-95"
          aria-label="Abrir menú"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent truncate max-w-[150px] tracking-tight">
          {brandName}
        </span>
      </div>

      {/* Desktop: Premium Search bar */}
      <div className="hidden lg:flex flex-1 items-center max-w-xl group">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Comando de búsqueda rápida..."
            className="w-full rounded-2xl border border-white/5 bg-surface/40 py-3 pl-12 pr-4 text-sm text-text placeholder:text-textMuted/40 focus:border-primary/40 focus:bg-surface/60 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-lg"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex gap-1">
             <kbd className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-textMuted uppercase tracking-widest">Ctrl</kbd>
             <kbd className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-textMuted uppercase tracking-widest">K</kbd>
          </div>
        </div>
      </div>

      {/* Right side interactions */}
      <div className="flex items-center gap-2 sm:gap-4 ml-auto">
        
        {/* Notifications */}
        <div className="relative">
          <button className="relative rounded-2xl p-2.5 text-textMuted hover:bg-white/5 hover:text-text transition-all active:scale-90 group">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary shadow-neon-blue animate-pulse" />
          </button>
        </div>
        
        <div className="h-8 w-px bg-white/5 mx-1 hidden sm:block" />
        
        {/* User profile dropdown trigger */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-white/5 transition-all active:scale-95"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-black text-text truncate max-w-[120px] leading-tight">
                {currentUser?.displayName || 'Administrador'}
              </p>
              <p className="text-[10px] text-primary flex items-center gap-1.5 justify-end font-bold uppercase tracking-widest opacity-80">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-neon-blue" />
                Live Hub
              </p>
            </div>
            
            {/* Real Avatar with gradient border */}
            <div className="p-0.5 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary animate-gradient-x shadow-neon-blue">
               <div className="h-9 w-9 md:h-10 md:w-10 rounded-2xl bg-[#09090b] flex items-center justify-center text-white font-black text-sm">
                {currentUser?.displayName?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            </div>
          </button>

          {/* Simple Dropdown Menu */}
          <AnimatePresence>
            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-56 rounded-[24px] bg-surface border border-white/10 p-2 shadow-2xl z-20 backdrop-blur-xl"
                >
                  <div className="px-4 py-3 border-b border-white/5 mb-1">
                    <p className="text-xs font-bold text-textMuted uppercase tracking-widest">Cuenta Activa</p>
                    <p className="text-sm font-bold text-text truncate mt-1">{currentUser?.email}</p>
                  </div>
                  <button 
                    onClick={() => { navigate('/settings'); setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-textMuted hover:text-text hover:bg-white/5 rounded-2xl transition-all"
                  >
                    <SettingsIcon size={18} className="text-primary" /> Ajustes de Sistema
                  </button>
                  <button 
                    onClick={() => { navigate('/perfil'); setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-textMuted hover:text-text hover:bg-white/5 rounded-2xl transition-all"
                  >
                    <User size={18} className="text-amber-400" /> Mi Identidad
                  </button>
                  <div className="h-px bg-white/5 my-1" />
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-danger hover:bg-danger/10 rounded-2xl transition-all"
                  >
                    <LogOut size={18} /> Desconectarse
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
