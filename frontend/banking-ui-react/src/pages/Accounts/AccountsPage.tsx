import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Grid, Chip, Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText } from '@mui/material';
import { Add as AddIcon, ArrowForward as ArrowForwardIcon, AccountBalance as AccountBalanceIcon, CreditCard as CreditCardIcon, Info as InfoIcon } from '@mui/icons-material';
import { formatCurrency } from '@/utils/formatters';
import { useAppSelector } from '@/hooks/useRedux';

const getAccountIcon = (type: string) => {
    if (type.toLowerCase().includes('card')) return <CreditCardIcon fontSize="large" color="warning" />;
    if (type.toLowerCase().includes('current')) return <AccountBalanceIcon fontSize="large" color="secondary" />;
    return <AccountBalanceIcon fontSize="large" color="primary" />;
};

export const AccountsPage: React.FC = () => {
    const navigate = useNavigate();
    const accounts = useAppSelector((state) => state.accounts.list);
    const [selectedAccount, setSelectedAccount] = React.useState<any>(null);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight={700}>
                    My Accounts
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/dashboard/open-account')}
                >
                    Open New Account
                </Button>
            </Box>

            <Grid container spacing={3}>
                {accounts.map((account) => (
                    <Grid size={{ xs: 12, md: 6, lg: 4 }} key={account.id}>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                                        {getAccountIcon(account.type)}
                                    </Box>
                                    <Chip
                                        label={account.status}
                                        color={account.status === 'Active' ? 'success' : 'default'}
                                        size="small"
                                    />
                                </Box>

                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    {account.type}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    {account.number}
                                </Typography>

                                <Divider sx={{ my: 2 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Available Balance
                                        </Typography>
                                        <Typography variant="h5" fontWeight={700} color={account.balance < 0 ? 'error.main' : 'text.primary'}>
                                            {formatCurrency(account.balance)}
                                        </Typography>
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        endIcon={<ArrowForwardIcon />}
                                        onClick={() => setSelectedAccount(account)}
                                    >
                                        Details
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            {/* Account Details Dialog */}
            <Dialog open={!!selectedAccount} onClose={() => setSelectedAccount(null)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon color="primary" /> {selectedAccount?.type} Details
                </DialogTitle>
                <DialogContent dividers>
                    <List disablePadding>
                        <ListItem sx={{ px: 0 }}>
                            <ListItemText primary="Account Number" secondary={selectedAccount?.number} />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                            <ListItemText primary="Account Holder" secondary="Aadhya Bank User" />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                            <ListItemText primary="Balance" secondary={selectedAccount ? formatCurrency(selectedAccount.balance) : '$0.00'} />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                            <ListItemText primary="Branch" secondary="Main Street Branch, NY" />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                            <ListItemText primary="IFSC/Routing" secondary="AADHYA000123" />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                            <ListItemText primary="Interest Rate" secondary={selectedAccount?.type.includes('Savings') ? '4.0% p.a.' : 'N/A'} />
                        </ListItem>
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedAccount(null)}>Close</Button>
                    <Button variant="contained" onClick={() => navigate('/dashboard/transactions')}>View Transactions</Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
};
