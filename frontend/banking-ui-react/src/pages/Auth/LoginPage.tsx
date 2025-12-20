import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, AccountBalance } from '@mui/icons-material';


export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('demo@banking.com');
    const [password, setPassword] = useState('demo123');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Mock login - simulate delay
            await new Promise((resolve) => setTimeout(resolve, 800));

            // Validate credentials (simple demo validation)
            if (email !== 'demo@banking.com' || password !== 'demo123') {
                throw new Error('Invalid credentials. Please use demo@banking.com / demo123');
            }

            // Mock successful login
            const mockUser = {
                userId: '1',
                email,
                firstName: 'John',
                lastName: 'Doe',
                role: 'CUSTOMER' as const,
                createdAt: new Date().toISOString(),
            };

            const mockToken = 'mock_token_' + Date.now();

            // Store in localStorage
            localStorage.setItem('auth_token', mockToken);
            localStorage.setItem('user', JSON.stringify(mockUser));

            // Force page reload to trigger auth state update
            window.location.href = '/dashboard';
        } catch (err: any) {
            setError(err.message || 'Login failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                p: 2,
            }}
        >
            <Card sx={{ maxWidth: 450, width: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <AccountBalance sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Enterprise Banking
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Sign in to your account
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            sx={{ mb: 2 }}
                            autoComplete="email"
                        />

                        <TextField
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            sx={{ mb: 3 }}
                            autoComplete="current-password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            type="submit"
                            disabled={loading}
                            sx={{ mb: 2 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Sign In'}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                Demo credentials: demo@banking.com / demo123
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};
