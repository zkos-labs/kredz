import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { wallet } = useApp();
  if (!wallet) return <Navigate to="/" replace />;
  return <>{children}</>;
}
