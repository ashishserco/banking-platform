import React from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Divider,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    AccountBalance as AccountBalanceIcon,
    Payment as PaymentIcon,
    Receipt as ReceiptIcon,
    People as PeopleIcon,
    Notifications as NotificationsIcon,
    Support as SupportIcon,
    Person as PersonIcon,
    Settings as SettingsIcon,
    Savings as SavingsIcon,
    CurrencyExchange as CurrencyExchangeIcon,
    CreditCard as CreditCardIcon,
    TrendingUp as TrendingUpIcon,
    AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { setSidebarOpen } from '@/store/slices/uiSlice';

const DRAWER_WIDTH = 260;

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Accounts', icon: <AccountBalanceIcon />, path: '/dashboard/accounts' },
    { text: 'Payments', icon: <PaymentIcon />, path: '/dashboard/payments' },
    { text: 'Transactions', icon: <ReceiptIcon />, path: '/dashboard/transactions' },
    { text: 'Cards', icon: <CreditCardIcon />, path: '/dashboard/cards' },
    { text: 'Beneficiaries', icon: <PeopleIcon />, path: '/dashboard/beneficiaries' },
    { text: 'Deposits', icon: <SavingsIcon />, path: '/dashboard/deposits' },
    { text: 'Loans', icon: <AccountBalanceIcon />, path: '/dashboard/loans' },
    { text: 'Investments', icon: <TrendingUpIcon />, path: '/dashboard/investments' },
    { text: 'Forex', icon: <CurrencyExchangeIcon />, path: '/dashboard/forex' },
    { text: 'Bank Smart', icon: <AutoAwesomeIcon />, path: '/dashboard/banksmart' },
    { text: 'Service Requests', icon: <SupportIcon />, path: '/dashboard/service-requests' },
    { text: 'Notifications', icon: <NotificationsIcon />, path: '/dashboard/notifications' },
    { text: 'Support', icon: <SupportIcon />, path: '/dashboard/support' },
    { text: 'Profile', icon: <PersonIcon />, path: '/dashboard/profile' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard/settings' },
];

export const Sidebar: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

    const handleNavigation = (path: string) => {
        navigate(path);
        if (isMobile) {
            dispatch(setSidebarOpen(false));
        }
    };

    const drawer = (
        <Box>
            <Toolbar>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                    <AccountBalanceIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Box>
                        <Box sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'primary.main' }}>
                            Aadhya Bank
                        </Box>
                        <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>Banking Portal</Box>
                    </Box>
                </Box>
            </Toolbar>
            <Divider />
            <List sx={{ px: 1, pt: 2 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => handleNavigation(item.path)}
                                sx={{
                                    borderRadius: 2,
                                    backgroundColor: isActive ? 'primary.main' : 'transparent',
                                    color: isActive ? 'white' : 'text.primary',
                                    '&:hover': {
                                        backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: isActive ? 'white' : 'text.secondary',
                                        minWidth: 40,
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontWeight: isActive ? 600 : 400,
                                        fontSize: '0.9rem',
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
            aria-label="navigation menu"
        >
            {/* Mobile drawer */}
            <Drawer
                variant="temporary"
                open={sidebarOpen}
                onClose={() => dispatch(setSidebarOpen(false))}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: DRAWER_WIDTH,
                    },
                }}
            >
                {drawer}
            </Drawer>

            {/* Desktop drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: DRAWER_WIDTH,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                    },
                }}
                open
            >
                {drawer}
            </Drawer>
        </Box>
    );
};
