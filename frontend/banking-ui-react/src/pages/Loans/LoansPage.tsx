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
    LinearProgress,
    Chip,
    Stack,
    Divider
} from '@mui/material';
import { TrendingUp, AccountBalance, CalendarToday } from '@mui/icons-material';
import { formatCurrency, formatDate } from '@/utils/formatters';

export const LoansPage: React.FC = () => {
    // Mock loan data - would come from Redux in production
    const loans = [
        {
            id: 'L001',
            type: 'Home Loan',
            amount: 250000,
            disbursed: 250000,
            outstanding: 205000,
            paid: 45000,
            interestRate: 7.5,
            tenure: 240, // months
            monthlyEMI: 2042,
            nextDueDate: '2025-12-28',
            status: 'Active'
        },
        {
            id: 'L002',
            type: 'Personal Loan',
            amount: 50000,
            disbursed: 50000,
            outstanding: 35000,
            paid: 15000,
            interestRate: 11.5,
            tenure: 36,
            monthlyEMI: 1650,
            nextDueDate: '2025-12-25',
            status: 'Active'
        }
    ];

    const calculateProgress = (paid: number, total: number) => {
        return (paid / total) * 100;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        My Loans
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage and track all your loans
                    </Typography>
                </Box>
                <Button variant="contained" size="large">
                    Apply for New Loan
                </Button>
            </Box>

            <Grid container spacing={3}>
                {loans.map((loan) => (
                    <Grid size={{ xs: 12 }} key={loan.id}>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
                                    <Box>
                                        <Typography variant="h6" fontWeight={700}>{loan.type}</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Loan ID: {loan.id}
                                        </Typography>
                                    </Box>
                                    <Chip label={loan.status} color="success" />
                                </Box>

                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <Typography variant="caption" color="text.secondary">Loan Amount</Typography>
                                        <Typography variant="h6" fontWeight={600}>{formatCurrency(loan.amount)}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <Typography variant="caption" color="text.secondary">Outstanding</Typography>
                                        <Typography variant="h6" fontWeight={600} color="error.main">
                                            {formatCurrency(loan.outstanding)}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <Typography variant="caption" color="text.secondary">Monthly EMI</Typography>
                                        <Typography variant="h6" fontWeight={600}>{formatCurrency(loan.monthlyEMI)}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 3 }}>
                                        <Typography variant="caption" color="text.secondary">Next Due Date</Typography>
                                        <Typography variant="h6" fontWeight={600}>{formatDate(loan.nextDueDate)}</Typography>
                                    </Grid>
                                </Grid>

                                <Box sx={{ mt: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">Repayment Progress</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {calculateProgress(loan.paid, loan.amount).toFixed(1)}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={calculateProgress(loan.paid, loan.amount)}
                                        sx={{ height: 8, borderRadius: 1 }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Paid: {formatCurrency(loan.paid)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Total: {formatCurrency(loan.amount)}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Stack direction="row" spacing={2}>
                                    <Button variant="outlined" size="small">View Details</Button>
                                    <Button variant="outlined" size="small">Pay EMI</Button>
                                    <Button variant="outlined" size="small">Download Statement</Button>
                                    <Button variant="text" size="small">Foreclose</Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {loans.length === 0 && (
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                    <AccountBalance sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Active Loans
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Apply for a loan to get started
                    </Typography>
                    <Button variant="contained">Apply for Loan</Button>
                </Paper>
            )}
        </Container>
    );
};
