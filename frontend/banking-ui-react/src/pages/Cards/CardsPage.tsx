import React, { useState } from 'react';
import {
    Box,
    Typography,
    Container,
    Grid,
    Paper,
    Switch,
    FormControlLabel,
    Slider,
    Button,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    Alert,
    Tabs,
    Tab
} from '@mui/material';
import {
    Lock,
    LockOpen,
    Security,
    Settings,
    TrendingUp,
    Warning as WarningIcon
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { BankCard } from '@/components/cards/BankCard';
import { toggleBlock, updateLimits, setPin } from '@/store/slices/cardSlice';
import { addNotification } from '@/store/slices/notificationSlice';

export const CardsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const allCards = useAppSelector(state => state.cards.list);
    const [cardTypeTab, setCardTypeTab] = useState(0); // 0 for Debit, 1 for Credit

    const filteredCards = allCards.filter(c => cardTypeTab === 0 ? c.type === 'Debit' : c.type === 'Credit');
    const [selectedCardIdx, setSelectedCardIdx] = useState(0);

    const card = filteredCards[selectedCardIdx] || filteredCards[0];

    const [pinDialogOpen, setPinDialogOpen] = useState(false);
    const [pin, setPinValue] = useState('');
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');

    // Mock credit card outstanding balance (would come from API)
    const outstandingBalance = card?.type === 'Credit' ? 2450.75 : 0;
    const dueDate = '2025-12-28';

    const handleTabChange = (_: any, newValue: number) => {
        setCardTypeTab(newValue);
        setSelectedCardIdx(0);
    };

    const handleToggleBlock = () => {
        if (!card) return;
        dispatch(toggleBlock(card.id));
        dispatch(addNotification({
            title: card.isBlocked ? 'Card Unblocked' : 'Card Blocked',
            desc: `Your ${card.type} card ending in ${card.number.slice(-4)} has been ${card.isBlocked ? 'unblocked' : 'temporarily blocked'}.`,
            type: card.isBlocked ? 'info' : 'security'
        }));
    };

    const handleLimitChange = (type: 'atm' | 'online' | 'pos', newValue: number | number[]) => {
        if (!card) return;
        const newLimits = { ...card.limits, [type]: newValue as number };
        dispatch(updateLimits({ id: card.id, limits: newLimits }));
    };

    const handlePinSubmit = () => {
        if (card && pin.length === 4) {
            dispatch(setPin({ id: card.id, pin }));
            setPinDialogOpen(false);
            setPinValue('');
            dispatch(addNotification({
                title: 'PIN Updated',
                desc: `Reset successful for card ending in ${card.number.slice(-4)}.`,
                type: 'security'
            }));
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight={800}>Card Management</Typography>
                    <Typography variant="body1" color="text.secondary">Securely manage your debit and credit cards</Typography>
                </Box>
                {card && (
                    <Chip
                        label={card.status}
                        color={card.status === 'Active' ? 'success' : 'error'}
                        variant="filled"
                        sx={{ fontWeight: 700, px: 1 }}
                    />
                )}
            </Box>

            <Tabs
                value={cardTypeTab}
                onChange={handleTabChange}
                sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
            >
                <Tab label="Debit Cards" />
                <Tab label="Credit Cards" />
            </Tabs>

            {filteredCards.length > 0 ? (
                <Grid container spacing={4}>
                    {/* Left: Card Display & Selector */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Box sx={{ position: 'sticky', top: 24 }}>
                            <Box sx={{ mb: 4 }}>
                                <BankCard card={card} />
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}>
                                    {filteredCards.map((c: any, idx: number) => (
                                        <Box
                                            key={c.id}
                                            onClick={() => setSelectedCardIdx(idx)}
                                            sx={{
                                                width: selectedCardIdx === idx ? 24 : 12,
                                                height: 12,
                                                borderRadius: 6,
                                                bgcolor: selectedCardIdx === idx ? 'primary.main' : 'grey.300',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>

                            <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="h6" fontWeight={700} gutterBottom>Card Actions</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Quick security controls for your card.
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12 }}>
                                        <Button
                                            fullWidth
                                            variant={card.isBlocked ? "contained" : "outlined"}
                                            color={card.isBlocked ? "success" : "error"}
                                            startIcon={card.isBlocked ? <LockOpen /> : <Lock />}
                                            onClick={handleToggleBlock}
                                            sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
                                        >
                                            {card.isBlocked ? "Unblock Card" : "Temp Block Card"}
                                        </Button>
                                    </Grid>
                                    {card.type === 'Credit' && outstandingBalance > 0 && (
                                        <Grid size={{ xs: 12 }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                color="primary"
                                                onClick={() => { setPaymentAmount(outstandingBalance.toString()); setPaymentDialogOpen(true); }}
                                                sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
                                            >
                                                Pay Credit Card Bill (${outstandingBalance})
                                            </Button>
                                        </Grid>
                                    )}
                                    <Grid size={{ xs: 12 }}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            onClick={() => alert('Download statement - feature coming soon')}
                                            sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
                                        >
                                            Download Statement
                                        </Button>
                                    </Grid>
                                </Grid>

                                {card.isBlocked && (
                                    <Alert icon={<WarningIcon />} severity="error" sx={{ mt: 3, borderRadius: 2 }}>
                                        Your card is currently blocked. No transactions are allowed.
                                    </Alert>
                                )}
                            </Paper>
                        </Box>
                    </Grid>

                    {/* Right: Controls */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12 }}>
                                <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="h6" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ bgcolor: 'primary.50', p: 1, borderRadius: 1.5, display: 'flex' }}>
                                            <Settings color="primary" fontSize="small" />
                                        </Box>
                                        Usage & Controls
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {[
                                            { label: 'Online Transactions', desc: 'Enable payments for e-commerce websites' },
                                            { label: 'International Usage', desc: 'Allow transactions outside your country' },
                                            { label: 'Contactless (Tap & Pay)', desc: 'Allow NFC payments at terminals' },
                                            { label: 'POS Payments', desc: 'Enable physical store payments' }
                                        ].map((control, idx) => (
                                            <React.Fragment key={idx}>
                                                <FormControlLabel
                                                    control={<Switch defaultChecked color="primary" disabled={card.isBlocked} />}
                                                    label={
                                                        <Box sx={{ ml: 1 }}>
                                                            <Typography variant="body1" fontWeight={600}>{control.label}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{control.desc}</Typography>
                                                        </Box>
                                                    }
                                                    sx={{ width: '100%', justifyContent: 'space-between', flexDirection: 'row-reverse', ml: 0, py: 1 }}
                                                />
                                                {idx < 3 && <Divider />}
                                            </React.Fragment>
                                        ))}
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                                    <Typography variant="h6" fontWeight={700} sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ bgcolor: 'primary.50', p: 1, borderRadius: 1.5, display: 'flex' }}>
                                            <TrendingUp color="primary" fontSize="small" />
                                        </Box>
                                        Spending Limits
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                        {[
                                            { key: 'atm', label: 'ATM Withdrawal Limit', max: 5000, step: 100 },
                                            { key: 'online', label: 'Online Transaction Limit', max: 20000, step: 500 },
                                            { key: 'pos', label: 'POS / Store Limit', max: 10000, step: 200 }
                                        ].map((limit) => (
                                            <Box key={limit.key}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                    <Typography variant="body1" fontWeight={600}>{limit.label}</Typography>
                                                    <Typography variant="body1" color="primary" fontWeight={800}>
                                                        ${card.limits[limit.key as keyof typeof card.limits].toLocaleString()}
                                                    </Typography>
                                                </Box>
                                                <Slider
                                                    value={card.limits[limit.key as keyof typeof card.limits]}
                                                    max={limit.max}
                                                    step={limit.step}
                                                    disabled={card.isBlocked}
                                                    onChange={(_, v) => handleLimitChange(limit.key as any, v)}
                                                    valueLabelDisplay="auto"
                                                    sx={{
                                                        height: 8,
                                                        '& .MuiSlider-thumb': {
                                                            width: 24,
                                                            height: 24,
                                                            backgroundColor: '#fff',
                                                            border: '2px solid currentColor',
                                                            '&:hover, &.Mui-focusVisible': {
                                                                boxShadow: 'inherit',
                                                            },
                                                        },
                                                    }}
                                                />
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">$0</Typography>
                                                    <Typography variant="caption" color="text.secondary">${limit.max.toLocaleString()}</Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            ) : (
                <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, border: '1px dashed', borderColor: 'divider' }}>
                    <Typography variant="h6" color="text.secondary">No {cardTypeTab === 0 ? 'Debit' : 'Credit'} cards found.</Typography>
                    <Button variant="contained" sx={{ mt: 2 }}>Apply for new card</Button>
                </Paper>
            )}

            {/* PIN Dialog */}
            <Dialog
                open={pinDialogOpen}
                onClose={() => setPinDialogOpen(false)}
                PaperProps={{
                    sx: { borderRadius: 3, p: 1, minWidth: 320 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>Update Card PIN</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Set a new 4-digit security PIN for your {card?.type} card ending in {card?.number.slice(-4)}.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <TextField
                            fullWidth
                            type="password"
                            placeholder="...."
                            value={pin}
                            autoFocus
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                if (val.length <= 4) setPinValue(val);
                            }}
                            inputProps={{
                                maxLength: 4,
                                style: {
                                    fontSize: '32px',
                                    textAlign: 'center',
                                    letterSpacing: '12px',
                                    fontWeight: 700
                                }
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                }
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setPinDialogOpen(false)} color="inherit" sx={{ fontWeight: 700 }}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handlePinSubmit}
                        disabled={pin.length !== 4}
                        sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
                    >
                        Confirm PIN
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};
