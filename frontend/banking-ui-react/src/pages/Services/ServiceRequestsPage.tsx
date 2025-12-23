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
    Card,
    CardContent,
    Chip,
    Alert,
    Tabs,
    Tab,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormLabel
} from '@mui/material';
import {
    MenuBook,
    Block,
    Description
} from '@mui/icons-material';

export const ServiceRequestsPage: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        accountNumber: '',
        chequebookType: 'standard',
        numberOfLeaves: '25',
        cardNumber: '',
        lostCardType: '',
        blockReason: '',
        mobileNumber: '',
        email: ''
    });

    const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [field]: event.target.value });
    };

    const handleSubmit = () => {
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="success" sx={{ mb: 3 }}>
                    Your request has been submitted successfully!
                    <br />
                    Reference Number: SR{Math.random().toString().slice(2, 10)}
                    <br />
                    You will receive an update within 24-48 hours.
                </Alert>
                <Button variant="contained" onClick={() => { setSubmitted(false); }}>
                    Submit Another Request
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
                Service Requests
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Request banking services and manage your cards
            </Typography>

            <Paper sx={{ p: 4 }}>
                <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tab icon={<MenuBook />} iconPosition="start" label="Cheque Book" />
                    <Tab icon={<Block />} iconPosition="start" label="Block Card" />
                    <Tab icon={<Description />} iconPosition="start" label="Request Status" />
                </Tabs>

                {/* Cheque Book Request */}
                {tabValue === 0 && (
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" gutterBottom>Request New Cheque Book</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                select
                                label="Select Account"
                                value={formData.accountNumber}
                                onChange={handleChange('accountNumber')}
                            >
                                <MenuItem value="">Choose Account</MenuItem>
                                <MenuItem value="ACC001234567890">Savings - ACC001234567890</MenuItem>
                                <MenuItem value="ACC001234567891">Current - ACC001234567891</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                select
                                label="Cheque Book Type"
                                value={formData.chequebookType}
                                onChange={handleChange('chequebookType')}
                            >
                                <MenuItem value="standard">Standard</MenuItem>
                                <MenuItem value="personalized">Personalized</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                select
                                label="Number of Leaves"
                                value={formData.numberOfLeaves}
                                onChange={handleChange('numberOfLeaves')}
                            >
                                <MenuItem value="25">25 Leaves</MenuItem>
                                <MenuItem value="50">50 Leaves</MenuItem>
                                <MenuItem value="100">100 Leaves</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Alert severity="info">
                                Delivery charges may apply. Standard delivery takes 5-7 business days.
                            </Alert>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleSubmit}
                                disabled={!formData.accountNumber}
                            >
                                Request Cheque Book
                            </Button>
                        </Grid>
                    </Grid>
                )}

                {/* Block Card */}
                {tabValue === 1 && (
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" gutterBottom color="error">Block Lost/Stolen Card</Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <FormLabel component="legend">Card Type</FormLabel>
                            <RadioGroup
                                value={formData.lostCardType}
                                onChange={handleChange('lostCardType')}
                            >
                                <FormControlLabel value="debit" control={<Radio />} label="Debit Card" />
                                <FormControlLabel value="credit" control={<Radio />} label="Credit Card" />
                            </RadioGroup>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Last 4 Digits of Card"
                                value={formData.cardNumber}
                                onChange={handleChange('cardNumber')}
                                inputProps={{ maxLength: 4 }}
                                placeholder="XXXX"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                select
                                label="Reason for Blocking"
                                value={formData.blockReason}
                                onChange={handleChange('blockReason')}
                            >
                                <MenuItem value="">Select Reason</MenuItem>
                                <MenuItem value="lost">Lost</MenuItem>
                                <MenuItem value="stolen">Stolen</MenuItem>
                                <MenuItem value="damaged">Damaged</MenuItem>
                                <MenuItem value="suspected_fraud">Suspected Fraud</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Mobile Number"
                                value={formData.mobileNumber}
                                onChange={handleChange('mobileNumber')}
                                placeholder="For OTP verification"
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Alert severity="warning">
                                <strong>Important:</strong> Your card will be permanently blocked. You can request a new card after blocking.
                            </Alert>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Button
                                variant="contained"
                                color="error"
                                size="large"
                                onClick={handleSubmit}
                                disabled={!formData.lostCardType || !formData.cardNumber || !formData.blockReason}
                            >
                                Block Card Immediately
                            </Button>
                        </Grid>
                    </Grid>
                )}

                {/* Request Status */}
                {tabValue === 2 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>Your Recent Requests</Typography>
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid size={{ xs: 12 }}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={600}>Cheque Book Request</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Reference: SR12345678 • 2 days ago
                                                </Typography>
                                            </Box>
                                            <Chip label="In Progress" color="warning" />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};
