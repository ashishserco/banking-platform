import React from 'react';
import { Box, Button, Paper, Container } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import heroImage from '@/assets/hero.png';

export const HeroSection: React.FC = () => {
    return (
        <Paper
            elevation={0}
            sx={{
                position: 'relative',
                backgroundColor: 'grey.800',
                color: '#fff',
                mb: 4,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundImage: `url(${heroImage})`,
                borderRadius: 2,
                overflow: 'hidden',
                minHeight: 280,
                display: 'flex',
                alignItems: 'center',
            }}
        >
            {/* Dark overlay for better text contrast if needed, currently image has text */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    right: 0,
                    left: 0,
                    backgroundColor: 'rgba(0,0,0,0.2)',
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                {/* 
                  The image already has text "Premium Personal Loans...". 
                  We can add a call to action button here.
               */}
                <Box sx={{ mt: 16 }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        endIcon={<ArrowForward />}
                        sx={{
                            borderRadius: 50,
                            px: 4,
                            py: 1.5,
                            fontWeight: 'bold',
                            boxShadow: '0 4px 14px 0 rgba(0,0,0,0.39)',
                        }}
                    >
                        Apply Now
                    </Button>
                </Box>
            </Container>
        </Paper>
    );
};
