import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Avatar,
    Chip,
    Paper,
    Stack,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Grid,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    AccountBalance as AccountBalanceIcon,
    Payment as PaymentIcon,
    Receipt as ReceiptIcon,
    Warning as WarningIcon,
    ArrowForward as ArrowForwardIcon,
    ExpandMore as ExpandMoreIcon,
    Visibility as VisibilityIcon,
    Download as DownloadIcon,
    Notifications as NotificationsIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { BalanceTrendChart, SpendingChart, MonthlyTransactionsChart } from '@/components/charts/DashboardCharts';
import { HeroSection } from '@/components/dashboard/HeroSection';

// Enhanced mock data
const mockData = {
    totalBalance: 125750.5,
    totalAccounts: 3,
    monthlyTransactions: 24,
    pendingPayments: 2,
    balanceChange: 2.5,
    transactionChange: 12,
    accounts: [
        {
            accountId: '1',
            accountNumber: 'ACC001234567890',
            accountType: 'SAVINGS',
            balance: 85750.5,
            currency: 'USD',
            status: 'ACTIVE',
            interestRate: 3.5,
            lastTransaction: '2025-12-18T10:30:00Z',
        },
        {
            accountId: '2',
            accountNumber: 'ACC001234567891',
            accountType: 'CURRENT',
            balance: 40000.0,
            currency: 'USD',
            status: 'ACTIVE',
            overdraftLimit: 5000,
            lastTransaction: '2025-12-17T14:15:00Z',
        },
    ],
    recentTransactions: [
        {
            transactionId: '1',
            description: 'Transfer to John Doe',
            amount: -500.0,
            createdAt: '2025-12-18T10:30:00Z',
            status: 'COMPLETED',
            type: 'TRANSFER',
            accountNumber: 'ACC001234567890',
        },
        {
            transactionId: '2',
            description: 'Salary deposit - ABC Corp',
            amount: 2000.0,
            createdAt: '2025-12-17T14:15:00Z',
            status: 'COMPLETED',
            type: 'DEPOSIT',
            accountNumber: 'ACC001234567890',
        },
        {
            transactionId: '3',
            description: 'Utility bill payment - Electric Co',
            amount: -150.0,
            createdAt: '2025-12-16T09:45:00Z',
            status: 'COMPLETED',
            type: 'PAYMENT',
            accountNumber: 'ACC001234567891',
        },
        {
            transactionId: '4',
            description: 'Online shopping - Amazon',
            amount: -350.0,
            createdAt: '2025-12-15T16:20:00Z',
            status: 'COMPLETED',
            type: 'PAYMENT',
            accountNumber: 'ACC001234567891',
        },
        {
            transactionId: '5',
            description: 'ATM Withdrawal',
            amount: -200.0,
            createdAt: '2025-12-14T11:00:00Z',
            status: 'COMPLETED',
            type: 'WITHDRAWAL',
            accountNumber: 'ACC001234567890',
        },
    ],
    alerts: [
        {
            id: '1',
            type: 'warning',
            title: 'Unusual Activity Detected',
            message: 'Large transaction detected. Please verify.',
            date: '2 hours ago',
        },
        {
            id: '2',
            type: 'info',
            title: 'New Feature Available',
            message: 'Schedule recurring payments now available.',
            date: '1 day ago',
        },
    ],
};

