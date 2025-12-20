import React from 'react';
import { Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { useAppSelector } from '@/hooks/useRedux';
import { formatDate, formatCurrency } from '@/utils/formatters';

export const TransactionsPage: React.FC = () => {
    const transactions = useAppSelector(state => state.transactions.list);

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
                Transaction History
            </Typography>

            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                    {transactions.length === 0 ? (
                        <Box sx={{ py: 8, textAlign: 'center' }}>
                            <Typography color="text.secondary">No transactions found.</Typography>
                        </Box>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Reference</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {transactions.map((row) => (
                                        <TableRow key={row.id} hover>
                                            <TableCell>{formatDate(row.date)}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={500}>{row.desc}</Typography>
                                                <Typography variant="caption" color="text.secondary">{row.type}</Typography>
                                            </TableCell>
                                            <TableCell>{row.ref}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={row.status}
                                                    size="small"
                                                    color={row.status === 'Completed' ? 'success' : 'warning'}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography fontWeight={600} color={row.amount < 0 ? 'error.main' : 'success.main'}>
                                                    {row.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(row.amount))}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};
