import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Tabs, Tab, InputAdornment, MenuItem, Alert, Chip, Stack } from '@mui/material';
import { AttachMoney, Receipt, Smartphone, Info, AccessTime, AccountBalance } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { addTransaction } from '@/store/slices/transactionSlice';
import { addNotification } from '@/store/slices/notificationSlice';
import { updateBalance } from '@/store/slices/accountSlice';

// Transfer Mode Info Component
const TransferModeInfo: React.FC<{ mode: string; amount: number }> = ({ mode, amount }) => {
    const modeInfo: { [key: string]: { limit: number; charges: string; timing: string; speed: string; color: 'success' | 'info' | 'warning' | 'primary' } } = {
        IMPS: {
            limit: 500000,
            charges: amount > 1000 ? '$0.50' : 'Free',
            timing: 'Available 24x7 including holidays',
            speed: 'Instant transfer',
            color: 'success'
        },
        NEFT: {
            limit: 1000000,
            charges: amount > 10000 ? '$1.00' : '$0.25',
            timing: 'Monday-Friday: 8AM - 7PM, Saturday: 8AM - 1PM',
            speed: '30 minutes to 2 hours',
            color: 'info'
        },
        RTGS: {
            limit: Infinity,
            charges: amount < 200000 ? '$30' : '$55',
            timing: 'Monday-Friday: 9AM - 4:30PM, Saturday: 9AM - 2PM',
            speed: 'Real-time (within 30 minutes)',
            color: 'primary'
        },
        UPI: {
            limit: 100000,
            charges: 'Free',
            timing: 'Available 24x7',
            speed: 'Instant transfer',
            color: 'success'
        }
    };

    const info = modeInfo[mode];
    const isValidAmount = amount > 0 && (mode === 'RTGS' ? amount >= 200000 : amount <= info.limit);

    return (
        <Alert
            severity={isValidAmount || amount === 0 ? info.color : 'error'}
            icon={<Info />}
            sx={{ mt: 1 }}
        >
            <Stack spacing={0.5}>
                <Typography variant="body2" fontWeight={600}>{mode} Transfer Details:</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip icon={<AccessTime />} label={info.speed} size="small" color={info.color} variant="outlined" />
                    <Chip icon={<AccountBalance />} label={`Charges: ${info.charges}`} size="small" />
                    <Chip label={`Limit: ${mode === 'RTGS' ? 'No limit (Min: $200,000)' : `Up to $${info.limit.toLocaleString()}`}`} size="small" />
                </Box>
                <Typography variant="caption" color="text.secondary">{info.timing}</Typography>
                {mode === 'RTGS' && amount > 0 && amount < 200000 && (
                    <Typography variant="caption" color="error">RTGS requires minimum $200,000. Please choose IMPS or NEFT.</Typography>
                )}
                {amount > info.limit && (
                    <Typography variant="caption" color="error">{mode} limit exceeded. Maximum: ${info.limit.toLocaleString()}</Typography>
                )}
            </Stack>
        </Alert>
    );
};

