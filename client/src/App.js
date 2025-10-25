import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Authentication & Layout - Ensure these files exist
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
// import ForgotPasswordPage from './pages/ForgotPasswordPage'; // Removed
// import ResetPasswordPage from './pages/ResetPasswordPage';   // Removed
import Layout from './components/Layout';
import authService from './api/authService';

// Core Feature Pages - Ensure ALL these files exist in ./src/pages/
import DashboardPage from './pages/DashboardPage';
import CasesListPage from './pages/CasesListPage';
import CaseDetailsPage from './pages/CaseDetailsPage';
import CaseCreateEditPage from './pages/CaseCreateEditPage'; // Renamed file
import ClientDirectoryPage from './pages/ClientDirectoryPage';
import ClientCreateEditPage from './pages/ClientCreateEditPage';
import ClientDetailsPage from './pages/ClientDetailsPage';
import DocumentsPage from './pages/DocumentsPage';
import CalendarPage from './pages/CalendarPage';
import BillingPage from './pages/BillingPage';
import ProfilePage from './pages/ProfilePage';
import AiLookupPage from './pages/AiLookupPage';
import UserManagementPage from './pages/UserManagementPage';

// Fallback
const NotFoundPage = () => <div style={{ padding: '20px' }}><h2>404 - Page Not Found</h2></div>;

// --- Helper Components for Routing ---
const PrivateRoutes = () => {
  const currentUser = authService.getCurrentUser();
  return currentUser ? <Layout /> : <Navigate to="/login" replace />;
};
const AdminRoutes = ({ children }) => {
    const currentUser = authService.getCurrentUser();
    const isAdminOrPartner = currentUser && ['admin', 'partner'].includes(currentUser.role);
    return isAdminOrPartner ? children : <Navigate to="/dashboard" replace />;
};

// --- Main Application Router ---
function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}
      {/* <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> */}

      {/* Private Routes */}
      <Route element={<PrivateRoutes />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/cases" element={<CasesListPage />} />
        <Route path="/cases/new" element={<CaseCreateEditPage />} /> {/* Use combined page */}
        <Route path="/cases/:id" element={<CaseDetailsPage />} />
        <Route path="/cases/edit/:id" element={<CaseCreateEditPage />} /> {/* Use combined page */}
        <Route path="/clients" element={<ClientDirectoryPage />} />
        <Route path="/clients/new" element={<ClientCreateEditPage />} />
        <Route path="/clients/:id" element={<ClientDetailsPage />} />
        <Route path="/clients/edit/:id" element={<ClientCreateEditPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/ai-lookup" element={<AiLookupPage />} />
        <Route path="/admin/users" element={<AdminRoutes><UserManagementPage /></AdminRoutes>} />
        {/* Default redirect inside private routes */}
        {/* <Route path="*" element={<Navigate to="/dashboard" replace />} /> */}
      </Route>

      {/* General Catch-all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;