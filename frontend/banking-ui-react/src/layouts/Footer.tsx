import React from 'react';
import { Box, Container, Typography, Link, Stack, Divider } from '@mui/material';
import { Facebook, Twitter, LinkedIn, Instagram } from '@mui/icons-material';

export const Footer: React.FC = () => {
    return (
        <Box sx={{ bgcolor: '#333', color: 'white', pt: 6, pb: 3, mt: 'auto' }}>
            <Container maxWidth="lg">
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '4fr 2fr 2fr 4fr' },
                    gap: 4
                }}>
                    <Box>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Aadhya Bank
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
                            Your trusted partner in financial growth. Experience premium banking with our state-of-the-art digital platforms.
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <Facebook sx={{ opacity: 0.7, cursor: 'pointer', '&:hover': { opacity: 1 } }} />
                            <Twitter sx={{ opacity: 0.7, cursor: 'pointer', '&:hover': { opacity: 1 } }} />
                            <LinkedIn sx={{ opacity: 0.7, cursor: 'pointer', '&:hover': { opacity: 1 } }} />
                            <Instagram sx={{ opacity: 0.7, cursor: 'pointer', '&:hover': { opacity: 1 } }} />
                        </Stack>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                            Personal
                        </Typography>
                        <Stack spacing={1} sx={{ opacity: 0.7 }}>
                            <Link href="#" color="inherit" underline="hover">Savings</Link>
                            <Link href="#" color="inherit" underline="hover">Loans</Link>
                            <Link href="#" color="inherit" underline="hover">Cards</Link>
                            <Link href="#" color="inherit" underline="hover">Investments</Link>
                        </Stack>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                            Business
                        </Typography>
                        <Stack spacing={1} sx={{ opacity: 0.7 }}>
                            <Link href="#" color="inherit" underline="hover">Current Accounts</Link>
                            <Link href="#" color="inherit" underline="hover">Trade Forex</Link>
                            <Link href="#" color="inherit" underline="hover">CMS</Link>
                            <Link href="#" color="inherit" underline="hover">Business Loans</Link>
                        </Stack>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                            Contact Us
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
                            Toll Free: 1800-123-4567
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            Email: support@aadhya.bank
                        </Typography>
                    </Box>
                </Box>
                <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                        © {new Date().getFullYear()} Aadhya Bank. All rights reserved.
                    </Typography>
                    <Stack direction="row" spacing={3}>
                        <Link href="#" variant="caption" color="inherit" sx={{ opacity: 0.6 }}>Privacy Policy</Link>
                        <Link href="#" variant="caption" color="inherit" sx={{ opacity: 0.6 }}>Terms & Conditions</Link>
                        <Link href="#" variant="caption" color="inherit" sx={{ opacity: 0.6 }}>Security</Link>
                    </Stack>
                </Box>
            </Container>
        </Box>
    );
};
