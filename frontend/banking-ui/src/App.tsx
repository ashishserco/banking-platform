import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import AccountsPage from './pages/Accounts/AccountsPage';
import TransactionsPage from './pages/Transactions/TransactionsPage';
import PaymentsPage from './pages/Payments/PaymentsPage';
import BeneficiariesPage from './pages/Beneficiaries/BeneficiariesPage';
import ProfilePage from './pages/Profile/ProfilePage';
import LoadingScreen from './components/Common/LoadingScreen';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/beneficiaries" element={<BeneficiariesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;