import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '@/store';
import { theme } from './theme';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage } from '@/pages/Auth/LoginPage';
import { LandingPage } from '@/pages/Home/LandingPage';
import { DashboardPage } from '@/pages/Dashboard/DashboardPage';
import { AccountsPage } from '@/pages/Accounts/AccountsPage';
import { OpenAccountPage } from '@/pages/Accounts/OpenAccountPage';
import { PaymentsPage } from '@/pages/Payments/PaymentsPage';
import { SegmentPage } from '@/pages/Public/SegmentPage';
import { ProductCategoryPage } from '@/pages/Public/ProductCategoryPage';
import { PublicAccountOpeningPage } from '@/pages/Public/PublicAccountOpeningPage';
import { CardApplicationPage } from '@/pages/Public/CardApplicationPage';
import { PublicLayout } from '@/layouts/PublicLayout';

const CardsPage = React.lazy(() => import('@/pages/Cards/CardsPage').then(m => ({ default: m.CardsPage })));
const DepositsPage = React.lazy(() => import('@/pages/Deposits/DepositsPage'));
const ForexPage = React.lazy(() => import('@/pages/Forex/ForexPage'));
const BankSmartPage = React.lazy(() => import('@/pages/BankSmart/BankSmartPage'));
const LoansPage = React.lazy(() => import('@/pages/Loans/LoansPage').then(m => ({ default: m.LoansPage })));
const InvestmentsPage = React.lazy(() => import('@/pages/Investments/InvestmentsPage').then(m => ({ default: m.InvestmentsPage })));
const AccountStatementPage = React.lazy(() => import('@/pages/Accounts/AccountStatementPage').then(m => ({ default: m.AccountStatementPage })));
const TransactionsPage = React.lazy(() => import('@/pages/Transactions/TransactionsPage').then(m => ({ default: m.TransactionsPage })));
const BeneficiariesPage = React.lazy(() => import('@/pages/Beneficiaries/BeneficiariesPage').then(m => ({ default: m.BeneficiariesPage })));
const NotificationsPage = React.lazy(() => import('@/pages/Notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const ProfilePage = React.lazy(() => import('@/pages/Profile/ProfilePage').then(m => ({ default: m.ProfilePage })));
const SettingsPage = React.lazy(() => import('@/pages/Settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const ServiceRequestsPage = React.lazy(() => import('@/pages/Services/ServiceRequestsPage').then(m => ({ default: m.ServiceRequestsPage })));
const SupportPage = React.lazy(() => import('@/pages/Support/SupportPage').then(m => ({ default: m.SupportPage })));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: false,
        },
    },
});

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="segment/:id" element={<SegmentPage />} />
                <Route path="product/:id" element={<ProductCategoryPage />} />
                <Route path="open-account" element={<PublicAccountOpeningPage />} />
                <Route path="apply-card" element={<CardApplicationPage />} />
                <Route path="login" element={<LoginPage />} />
            </Route>

            {/* Protected Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<DashboardPage />} />
                <Route path="accounts" element={<AccountsPage />} />
                <Route path="open-account" element={<OpenAccountPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="beneficiaries" element={<BeneficiariesPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="cards" element={<CardsPage />} />
                <Route path="deposits" element={<DepositsPage />} />
                <Route path="forex" element={<ForexPage />} />
                <Route path="banksmart" element={<BankSmartPage />} />
                <Route path="loans" element={<LoansPage />} />
                <Route path="investments" element={<InvestmentsPage />} />
                <Route path="statement" element={<AccountStatementPage />} />
                <Route path="service-requests" element={<ServiceRequestsPage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <Provider store={store}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <BrowserRouter>
                        <React.Suspense fallback={<div>Loading...</div>}>
                            <AppRoutes />
                        </React.Suspense>
                    </BrowserRouter>
                </ThemeProvider>
            </QueryClientProvider>
        </Provider>
    );
}

export default App;