export const PaymentsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const [tabValue, setTabValue] = useState(0);
    const beneficiaries = useAppSelector(state => state.beneficiaries.list);
    const accounts = useAppSelector(state => state.accounts.list);

    // Form States
    const [transferData, setTransferData] = useState({
        fromAcc: '',
        toBeneficiaryId: '',
        amount: '',
        transferMode: 'IMPS', // Default to IMPS
        remarks: ''
    });
    const [billData, setBillData] = React.useState({ category: '', consumerNo: '' });
    const [rechargeData, setRechargeData] = React.useState({ number: '', operator: '', amount: '' });

    const [billFetched, setBillFetched] = React.useState(false);
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setSuccessMessage(null);
        setBillFetched(false);
    };

    const handleTransfer = () => {
        const beneficiary = beneficiaries.find(b => b.id.toString() === transferData.toBeneficiaryId);
        if (!beneficiary) return;

        const amountNum = parseFloat(transferData.amount);

        // Update Account Balance
        if (transferData.fromAcc) {
            dispatch(updateBalance({ id: transferData.fromAcc, amount: -amountNum }));
        }

        dispatch(addTransaction({
            desc: `Transfer to ${beneficiary.name}`,
            type: 'Debit',
            amount: -amountNum,
            ref: transferData.remarks || `TRX-${Date.now().toString().slice(-6)}`,
            category: 'Transfer'
        }));
        dispatch(addNotification({
            title: 'Transfer Successful',
            desc: `Sent $${amountNum} to ${beneficiary.name}`,
            type: 'debit'
        }));
        setSuccessMessage(`Successfully transferred $${amountNum} to ${beneficiary.name}`);
        setTransferData({ fromAcc: '', toBeneficiaryId: '', amount: '', transferMode: 'IMPS', remarks: '' });
    };

    const handlePayBill = () => {
        const amountNum = 154.20;
        // Deduct from first active savings account if available
        const mainAcc = accounts.find(a => a.type.includes('Savings')) || accounts[0];
        if (mainAcc) {
            dispatch(updateBalance({ id: mainAcc.id, amount: -amountNum }));
        }

        dispatch(addTransaction({
            desc: `Bill Payment - ${billData.category}`,
            type: 'Debit',
            amount: -amountNum,
            ref: `BIL-${Date.now().toString().slice(-6)}`,
            category: 'Bills'
        }));
        dispatch(addNotification({
            title: 'Bill Paid',
            desc: `${billData.category} bill of $${amountNum} paid successfully.`,
            type: 'debit'
        }));
        setSuccessMessage(`Successfully paid ${billData.category} bill of $${amountNum}`);
        setBillFetched(false);
    };

    const handleRecharge = () => {
        const amountNum = parseFloat(rechargeData.amount);
        const mainAcc = accounts.find(a => a.type.includes('Savings')) || accounts[0];
        if (mainAcc) {
            dispatch(updateBalance({ id: mainAcc.id, amount: -amountNum }));
        }

        dispatch(addTransaction({
            desc: `Mobile Recharge - ${rechargeData.number}`,
            type: 'Debit',
            amount: -amountNum,
            ref: `RCH-${Date.now().toString().slice(-6)}`,
            category: 'Recharge'
        }));
        dispatch(addNotification({
            title: 'Recharge Successful',
            desc: `Recharged ${rechargeData.number} with $${amountNum}`,
            type: 'debit'
        }));
        setSuccessMessage(`Successfully recharged ${rechargeData.number} for $${amountNum}`);
        setRechargeData({ number: '', operator: '', amount: '' });
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
                Payments & Transfers
            </Typography>

            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                    <Tab icon={<AttachMoney />} iconPosition="start" label="Transfer Money" />
                    <Tab icon={<Receipt />} iconPosition="start" label="Pay Bills" />
                    <Tab icon={<Smartphone />} iconPosition="start" label="Recharge" />
                </Tabs>

                <Box sx={{ p: 4, maxWidth: 600 }}>
                    {successMessage ? (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Paper sx={{ p: 4, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.light', borderRadius: 2 }}>
                                <Typography variant="h6" color="success.main" fontWeight={700} gutterBottom>
                                    Success!
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 3 }}>
                                    {successMessage}
                                </Typography>
                                <Button variant="contained" onClick={() => setSuccessMessage(null)}>
                                    Make Another Payment
                                </Button>
                            </Paper>
                        </Box>
                    ) : (
                        <>
                            {tabValue === 0 && (
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Typography variant="h6" gutterBottom>Transfer Details</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="Transfer From"
                                            value={transferData.fromAcc}
                                            onChange={(e) => setTransferData({ ...transferData, fromAcc: e.target.value })}
                                        >
                                            <MenuItem value="">Select Account</MenuItem>
                                            {accounts.map(acc => (
                                                <MenuItem key={acc.id} value={acc.id}>{acc.type} - {acc.number} (${acc.balance})</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="Select Beneficiary"
                                            value={transferData.toBeneficiaryId}
                                            onChange={(e) => setTransferData({ ...transferData, toBeneficiaryId: e.target.value })}
                                        >
                                            <MenuItem value="">Select Beneficiary</MenuItem>
                                            {beneficiaries.map(b => (
                                                <MenuItem key={b.id} value={b.id}>{b.name} ({b.acc})</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>
                                    {transferData.toBeneficiaryId && (
                                        <Grid item xs={12}>
                                            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
                                                <Typography variant="caption" color="text.secondary">Transferring to:</Typography>
                                                <Typography variant="body1" fontWeight={600}>
                                                    {beneficiaries.find(b => b.id.toString() === transferData.toBeneficiaryId)?.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Acc: {beneficiaries.find(b => b.id.toString() === transferData.toBeneficiaryId)?.acc}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Bank: {beneficiaries.find(b => b.id.toString() === transferData.toBeneficiaryId)?.bank}
                                                </Typography>
                                            </Paper>
                                        </Grid>
                                    )}
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="Transfer Mode"
                                            value={transferData.transferMode}
                                            onChange={(e) => setTransferData({ ...transferData, transferMode: e.target.value })}
                                            SelectProps={{ native: false }}
                                        >
                                            <MenuItem value="IMPS">IMPS - Instant (24x7)</MenuItem>
                                            <MenuItem value="NEFT">NEFT - 30 mins (8AM-7PM)</MenuItem>
                                            <MenuItem value="RTGS">RTGS - Real-time (9AM-4:30PM)</MenuItem>
                                            <MenuItem value="UPI">UPI - Instant (24x7)</MenuItem>
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TransferModeInfo mode={transferData.transferMode} amount={parseFloat(transferData.amount) || 0} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Amount"
                                            type="number"
                                            value={transferData.amount}
                                            onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            label="Reference (Optional)"
                                            value={transferData.ref}
                                            onChange={(e) => setTransferData({ ...transferData, ref: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            disabled={!transferData.fromAcc || !transferData.toBeneficiaryId || !transferData.amount}
                                            onClick={handleTransfer}
                                        >
                                            Proceed to Transfer
                                        </Button>
                                    </Grid>
                                </Grid>
                            )}
                            {tabValue === 1 && (
                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="h6" gutterBottom>Bill Payment</Typography>
                                    </Grid>
                                    {!billFetched ? (
                                        <>
                                            <Grid size={{ xs: 12 }}>
                                                <TextField
                                                    fullWidth
                                                    select
                                                    label="Biller Category"
                                                    value={billData.category}
                                                    onChange={(e) => setBillData({ ...billData, category: e.target.value })}
                                                >
                                                    <MenuItem value="">Biller Category</MenuItem>
                                                    <MenuItem value="Electricity">Electricity</MenuItem>
                                                    <MenuItem value="Water">Water</MenuItem>
                                                    <MenuItem value="Internet">Internet</MenuItem>
                                                </TextField>
                                            </Grid>
                                            <Grid size={{ xs: 12 }}>
                                                <TextField
                                                    fullWidth
                                                    label="Consumer Number"
                                                    placeholder="Enter number"
                                                    value={billData.consumerNo}
                                                    onChange={(e) => setBillData({ ...billData, consumerNo: e.target.value })}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12 }}>
                                                <Button
                                                    variant="contained"
                                                    size="large"
                                                    fullWidth
                                                    onClick={() => setBillFetched(true)}
                                                    disabled={!billData.category || !billData.consumerNo}
                                                >
                                                    Fetch Bill
                                                </Button>
                                            </Grid>
                                        </>
                                    ) : (
                                        <Grid size={{ xs: 12 }}>
                                            <Paper sx={{ p: 3, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.light' }}>
                                                <Typography variant="subtitle1" fontWeight={600}>Bill Details Found</Typography>
                                                <Typography variant="body2" sx={{ mt: 1 }}>Amount Due: $154.20</Typography>
                                                <Typography variant="body2">Due Date: 25th Dec 2025</Typography>
                                                <Button variant="contained" sx={{ mt: 3 }} fullWidth onClick={handlePayBill}>
                                                    Confirm & Pay $154.20
                                                </Button>
                                                <Button variant="text" fullWidth sx={{ mt: 1 }} onClick={() => setBillFetched(false)}>
                                                    Cancel
                                                </Button>
                                            </Paper>
                                        </Grid>
                                    )}
                                </Grid>
                            )}
                            {tabValue === 2 && (
                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="h6" gutterBottom>Mobile / DTH Recharge</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Mobile Number / Subscriber ID"
                                            placeholder="Enter number"
                                            value={rechargeData.number}
                                            onChange={(e) => setRechargeData({ ...rechargeData, number: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="Operator"
                                            value={rechargeData.operator}
                                            onChange={(e) => setRechargeData({ ...rechargeData, operator: e.target.value })}
                                        >
                                            <MenuItem value="">Select Operator</MenuItem>
                                            <MenuItem value="Reliance Jio">Reliance Jio</MenuItem>
                                            <MenuItem value="Airtel">Airtel</MenuItem>
                                            <MenuItem value="Vi (Vodafone Idea)">Vi (Vodafone Idea)</MenuItem>
                                            <MenuItem value="BSNL">BSNL</MenuItem>
                                            <MenuItem value="Tata Play">Tata Play</MenuItem>
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            fullWidth
                                            label="Amount"
                                            type="number"
                                            value={rechargeData.amount}
                                            onChange={(e) => setRechargeData({ ...rechargeData, amount: e.target.value })}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                            }}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            onClick={handleRecharge}
                                            disabled={!rechargeData.number || !rechargeData.operator || !rechargeData.amount}
                                        >
                                            Recharge Now
                                        </Button>
                                    </Grid>
                                </Grid>
                            )}
                        </>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};
