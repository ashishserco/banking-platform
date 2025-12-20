import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Badge,
    Menu,
    MenuItem,
    Avatar,
    Divider,
    ListItemIcon,
    useTheme,
    useMediaQuery,
    Container,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    Person as PersonIcon,
    Logout as LogoutIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useRedux';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { LanguageSelector } from '@/components/common/LanguageSelector';

export const Header: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleProfileMenuClose();
        await logout();
        navigate('/login');
    };

    const handleProfile = () => {
        handleProfileMenuClose();
        navigate('/dashboard/profile');
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundColor: 'white',
                color: 'text.primary',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
        >
            {/* Top Bar */}
            <Box sx={{ bgcolor: '#f0f0f0', py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'flex-end', gap: 3 }}>
                    {['Personal', 'Business', 'Corporate', 'Burgundy', 'Priority', 'NRI', 'Agri', 'Gift City', 'About Us'].map((item) => (
                        <Typography
                            key={item}
                            variant="caption"
                            color="text.secondary"
                            sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' }, fontWeight: 500 }}
                        >
                            {item}
                        </Typography>
                    ))}
                </Container>
            </Box>
            <Toolbar>
                {isMobile && (
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={() => dispatch(toggleSidebar())}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, color: 'primary.main', mr: 2 }}>
                        Aadhya Bank
                    </Typography>
                    {!isMobile && (
                        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                            | &nbsp; Welcome, {user?.firstName || 'User'}
                        </Typography>
                    )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ mr: 1, display: { xs: 'none', md: 'block' } }}>
                        <LanguageSelector />
                    </Box>

                    <IconButton
                        size="large"
                        aria-label="show notifications"
                        color="inherit"
                        onClick={() => navigate('/dashboard/notifications')}
                    >
                        <Badge badgeContent={3} color="error">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>

                    <IconButton
                        size="large"
                        edge="end"
                        aria-label="account of current user"
                        aria-controls="profile-menu"
                        aria-haspopup="true"
                        onClick={handleProfileMenuOpen}
                        color="inherit"
                    >
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                bgcolor: 'primary.main',
                                fontSize: '1rem',
                            }}
                        >
                            {user?.firstName?.charAt(0) || 'U'}
                        </Avatar>
                    </IconButton>
                </Box>

                <Menu
                    id="profile-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleProfileMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                        sx: {
                            mt: 1.5,
                            minWidth: 200,
                        },
                    }}
                >
                    <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                            {user?.firstName} {user?.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {user?.email}
                        </Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={handleProfile}>
                        <ListItemIcon>
                            <PersonIcon fontSize="small" />
                        </ListItemIcon>
                        Profile
                    </MenuItem>
                    <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/dashboard/settings'); }}>
                        <ListItemIcon>
                            <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        Settings
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                        <ListItemIcon>
                            <LogoutIcon fontSize="small" />
                        </ListItemIcon>
                        Logout
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};
