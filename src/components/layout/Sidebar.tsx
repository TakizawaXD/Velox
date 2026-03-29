import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Package, Map as MapIcon, Users,
  Settings, LogOut, UserCircle, X, BarChart2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

interface SidebarProps {
  onClose?: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Package, label: 'Pedidos', path: '/orders' },
  { icon: MapIcon, label: 'Mapa Operacional', path: '/map' },
  { icon: UserCircle, label: 'Repartidores', path: '/drivers' },
  { icon: BarChart2, label: 'Analíticas', path: '/analytics' },
  { icon: Users, label: 'Usuarios', path: '/users' },
  { icon: Settings, label: 'Configuración', path: '/settings' },
];

export function Sidebar({ onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [brandName, setBrandName] = useState('Velox');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    setUserEmail(currentUser.email || '');
    setUserName(currentUser.displayName || 'Administrador');

    // Escucha en tiempo real para que el cambio de nombre en Settings actualice el Sidebar al instante
    const unsubscribe = onSnapshot(
      doc(db, 'users', currentUser.uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.brandName) setBrandName(data.brandName);
          else if (data.company) setBrandName(data.company);
          if (data.name) setUserName(data.name);
        }
      },
      () => {
        if (currentUser.displayName) setUserName(currentUser.displayName);
      }
    );
    return unsubscribe;
  }, [currentUser]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleNavClick = () => {
    onClose?.(); // Cierra sidebar en móvil al navegar
  };

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="relative flex h-screen w-72 lg:w-64 flex-col border-r border-white/5 bg-surface/95 backdrop-blur-xl"
    >
      {/* Mobile close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 lg:hidden rounded-lg p-1.5 text-textMuted hover:bg-white/10 hover:text-text transition-colors z-10"
        aria-label="Cerrar menú"
      >
        <X size={18} />
      </button>

      {/* Logo */}
      <div className="flex h-16 lg:h-20 items-center px-5 border-b border-white/5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-neon-blue">
            <Package className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white truncate" title={brandName}>
            {brandName}
          </span>
        </div>
      </div>

      {/* Nav */}
      <div className="flex flex-1 flex-col justify-between overflow-y-auto overflow-x-hidden p-3">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-sm transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-textMuted hover:bg-white/5 hover:text-text'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r-full bg-primary"
                    />
                  )}
                  <item.icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        <div className="mb-2 mt-4">
          <div className="rounded-2xl border border-white/5 bg-white/5 p-3 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-2.5 relative z-10">
              <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-neon-blue">
                <span className="text-white font-bold text-sm">
                  {userName?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-text truncate">{userName}</span>
                <span className="text-[11px] text-textMuted truncate">{userEmail}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-surfaceHover/50 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/10 relative z-10"
            >
              <LogOut size={14} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
