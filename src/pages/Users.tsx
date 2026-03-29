import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Edit2, Trash2, UserPlus, Shield, Activity } from 'lucide-react';
import { collection, onSnapshot, query, where, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';

const inputCls = 'w-full rounded-xl border border-white/10 bg-surface/60 py-2.5 px-3 text-sm text-text placeholder:text-textMuted/60 focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all';
const labelCls = 'block text-xs font-semibold text-textMuted uppercase tracking-wider mb-1.5';

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={labelCls}>{label}</label>{children}</div>;
}

const ROLES = ['Administrador', 'Operador', 'Repartidor', 'Cliente'];
const ESTADOS = ['Activo', 'Inactivo', 'Pendiente'];

export function Users() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Operador',
    status: 'Activo',
    company: '',
    organizationType: 'Propia',
  });

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'users'), where('tenantId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
      setIsLoading(false);
    });
    return unsubscribe;
  }, [currentUser]);

  const handleOpenModal = (user: any = null) => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'Operador',
        status: user.status || 'Activo',
        company: user.company || '',
        organizationType: user.organizationType || 'Propia',
      });
      setSelectedUser(user);
      setIsEditing(true);
    } else {
      setFormData({
        name: '', email: '', role: 'Operador', status: 'Activo', company: '', organizationType: 'Propia',
      });
      setSelectedUser(null);
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);
    try {
      if (isEditing && selectedUser) {
        await updateDoc(doc(db, 'users', selectedUser.id), { ...formData, updatedAt: new Date() });
        toast.success('Usuario actualizado');
      } else {
        await addDoc(collection(db, 'users'), { ...formData, tenantId: currentUser.uid, createdAt: new Date() });
        toast.success('Usuario creado');
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar usuario');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      toast.success('Usuario eliminado');
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar usuario');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Equipo y Accesos</h1>
          <p className="text-textMuted">Administra los miembros de tu organización B2B.</p>
        </div>
        <Button className="gap-2 shadow-neon-blue" onClick={() => handleOpenModal()}>
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
                  <TableCell className="text-textMuted">{user.company || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Shield size={14} className={user.role?.includes('Administrador') ? 'text-accent' : 'text-textMuted'} />
                      <span className={user.role?.includes('Administrador') ? 'text-accent font-medium text-sm' : 'text-textMuted text-sm'}>
                        {user.role || 'Usuario'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Activo' ? 'success' : 'default'}>{user.status || 'Pendiente'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleOpenModal(user)}>
                        <Edit2 size={16} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-danger" onClick={() => handleDelete(user.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-textMuted">No se encontró perfiles asociados al Tenant.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Editar Usuario' : 'Invitar Nuevo Miembro'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FieldGroup label="Nombre Completo *"><input required className={inputCls} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></FieldGroup>
            <FieldGroup label="Email *"><input required className={inputCls} type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></FieldGroup>
            <FieldGroup label="Compañía"><input className={inputCls} value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} /></FieldGroup>
            <FieldGroup label="Rol *"><select className={inputCls} value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>{ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select></FieldGroup>
            <FieldGroup label="Estado *"><select className={inputCls} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>{ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}</select></FieldGroup>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isSaving} className="shadow-neon-blue">{isEditing ? 'Guardar Cambios' : 'Crear Usuario'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
