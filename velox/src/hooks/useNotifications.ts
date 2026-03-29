import { useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export function useNotifications() {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    // Listen for NEW orders (created in the last 10 seconds to avoid flooding old ones)
    const tenSecondsAgo = new Date(Date.now() - 10000);
    const q = query(
      collection(db, 'orders'),
      where('tenantId', '==', currentUser.uid),
      where('createdAt', '>', Timestamp.fromDate(tenSecondsAgo)),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const order = change.doc.data();
          toast.success(`¡Nuevo pedido de ${order.client}!`, {
            duration: 5000,
            icon: '📦',
            style: {
                borderRadius: '16px',
                background: '#111',
                color: '#fff',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                fontWeight: 'bold',
                fontSize: '14px'
            },
          });
        }
      });
    });

    return () => unsubscribe();
  }, [currentUser]);
}
