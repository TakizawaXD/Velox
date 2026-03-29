import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Orders } from '@/pages/Orders';
import { MapView } from '@/pages/MapView';
import { Drivers } from '@/pages/Drivers';
import { Users } from '@/pages/Users';
import { Customers } from '@/pages/Customers';
import { Settings } from '@/pages/Settings';
import { Register } from '@/pages/Register';
import { Analytics } from '@/pages/Analytics';
import { useAuth } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) return null;
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  const { currentUser } = useAuth();

  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#111',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: 'bold',
          }
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={currentUser ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={currentUser ? <Navigate to="/dashboard" replace /> : <Register />} 
          />
          
          <Route 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
