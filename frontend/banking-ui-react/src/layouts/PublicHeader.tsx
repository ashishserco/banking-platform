import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Box,
    Typography,
    Button,
    Menu,
    MenuItem,
    Container,
    Stack
} from '@mui/material';
import { KeyboardArrowDown, Login, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { LanguageSelector } from '@/components/common/LanguageSelector';

const navItems = [
    'Accounts', 'Deposits', 'Cards', 'Forex', 'Loans',
    'Investments', 'Insurance', 'Payments', 'Offers & Rewards',
    'Learning Hub', 'Bank Smart'
];

const loginOptions = [
    'Personal', 'Business', 'Corporate', 'Burgundy',
    'Priority', 'NRI', 'Agri', 'Gift City'
];

export const PublicHeader: React.FC = () => {
    const navigate = useNavigate();
    const [loginAnchor, setLoginAnchor] = useState<null | HTMLElement>(null);

    const handleLoginClick = (event: React.MouseEvent<HTMLElement>) => {
        setLoginAnchor(event.currentTarget);
    };

    const handleLoginClose = () => {
        setLoginAnchor(null);
    };

    const handleLoginSelect = (type: string) => {
        handleLoginClose();
        // For now, all login options go to the same login page, 
        // but in a real app they might have different flows or query params
        navigate('/login', { state: { loginType: type } });
    };

    return (
        <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
            {/* Top Bar */}
            <Box sx={{ bgcolor: '#f0f0f0', py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ marginRight: 'auto' }}>
                        <LanguageSelector />
                    </Box>

                    {['Personal', 'Business', 'Corporate', 'Burgundy', 'Priority', 'NRI', 'Agri', 'Gift City', 'About Us'].map((item) => (
                        <Typography
                            key={item}
                            variant="caption"
                            color="text.secondary"
                            sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' }, fontWeight: 500 }}
                            onClick={() => navigate(`/segment/${item.toLowerCase().replace(/\s+/g, '')}`)}
                        >
                            {item}
                        </Typography>
                    ))}
                </Container>
            </Box>

            <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
                <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                    {/* Logo Area */}
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mr: 4 }}
                        onClick={() => navigate('/')}
                    >
                        <Box sx={{
                            width: 40,
                            height: 40,
                            bgcolor: 'primary.main',
                            borderRadius: 1,
                            mr: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1.2rem'
                        }}>
                            AB
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={700} color="primary" lineHeight={1}>
                                Aadhya Bank
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Dil Se Open
                            </Typography>
                        </Box>
                    </Box>

                    {/* Desktop Navigation */}
                    <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 3, flexGrow: 1 }}>
                        {navItems.map((item) => (
                            <Typography
                                key={item}
                                variant="body2"
                                fontWeight={500}
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': { color: 'primary.main' }
                                }}
                                onClick={() => navigate(`/product/${item.toLowerCase().split(' ')[0]}`)}
                            >
                                {item}
                            </Typography>
                        ))}
                    </Box>

                    {/* Right Actions */}
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Search sx={{ color: 'text.secondary', cursor: 'pointer' }} />

                        <Button
                            variant="contained"
                            color="primary"
                            endIcon={<KeyboardArrowDown />}
                            startIcon={<Login />}
                            onClick={handleLoginClick}
                            sx={{ borderRadius: 0, px: 3 }}
                        >
                            Login
                        </Button>
                    </Stack>
                </Container>
            </Toolbar>

            {/* Login Mega Menu/Dropdown using Menu for simplicity */}
            <Menu
                anchorEl={loginAnchor}
                open={Boolean(loginAnchor)}
                onClose={handleLoginClose}
                PaperProps={{
                    sx: {
                        mt: 1,
                        width: 200,
                        borderRadius: 1
                    }
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                {loginOptions.map((option) => (
                    <MenuItem key={option} onClick={() => handleLoginSelect(option)}>
                        <Typography variant="body2" fontWeight={500}>{option}</Typography>
                    </MenuItem>
                ))}
            </Menu>
        </AppBar>
    );
};
