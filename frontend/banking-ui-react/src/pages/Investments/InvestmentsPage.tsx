import React from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Button,
    Chip,
    Stack,
    LinearProgress
} from '@mui/material';
import { TrendingUp, AccountBalanceWallet } from '@mui/icons-material';
import { formatCurrency } from '@/utils/formatters';

export const InvestmentsPage: React.FC = () => {
    const investments = [
        {
            id: 'INV001',
            type: 'Mutual Fund',
            name: 'Equity Growth Fund',
            invested: 50000,
            currentValue: 62500,
            returns: 25,
            units: 1250,
            nav: 50,
            status: 'Active'
        },
        {
            id: 'INV002',
            type: 'Fixed Deposit',
            name: 'FD - 1 Year',
            invested: 100000,
            currentValue: 107500,
            returns: 7.5,
            maturityDate: '2026-01-15',
            status: 'Active'
        }
    ];

    const totalInvested = investments.reduce((sum, inv) => sum + inv.invested, 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalReturns = totalCurrentValue - totalInvested;
    const returnsPercentage = ((totalReturns / totalInvested) * 100).toFixed(2);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        My Investments
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Track and manage your investment portfolio
                    </Typography>
                </Box>
                <Button variant="contained" size="large">
                    New Investment
                </Button>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'primary.50' }}>
                        <CardContent>
                            <Typography variant="caption" color="text.secondary">Total Invested</Typography>
                            <Typography variant="h4" fontWeight={700}>{formatCurrency(totalInvested)}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'success.50' }}>
                        <CardContent>
                            <Typography variant="caption" color="text.secondary">Current Value</Typography>
                            <Typography variant="h4" fontWeight={700} color="success.main">
                                {formatCurrency(totalCurrentValue)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'info.50' }}>
                        <CardContent>
                            <Typography variant="caption" color="text.secondary">Total Returns</Typography>
                            <Typography variant="h4" fontWeight={700} color="success.main">
                                +{formatCurrency(totalReturns)}
                            </Typography>
                            <Chip label={`+${returnsPercentage}%`} color="success" size="small" sx={{ mt: 1 }} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Investment List */}
            <Grid container spacing={3}>
                {investments.map((inv) => {
                    const gain = inv.currentValue - inv.invested;
                    const gainPercent = ((gain / inv.invested) * 100).toFixed(2);

                    return (
                        <Grid size={{ xs: 12 }} key={inv.id}>
                            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>{inv.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {inv.type} • ID: {inv.id}
                                            </Typography>
                                        </Box>
                                        <Chip label={inv.status} color="success" />
                                    </Box>

                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="caption" color="text.secondary">Invested Amount</Typography>
                                            <Typography variant="h6" fontWeight={600}>{formatCurrency(inv.invested)}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="caption" color="text.secondary">Current Value</Typography>
                                            <Typography variant="h6" fontWeight={600} color="success.main">
                                                {formatCurrency(inv.currentValue)}
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            <Typography variant="caption" color="text.secondary">Gains</Typography>
                                            <Typography variant="h6" fontWeight={600} color="success.main">
                                                +{formatCurrency(gain)}
                                            </Typography>
                                            <Chip label={`+${gainPercent}%`} color="success" size="small" />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 3 }}>
                                            {inv.maturityDate && (
                                                <>
                                                    <Typography variant="caption" color="text.secondary">Maturity Date</Typography>
                                                    <Typography variant="body2" fontWeight={600}>{inv.maturityDate}</Typography>
                                                </>
                                            )}
                                        </Grid>
                                    </Grid>

                                    <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                                        <Button variant="outlined" size="small">View Details</Button>
                                        <Button variant="outlined" size="small">Redeem</Button>
                                        <Button variant="text" size="small">Download Certificate</Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {investments.length === 0 && (
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <AccountBalanceWallet sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Investments Yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Start investing to grow your wealth
                    </Typography>
                    <Button variant="contained">Start Investing</Button>
                </Paper>
            )}
        </Container>
    );
};
