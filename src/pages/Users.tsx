import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Edit2, Trash2, UserPlus, Shield } from 'lucide-react';
import { collection, onSnapshot, query, where, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';
import { SEO } from '@/components/common/SEO';
import { TableRowSkeleton } from '@/components/common/SkeletonLoaders';

const inputCls = 'w-full rounded-xl border border-white/5 bg-white/5 py-3 px-4 text-sm text-text focus:border-primary/50 focus:outline-none transition-all';
const labelCls = 'block text-[10px] font-black text-textMuted uppercase tracking-widest mb-2 ml-1';

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
    <div className="space-y-8 max-w-6xl mx-auto font-inter">
      <SEO title="Gestión de Equipo" />
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Equipo<span className="text-primary italic">.</span></h1>
          <p className="text-textMuted text-[10px] font-black uppercase tracking-[0.3em] mt-1">Control de Accesos Corporativos</p>
        </div>
        <Button className="gap-3 shadow-neon-blue rounded-2xl py-7 px-8 font-black uppercase text-[11px] tracking-widest bg-white text-black hover:bg-white/90" onClick={() => handleOpenModal()}>
          <UserPlus size={18} /> Invitar Miembro
        </Button>
      </div>

      <Card className="glass-panel overflow-hidden p-0 border-white/5 bg-surface/30 rounded-[32px] min-h-[400px]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-white/5">
              <TableHead className="text-[10px] uppercase font-black tracking-widest text-textMuted py-7 pl-8">Miembro</TableHead>
              <TableHead className="text-[10px] uppercase font-black tracking-widest text-textMuted py-7">Organización</TableHead>
              <TableHead className="text-[10px] uppercase font-black tracking-widest text-textMuted py-7">Rol Asignado</TableHead>
              <TableHead className="text-[10px] uppercase font-black tracking-widest text-textMuted py-7">Estado</TableHead>
              <TableHead className="text-[10px] uppercase font-black tracking-widest text-textMuted py-7 pr-8 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               [...Array(5)].map((_, i) => (
                 <TableRow key={i} className="hover:bg-transparent border-white/5">
                    <TableCell colSpan={5} className="p-0"><TableRowSkeleton /></TableCell>
                 </TableRow>
               ))
            ) : (
              <>
                {users.map((user) => (
                  <TableRow key={user.id} className="group hover:bg-white/[0.02] transition-colors border-white/5">
                    <TableCell className="font-medium flex items-center gap-4 py-5 pl-8">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-primary text-lg">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-white font-black uppercase text-xs tracking-tight">{user.name}</p>
                        <p className="text-[10px] text-textMuted font-bold">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-textMuted font-medium text-xs uppercase tracking-wider">{user.company || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield size={14} className={user.role?.includes('Administrador') ? 'text-primary' : 'text-textMuted'} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${user.role?.includes('Administrador') ? 'text-primary' : 'text-textMuted'}`}>
                          {user.role || 'Usuario'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'Activo' ? 'success' : 'default'} className="text-[9px] font-black tracking-widest">
                        {user.status?.toUpperCase() || 'PENDIENTE'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/5 text-primary border border-white/5 hover:bg-white/10" onClick={() => handleOpenModal(user)}>
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/5 text-danger border border-white/5 hover:bg-danger/10" onClick={() => handleDelete(user.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={5} className="text-center py-32 text-textMuted font-black uppercase text-[10px] tracking-[0.5em] opacity-40">No se encontró perfiles asociados al Tenant.</TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? 'Editar Perfil' : 'Invitar Miembro'}>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup label="Nombre y Apellido *"><input required className={inputCls} placeholder="Ej. Juan Pérez" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></FieldGroup>
            <FieldGroup label="Email de Acceso *"><input required className={inputCls} type="email" placeholder="email@empresa.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></FieldGroup>
            <FieldGroup label="Empresa / División"><input className={inputCls} placeholder="Nombre Corporativo" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} /></FieldGroup>
            <FieldGroup label="Rol de Sistema *"><select className={inputCls} value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>{ROLES.map(r => <option key={r} value={r} className="bg-black text-white">{r}</option>)}</select></FieldGroup>
            <FieldGroup label="Estado Maestro *"><select className={inputCls} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>{ESTADOS.map(s => <option key={s} value={s} className="bg-black text-white">{s}</option>)}</select></FieldGroup>
          </div>
          <div className="flex gap-4 justify-end pt-6 border-t border-white/5">
            <Button type="button" variant="outline" className="rounded-xl font-bold uppercase text-[10px] tracking-widest border-white/10" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={isSaving} className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest bg-primary shadow-neon-blue">{isEditing ? 'Confirmar Cambios' : 'Enviar Invitación'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
