import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Stack, Avatar } from '@mui/material';
import { AutoGraph, Lightbulb, Security, Speed } from '@mui/icons-material';

const BankSmartPage: React.FC = () => {
    const features = [
        {
            title: 'AI Spend Insights',
            desc: 'Analyze your spending patterns and get personalized recommendations to save more.',
            icon: <AutoGraph />,
            color: '#6366f1'
        },
        {
            title: 'Smart Budgeting',
            desc: 'Set category-wise budgets and get real-time alerts when you are close to your limit.',
            icon: <Lightbulb />,
            color: '#f59e0b'
        },
        {
            title: 'Enhanced Security',
            desc: 'Real-time fraud detection and smart lock features for all your digital transactions.',
            icon: <Security />,
            color: '#10b981'
        },
        {
            title: 'Goal Tracker',
            desc: 'Create and track financial goals. Automate savings to reach your targets faster.',
            icon: <Speed />,
            color: '#ec4899'
        }
    ];

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ mb: 6, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={900} gutterBottom sx={{
                    background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block'
                }}>
                    BankSmart AI
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Intelligent banking tools to help you manage your money better.
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {features.map((feature, idx) => (
                    <Grid size={{ xs: 12, md: 6 }} key={idx}>
                        <Card elevation={0} sx={{
                            height: '100%',
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 6,
                            transition: 'transform 0.3s ease',
                            '&:hover': { transform: 'translateY(-8px)', boxShadow: 10 }
                        }}>
                            <CardContent>
                                <Stack direction="row" spacing={3} alignItems="center">
                                    <Avatar sx={{
                                        bgcolor: `${feature.color}15`,
                                        color: feature.color,
                                        width: 64,
                                        height: 64,
                                        borderRadius: 3
                                    }}>
                                        {feature.icon}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" fontWeight={800} gutterBottom>{feature.title}</Typography>
                                        <Typography variant="body2" color="text.secondary">{feature.desc}</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Card sx={{ mt: 6, p: 4, borderRadius: 8, bgcolor: 'primary.50', border: 'none' }}>
                <Typography variant="h5" fontWeight={800} align="center" gutterBottom>Coming Soon: Aadhya AI Assistant</Typography>
                <Typography variant="body1" align="center" color="primary.dark">
                    Your personal AI financial advisor is being trained. Get ready for conversational banking!
                </Typography>
            </Card>
        </Box>
    );
};

export default BankSmartPage;
