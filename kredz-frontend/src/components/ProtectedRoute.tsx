import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children, requireLinked = false }: { children: ReactNode; requireLinked?: boolean }) {
  const { wallet, walletsLinked } = useApp();
  const location = useLocation();

  if (!wallet) return <Navigate to="/" replace />;
  if (requireLinked && !walletsLinked && location.pathname !== '/app/link') {
    return <Navigate to="/app/link" replace />;
  }
  return <>{children}</>;
}
