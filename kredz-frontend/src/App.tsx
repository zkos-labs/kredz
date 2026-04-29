import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import Landing from './pages/Landing';
import TierSelection from './pages/TierSelection';
import Dashboard from './pages/Dashboard';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.25 } },
};

function Page({ children }: { children: React.ReactNode }) {
  return <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">{children}</motion.div>;
}

function AppRoutes() {
  const { tier } = useApp();
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Page><Landing /></Page>} />
        <Route path="/app" element={
          <ProtectedRoute>
            <Navigate to={tier !== null ? '/app/dashboard' : '/app/tier'} replace />
          </ProtectedRoute>
        } />
        <Route path="/app/tier" element={
          <ProtectedRoute><Page><TierSelection /></Page></ProtectedRoute>
        } />
        <Route path="/app/dashboard" element={
          <ProtectedRoute><Page><Dashboard /></Page></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ToastProvider>
          {/* Global Cinematic Background */}
          <div className="fixed inset-0 z-[-1] bg-dark overflow-hidden pointer-events-none">
            {/* Pure CSS Animated Cinematic Background (Replaces broken video link) */}
            <div className="cinematic-bg">
              <div className="cinematic-orb orb-1" />
              <div className="cinematic-orb orb-2" />
              <div className="cinematic-orb orb-3" />
            </div>
            
            <div className="absolute inset-0 z-[1]" style={{ background: 'linear-gradient(to bottom, rgba(0,4,31,0.65) 0%, rgba(0,4,31,0.4) 40%, rgba(0,4,31,0.85) 100%)' }} />
            <div className="absolute inset-0 z-[2]" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(181,105,57,0.08) 0%, transparent 65%)', mixBlendMode: 'screen' }} />
          </div>

          <Navbar />
          <div className="relative z-0">
            <AppRoutes />
          </div>
        </ToastProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
