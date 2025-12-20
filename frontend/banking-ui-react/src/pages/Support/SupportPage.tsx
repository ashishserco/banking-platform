import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore, HeadsetMic, Email, LocationOn } from '@mui/icons-material';

const faqs = [
    { q: 'How do I reset my password?', a: 'You can reset your password by going to Settings > Security > Change Password.' },
    { q: 'What is the daily transaction limit?', a: 'The default daily limit is $10,000. You can request to increase this in Account Settings.' },
    { q: 'How do I block my lost card?', a: 'Go to Cards > Manage > Block Card immediately. You can also call our helpline.' },
];

export const SupportPage: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
                Help & Support
            </Typography>

            <Grid container spacing={4} sx={{ mb: 6 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ height: '100%', textAlign: 'center' }}>
                        <CardContent sx={{ py: 4 }}>
                            <HeadsetMic color="primary" sx={{ fontSize: 40, mb: 2 }} />
                            <Typography variant="h6" gutterBottom>24/7 Helpline</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Call us anytime for urgent issues.
                            </Typography>
                            <Button variant="outlined">1-800-AADHYA-BANK</Button>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ height: '100%', textAlign: 'center' }}>
                        <CardContent sx={{ py: 4 }}>
                            <Email color="primary" sx={{ fontSize: 40, mb: 2 }} />
                            <Typography variant="h6" gutterBottom>Email Support</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                We typically respond within 24 hours.
                            </Typography>
                            <Button variant="outlined">support@aadhya.bank</Button>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ height: '100%', textAlign: 'center' }}>
                        <CardContent sx={{ py: 4 }}>
                            <LocationOn color="primary" sx={{ fontSize: 40, mb: 2 }} />
                            <Typography variant="h6" gutterBottom>Locate Branch</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Find the nearest branch or ATM.
                            </Typography>
                            <Button variant="outlined">Find Us</Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                Frequently Asked Questions
            </Typography>
            {faqs.map((faq, index) => (
                <Accordion key={index} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&:not(:last-child)': { mb: 1 } }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography fontWeight={500}>{faq.q}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography color="text.secondary">{faq.a}</Typography>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};
