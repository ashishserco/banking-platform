import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Stack } from '@mui/material';
import { FlightTakeoff, Payments } from '@mui/icons-material';

const ForexPage: React.FC = () => {
    const rates = [
        { pair: 'USD / INR', buy: 83.15, sell: 83.45, change: '+0.12%' },
        { pair: 'EUR / INR', buy: 91.20, sell: 91.60, change: '-0.05%' },
        { pair: 'GBP / INR', buy: 105.40, sell: 105.90, change: '+0.21%' },
        { pair: 'AED / INR', buy: 22.64, sell: 22.75, change: '0.00%' }
    ];

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800}>Forex Services</Typography>
                <Typography variant="body1" color="text.secondary">International banking and currency exchange</Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'action.hover' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>Currency Pair</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Buy Rate</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Sell Rate</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>24h Change</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rates.map((rate) => (
                                    <TableRow key={rate.pair} hover>
                                        <TableCell sx={{ fontWeight: 600 }}>{rate.pair}</TableCell>
                                        <TableCell>{rate.buy.toFixed(2)}</TableCell>
                                        <TableCell>{rate.sell.toFixed(2)}</TableCell>
                                        <TableCell sx={{ color: rate.change.startsWith('+') ? 'success.main' : 'error.main', fontWeight: 700 }}>
                                            {rate.change}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={3}>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FlightTakeoff color="primary" /> Forex Card
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Reloadable card for secure international travel with locked-in exchange rates.
                                </Typography>
                                <Button fullWidth variant="contained" sx={{ borderRadius: 2 }}>Buy Card</Button>
                            </CardContent>
                        </Card>

                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Payments color="primary" /> Outward Remittance
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Send money globally to family or for education with competitive rates.
                                </Typography>
                                <Button fullWidth variant="outlined" sx={{ borderRadius: 2 }}>Transfer Now</Button>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ForexPage;