const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
    color: string;
}> = ({ title, value, icon, trend, trendUp, color }) => {
    const { t } = useTranslation();
    return (
        <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography color="text.secondary" variant="body2" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                            {value}
                        </Typography>
                        {trend && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {trendUp ? (
                                    <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                ) : (
                                    <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                                )}
                                <Typography
                                    variant="caption"
                                    sx={{ color: trendUp ? 'success.main' : 'error.main', fontWeight: 600 }}
                                >
                                    {trend} {t('common.fromLastMonth')}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
                        {icon}
                    </Avatar>
                </Box>
            </CardContent>
        </Card>
    );
};

import { useAppSelector } from '@/hooks/useRedux';

export const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const accounts = useAppSelector((state) => state.accounts.list);
    const transactions = useAppSelector((state) => state.transactions.list);
    const notifications = useAppSelector((state) => state.notifications.list);
    const cards = useAppSelector((state) => state.cards.list);

    // Mock data for new sections
    const loans = [
        { id: 'l1', type: 'Home Loan', amount: 250000, paid: 45000, nextDue: '2025-12-28' }
    ];
    const investments = [
        { id: 'i1', type: 'Mutual Funds', value: 12500, return: '+12.5%' },
        { id: 'i2', type: 'Fixed Deposit', value: 5000, return: '6.5% p.a' }
    ];

    // Calculate real stats
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const activeAccounts = accounts.length;
    const thisMonthTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        const now = new Date();
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }).length;

    const [expandedAccount, setExpandedAccount] = useState<string | false>('account-0');

    const handleAccountChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedAccount(isExpanded ? panel : false);
    };

    const stats = [
        {
            title: t('dashboard.totalBalance'),
            value: formatCurrency(totalBalance),
            icon: <AccountBalanceIcon />,
            trend: `+${mockData.balanceChange}%`,
            trendUp: true,
            color: 'primary',
        },
        {
            title: t('dashboard.activeAccounts'),
            value: activeAccounts,
            icon: <AccountBalanceIcon />,
            color: 'success',
        },
        {
            title: t('dashboard.thisMonth'),
            value: `${thisMonthTransactions} ${t('dashboard.transactions')}`,
            icon: <ReceiptIcon />,
            trend: `+${mockData.transactionChange}%`,
            trendUp: true,
            color: 'info',
        },
        {
            title: t('dashboard.pending'),
            value: `${mockData.pendingPayments} ${t('dashboard.payments_plural')}`,
            icon: <WarningIcon />,
            color: 'warning',
        },
    ];

    return (
        <Box>
            {/* Welcome Banner */}
            {/* Hero Section */}
            <HeroSection />

            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                    {t('dashboard.overview')}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {t('common.welcome')}, {new Date().toLocaleDateString(i18n.language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
            </Box>

            {/* KPI Stats */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 3 }}>
                {stats.map((stat, index) => (
                    <Box key={`${stat.title}-${index}`} sx={{ flex: 1 }}>
                        <StatCard {...stat} />
                    </Box>
                ))}
            </Stack>

            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} sx={{ mb: 3 }}>
                {/* Left Column - Accounts & Charts */}
                <Box sx={{ flex: 2 }}>
                    {/* Account Accordion */}
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={600}>
                                    {t('dashboard.myAccounts')}
                                </Typography>
                                <Button
                                    size="small"
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={() => navigate('/dashboard/accounts')}
                                >
                                    {t('common.viewAll')}
                                </Button>
                            </Box>

                            {accounts.map((account, index) => (
                                <Accordion
                                    key={account.id}
                                    expanded={expandedAccount === `account-${index}`}
                                    onChange={handleAccountChange(`account-${index}`)}
                                    elevation={0}
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        mb: 1,
                                        '&:before': { display: 'none' },
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        sx={{
                                            '&:hover': {
                                                bgcolor: 'action.hover',
                                            },
                                        }}
                                    >
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                <AccountBalanceIcon />
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography fontWeight={600}>{account.type}</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {account.number}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="h6" fontWeight={700}>
                                                    {formatCurrency(account.balance)}
                                                </Typography>
                                                <Chip label={account.status} color="success" size="small" />
                                            </Box>
                                        </Stack>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Stack spacing={2}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {t('dashboard.accountNumber')}
                                                </Typography>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {account.number}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {t('dashboard.lastTransaction')}
                                                </Typography>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {formatDate(new Date().toISOString())}
                                                </Typography>
                                            </Box>
                                            {account.type.includes('Savings') && (
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {t('dashboard.interestRate')}
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={600} color="success.main">
                                                        4% p.a.
                                                    </Typography>
                                                </Box>
                                            )}
                                            {account.type.toUpperCase() === 'CURRENT' && (
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {t('dashboard.overdraftLimit')}
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {formatCurrency(account.overdraftLimit || 0)}
                                                    </Typography>
                                                </Box>
                                            )}
                                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={() => navigate('/dashboard/accounts')}
                                                >
                                                    {t('dashboard.viewDetails')}
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<DownloadIcon />}
                                                >
                                                    {t('dashboard.statement')}
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Financial Overview / Availed Services */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TrendingUpIcon color="primary" /> Investments
                                    </Typography>
                                    <Stack spacing={2} sx={{ mt: 2 }}>
                                        {investments.map(inv => (
                                            <Box key={inv.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>{inv.type}</Typography>
                                                    <Typography variant="caption" color="text.secondary">Current Value</Typography>
                                                </Box>
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="body2" fontWeight={700}>{formatCurrency(inv.value)}</Typography>
                                                    <Typography variant="caption" color="success.main" fontWeight={700}>{inv.return}</Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AccountBalanceIcon color="primary" /> Active Loans
                                    </Typography>
                                    <Stack spacing={2} sx={{ mt: 2 }}>
                                        {loans.map(loan => (
                                            <Box key={loan.id}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="body2" fontWeight={600}>{loan.type}</Typography>
                                                    <Typography variant="body2" fontWeight={700}>{formatCurrency(loan.amount - loan.paid)} Left</Typography>
                                                </Box>
                                                <Box sx={{ width: '100%', bgcolor: 'grey.100', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                                                    <Box sx={{ width: `${(loan.paid / loan.amount) * 100}%`, bgcolor: 'primary.main', height: '100%' }} />
                                                </Box>
                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                    Next EMI: {formatCurrency(2450)} due on {loan.nextDue}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Charts */}
                    <Stack spacing={3}>
                        <BalanceTrendChart />
                        <MonthlyTransactionsChart />
                    </Stack>
                </Box>

                {/* Right Column - Transactions & Alerts */}
                <Box sx={{ flex: 1 }}>
                    {/* Recent Transactions */}
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={600}>
                                    {t('dashboard.recentActivity')}
                                </Typography>
                                <Button
                                    size="small"
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={() => navigate('/dashboard/transactions')}
                                >
                                    {t('common.viewAll')}
                                </Button>
                            </Box>

                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Description</TableCell>
                                            <TableCell align="right">Amount</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {transactions.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        No recent transactions
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            [...transactions]
                                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                .slice(0, 5)
                                                .map((transaction) => (
                                                    <TableRow
                                                        key={transaction.id}
                                                        hover
                                                        sx={{ cursor: 'pointer' }}
                                                        onClick={() => navigate('/dashboard/transactions')}
                                                    >
                                                        <TableCell>
                                                            <Box>
                                                                <Typography variant="body2" fontWeight={500}>
                                                                    {transaction.desc}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {formatDate(transaction.date)}
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Typography
                                                                variant="body2"
                                                                fontWeight={600}
                                                                sx={{
                                                                    color: transaction.type.toLowerCase() === 'credit' ? 'success.main' : 'error.main',
                                                                }}
                                                            >
                                                                {transaction.type.toLowerCase() === 'credit' ? '+' : '-'}
                                                                {formatCurrency(Math.abs(transaction.amount))}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>

                    {/* Your Cards */}
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PaymentIcon color="primary" /> Your Cards
                                </Typography>
                                <Button
                                    size="small"
                                    endIcon={<ArrowForwardIcon />}
                                    onClick={() => navigate('/dashboard/cards')}
                                >
                                    Manage
                                </Button>
                            </Box>
                            <Stack spacing={2}>
                                {cards.slice(0, 2).map((card) => (
                                    <Paper
                                        key={card.id}
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            background: card.type === 'Debit'
                                                ? 'linear-gradient(45deg, #0f172a 0%, #1e3a8a 100%)'
                                                : 'linear-gradient(45deg, #111827 0%, #374151 100%)',
                                            color: 'white',
                                            boxShadow: 2
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem', display: 'block' }}>{card.brand} {card.type}</Typography>
                                                <Typography variant="body2" fontWeight={700}>•••• •••• •••• {card.number.slice(-4)}</Typography>
                                            </Box>
                                            <Chip
                                                label={card.status}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.65rem',
                                                    bgcolor: card.isBlocked ? 'error.main' : 'success.main',
                                                    color: 'white',
                                                    fontWeight: 700
                                                }}
                                            />
                                        </Box>
                                    </Paper>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Alerts */}
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <NotificationsIcon color="primary" />
                                <Typography variant="h6" fontWeight={600}>
                                    {t('dashboard.alerts')}
                                </Typography>
                            </Box>
                            {notifications.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                                    No active alerts
                                </Typography>
                            ) : (
                                notifications.slice(0, 3).map((alert) => (
                                    <Paper
                                        key={alert.id}
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            mb: 1,
                                            bgcolor: (alert.type === 'security' || alert.type === 'warning') ? 'error.50' : 'info.50',
                                            border: '1px solid',
                                            borderColor: (alert.type === 'security' || alert.type === 'warning') ? 'error.light' : 'info.light',
                                        }}
                                    >
                                        <Stack direction="row" spacing={1} alignItems="flex-start">
                                            {(alert.type === 'security' || alert.type === 'warning') ? (
                                                <WarningIcon sx={{ color: 'error.main', fontSize: 20 }} />
                                            ) : (
                                                <InfoIcon sx={{ color: 'info.main', fontSize: 20 }} />
                                            )}
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {alert.title}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    {alert.desc}
                                                </Typography>
                                                <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.7 }}>
                                                    {alert.time}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Spending Chart */}
                    <SpendingChart />
                </Box>
            </Stack>

            {/* Quick Actions */}
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                        {t('dashboard.quickActions')}
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Button
                            variant="contained"
                            startIcon={<PaymentIcon />}
                            onClick={() => navigate('/dashboard/payments')}
                            sx={{ flex: 1, minWidth: 150 }}
                        >
                            {t('dashboard.transferMoney')}
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<ReceiptIcon />}
                            onClick={() => navigate('/dashboard/payments')}
                            sx={{ flex: 1, minWidth: 150 }}
                        >
                            {t('dashboard.payBills')}
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<AccountBalanceIcon />}
                            onClick={() => navigate('/dashboard/beneficiaries')}
                            sx={{ flex: 1, minWidth: 150 }}
                        >
                            {t('dashboard.manageBeneficiaries')}
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={() => navigate('/dashboard/accounts')}
                            sx={{ flex: 1, minWidth: 150 }}
                        >
                            {t('dashboard.downloadStatements')}
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};
