import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastViewport from './components/ToastViewport';
import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOverview from './pages/admin/AdminOverview';
import AdminProperties from './pages/admin/AdminProperties';
import AdminPropertyForm from './pages/admin/AdminPropertyForm';
import AdminInquiries from './pages/admin/AdminInquiries';
import RequireAdmin from './components/admin/RequireAdmin';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <ToastViewport />
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/properties/:id" element={<PropertyDetailsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            <Route path="/admin/login" element={<AdminLoginPage />} />

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
