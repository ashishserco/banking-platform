import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Stack, LinearProgress } from '@mui/material';
import { Savings as SavingsIcon, Add as AddIcon } from '@mui/icons-material';
import { formatCurrency } from '@/utils/formatters';

const DepositsPage: React.FC = () => {
    const deposits = [
        { id: 'd1', type: 'Fixed Deposit', amount: 5000, interest: '6.5%', maturity: '2026-05-15', growth: 325 },
        { id: 'd2', type: 'Recurring Deposit', amount: 1200, interest: '7.1%', maturity: '2025-11-20', growth: 85 }
    ];

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800}>Deposits</Typography>
                    <Typography variant="body1" color="text.secondary">Manage your fixed and recurring deposits</Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} sx={{ borderRadius: 2, px: 3 }}>
                    Open New Deposit
                </Button>
            </Box>

            <Grid container spacing={3}>
                {deposits.map(dep => (
                    <Grid size={{ xs: 12, md: 6 }} key={dep.id}>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ p: 1.5, bgcolor: 'primary.50', borderRadius: 2, display: 'flex' }}>
                                            <SavingsIcon color="primary" />
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>{dep.type}</Typography>
                                            <Typography variant="caption" color="text.secondary">Interest Rate: {dep.interest} p.a</Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="h5" fontWeight={800} color="primary">{formatCurrency(dep.amount)}</Typography>
                                </Box>

                                <Stack spacing={1} sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" color="text.secondary">Accumulated Interest</Typography>
                                        <Typography variant="body2" fontWeight={700} color="success.main">+{formatCurrency(dep.growth)}</Typography>
                                    </Box>
                                    <LinearProgress variant="determinate" value={45} sx={{ height: 8, borderRadius: 4 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" color="text.secondary">Maturity Date: {dep.maturity}</Typography>
                                        <Typography variant="caption" fontWeight={700}>45% Completed</Typography>
                                    </Box>
                                </Stack>

                                <Button fullWidth variant="outlined" sx={{ borderRadius: 2 }}>View Details</Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}

                <Grid size={{ xs: 12 }}>
                    <Card elevation={0} sx={{ bgcolor: 'primary.900', color: 'white', borderRadius: 4, p: 2 }}>
                        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="h5" fontWeight={700} gutterBottom>Tax Saver FD</Typography>
                                <Typography variant="body1" sx={{ opacity: 0.8 }}>Get up to $1,500 tax benefit under Section 80C. 5 years lock-in period.</Typography>
                            </Box>
                            <Button variant="contained" sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' }, fontWeight: 700, px: 4 }}>
                                Apply Now
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DepositsPage;
