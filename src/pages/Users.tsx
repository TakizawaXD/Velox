import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Edit2, Trash2, UserPlus, Shield, Activity } from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export function Users() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    const q = query(collection(db, 'users'), where('tenantId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
      setIsLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Equipo y Accesos</h1>
          <p className="text-textMuted">Administra los miembros de tu organización B2B.</p>
        </div>
        <Button className="gap-2 shadow-neon-blue">
          <UserPlus size={18} /> Invitar Miembro
        </Button>
      </div>

      <Card className="glass-panel overflow-hidden p-0 border-white/5 relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center text-textMuted">
            <Activity className="animate-spin text-primary mr-2" size={20} /> Recuperando roles y accesos...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Miembro</TableHead>
                <TableHead>Organización</TableHead>
                <TableHead>Rol Asignado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="group hover:bg-surfaceHover/30 transition-colors">
                  <TableCell className="font-medium flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surfaceHover border border-white/10 flex items-center justify-center font-bold text-primary shadow-inner">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-text font-medium">{user.name}</p>
                      <p className="text-xs text-textMuted">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-textMuted">
                    {user.company || 'N/A'} 
                    <span className="block text-[10px] uppercase opacity-60 mt-0.5">{user.organizationType}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {user.role?.includes('Administrador') ? <Shield size={14} className="text-accent" /> : <Shield size={14} className="text-textMuted" />}
                      <span className={user.role?.includes('Administrador') ? 'text-accent font-medium text-sm' : 'text-textMuted text-sm'}>
                        {user.role || 'Usuario'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Activo' ? 'success' : 'default'} className={user.status === 'Activo' ? 'shadow-[0_0_10px_rgba(16,185,129,0.2)]' : ''}>
                      {user.status || 'Pendiente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-danger hover:bg-danger/10">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-textMuted">No se encontró perfiles asociados al Tenant.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
