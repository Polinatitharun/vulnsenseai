
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { LandingPage } from './components/LandingPage.jsx';
import { LoginPage } from './components/LoginPage.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import SuperAdminDashboard from './components/SuperAdminDashboard.jsx';
import { UserProvider } from './components/auth/Authcontext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import { LoaderProvider, useLoader } from './components/loader/Loadercontext.jsx';
import Loader from './components/loader/Loader.jsx';
import { Toaster } from 'sonner';
import { LlmLoaderProvider } from './components/admin/LlmLoaderContext.jsx';
import { FuzzLoaderProvider } from './components/admin/FuzzLoaderContext.jsx';

function AppWrapper() {
  const { loading } = useLoader();
  return (
    <>
      {loading && <Loader />}
      <Toaster position="top-right" />
      <div className="min-h-screen" style={{ backgroundColor: '#ffffff', color: '#1f2937' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <UserProvider>
        <LlmLoaderProvider>
          <FuzzLoaderProvider>
            <LoaderProvider>
              <AppWrapper />
            </LoaderProvider>
          </FuzzLoaderProvider>
        </LlmLoaderProvider>
      </UserProvider>
    </Router>
  );
}
