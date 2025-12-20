import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Stepper, Step, StepLabel, Container, Alert } from '@mui/material';
import { ArrowForward, Check } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useRedux';
import { addAccount } from '@/store/slices/accountSlice';
import { addNotification } from '@/store/slices/notificationSlice';

const steps = ['Select Account Type', 'Review Details', 'Initial Deposit'];

export const OpenAccountPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAuth();
    const [activeStep, setActiveStep] = useState(0);
    const [accountType, setAccountType] = useState('savings');
    const [initialDeposit, setInitialDeposit] = useState('1000');
    const [success, setSuccess] = useState(false);

    const handleNext = () => {
        if (activeStep === steps.length - 1) {
            const labels: { [key: string]: string } = {
                'savings': 'Savings Account',
                'current': 'Current Account',
                'salary': 'Salary Account',
                'nri': 'NRI Savings Account',
                'agri': 'Agri Business Account',
                'corporate': 'Corporate Current Account'
            };
            const label = labels[accountType] || accountType;

            dispatch(addAccount({
                type: label,
                balance: parseFloat(initialDeposit),
                currency: 'USD',
                expiry: null
            }));

            dispatch(addNotification({
                title: 'New Account Opened',
                desc: `Your ${label} has been successfully opened with a balance of $${initialDeposit}`,
                type: 'credit'
            }));

            setSuccess(true);
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    if (success) {
        return (
            <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
                <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'success.light', bgcolor: 'success.50' }}>
                    <Check sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        Account Opened Successfully!
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        Your new account has been created and is ready to use.
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/dashboard/accounts')}>
                        Go to My Accounts
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
                Open New Account
            </Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
                {activeStep === 0 && (
                    <Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>Select Account Type</Typography>
                        <Grid container spacing={3}>
                            {[
                                { value: 'savings', label: 'Savings Account', desc: 'Earn up to 4% interest p.a. with zero monthly maintenance fees options.' },
                                { value: 'current', label: 'Current Account', desc: 'Perfect for business owners and frequent transactions.' },
                                { value: 'salary', label: 'Salary Account', desc: 'Zero balance account for salaried professionals.' },
                                { value: 'nri', label: 'NRI Savings Account', desc: 'Secure and high-yielding accounts for non-resident Indians.' },
                                { value: 'agri', label: 'Agri Business Account', desc: 'Specially designed for farmers and agri-based businesses.' },
                                { value: 'corporate', label: 'Corporate Current Account', desc: 'Comprehensive solution for large-scale corporate banking.' }
                            ].map((option) => (
                                <Grid size={{ xs: 12 }} key={option.value}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            border: '2px solid',
                                            borderColor: accountType === option.value ? 'primary.main' : 'divider',
                                            cursor: 'pointer',
                                            bgcolor: accountType === option.value ? 'primary.50' : 'background.paper',
                                            transition: 'all 0.2s',
                                            '&:hover': { borderColor: 'primary.main' }
                                        }}
                                        onClick={() => setAccountType(option.value)}
                                    >
                                        <Typography variant="subtitle1" fontWeight={700} color={accountType === option.value ? 'primary.main' : 'text.primary'}>
                                            {option.label}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {option.desc}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {activeStep === 1 && (
                    <Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>Review Your Details</Typography>
                        <Alert severity="info" sx={{ mb: 3 }}>
                            We've pre-filled your details from your profile. Please verify them.
                        </Alert>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth label="Full Name" value={`${user?.firstName || ''} ${user?.lastName || ''}`} disabled />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth label="Email Address" value={user?.email || ''} disabled />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth label="Phone Number" value="+1 (555) 000-0000" disabled />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth label="Selected Account" value={accountType.toUpperCase()} disabled />
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {activeStep === 2 && (
                    <Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>Initial Deposit</Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Add money to your new account to get started immediately.
                        </Typography>
                        <TextField
                            fullWidth
                            label="Amount (USD)"
                            type="number"
                            value={initialDeposit}
                            onChange={(e) => setInitialDeposit(e.target.value)}
                            InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
                            sx={{ mb: 3, maxWidth: 300 }}
                        />
                    </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    {activeStep > 0 && (
                        <Button onClick={handleBack} sx={{ mr: 2 }}>
                            Back
                        </Button>
                    )}
                    <Button variant="contained" onClick={handleNext} endIcon={<ArrowForward />}>
                        {activeStep === steps.length - 1 ? 'Create Account' : 'Next'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};
