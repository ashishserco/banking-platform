import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    TextField,
    Button,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Alert
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { useAppSelector } from '@/hooks/useRedux';
import { formatCurrency, formatDate } from '@/utils/formatters';

export const AccountStatementPage: React.FC = () => {
    const accounts = useAppSelector(state => state.accounts.list);
    const transactions = useAppSelector(state => state.transactions.list);
    const [selectedAccount, setSelectedAccount] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [statementGenerated, setStatementGenerated] = useState(false);

    const handleGenerateStatement = () => {
        setStatementGenerated(true);
    };

    const handleDownloadPDF = () => {
        alert('Statement PDF would download here');
    };

    const filteredTransactions = transactions.filter(() => {
        if (!statementGenerated || !selectedAccount) return false;
        return true;
    });

return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
            Account Statement
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Download or view your account statement for any period
        </Typography>

        <Paper sx={{ p: 4 }}>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                        fullWidth
                        select
                        label="Select Account"
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                    >
                        <MenuItem value="">Choose Account</MenuItem>
                        {accounts.map(acc => (
                            <MenuItem key={acc.id} value={acc.id}>
                                {acc.type} - {acc.number}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                        fullWidth
                        label="From Date"
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <TextField
                        fullWidth
                        label="To Date"
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleGenerateStatement}
                        disabled={!selectedAccount || !fromDate || !toDate}
                        sx={{ height: 56 }}
                    >
                        Generate
                    </Button>
                </Grid>
            </Grid>

            {statementGenerated && (
                <Box sx={{ mt: 4 }}>
                    <Alert severity="success" sx={{ mb: 3 }}>
                        Statement generated successfully for the period {fromDate} to {toDate}
                    </Alert>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">Transaction Details</Typography>
                        <Button
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={handleDownloadPDF}
                        >
                            Download PDF
                        </Button>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Reference</TableCell>
                                    <TableCell align="right">Debit</TableCell>
                                    <TableCell align="right">Credit</TableCell>
                                    <TableCell align="right">Balance</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((txn, idx) => (
                                        <TableRow key={txn.id || idx}>
                                            <TableCell>{formatDate(txn.date)}</TableCell>
                                            <TableCell>{txn.desc || '-'}</TableCell>
                                            <TableCell>
                                                <Chip label={txn.ref || 'N/A'} size="small" />
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: 'error.main' }}>
                                                {txn.type === 'Debit' ? formatCurrency(Math.abs(txn.amount)) : '-'}
                                            </TableCell>
                                            <TableCell align="right" sx={{ color: 'success.main' }}>
                                                {txn.type === 'Credit' ? formatCurrency(txn.amount) : '-'}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                {formatCurrency(accounts.find(a => a.id === selectedAccount)?.balance || 0)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography variant="body2" color="text.secondary">
                                                No transactions found for the selected period
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </Paper>
    </Container>
);
};
