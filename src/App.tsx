import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastViewport from './components/ToastViewport';
import PageTransition from './components/PageTransition';
import ScrollToTop from './components/ScrollToTop';

const HomePage = lazy(() => import('./pages/HomePage'));
const PropertiesPage = lazy(() => import('./pages/PropertiesPage'));
const PropertyDetailsPage = lazy(() => import('./pages/PropertyDetailsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminProperties = lazy(() => import('./pages/admin/AdminProperties'));
const AdminPropertyForm = lazy(() => import('./pages/admin/AdminPropertyForm'));
const AdminInquiries = lazy(() => import('./pages/admin/AdminInquiries'));

import RequireAdmin from './components/admin/RequireAdmin';

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <ToastViewport />
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<LazyPage><HomePage /></LazyPage>} />
              <Route path="/properties" element={<LazyPage><PropertiesPage /></LazyPage>} />
              <Route path="/properties/:id" element={<LazyPage><PropertyDetailsPage /></LazyPage>} />
              <Route path="/about" element={<LazyPage><AboutPage /></LazyPage>} />
              <Route path="/contact" element={<LazyPage><ContactPage /></LazyPage>} />
            </Route>

            <Route path="/admin/login" element={<LazyPage><AdminLoginPage /></LazyPage>} />

            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              }
            >
              <Route index element={<AdminOverview />} />
              <Route path="properties" element={<AdminProperties />} />
              <Route path="properties/new" element={<AdminPropertyForm />} />
              <Route path="properties/:id/edit" element={<AdminPropertyForm />} />
              <Route path="inquiries" element={<AdminInquiries />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  );
}

function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <PageTransition>{children}</PageTransition>
    </Suspense>
  );
}

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-luxury-gold/30 border-t-luxury-gold rounded-full animate-spin" />
        <span className="text-secondary-500 dark:text-secondary-400 animate-pulse">Loading...</span>
      </div>
    </div>
  );
}

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default App;
