import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Card as CardType } from '@/store/slices/cardSlice';

interface BankCardProps {
    card: CardType;
}

export const BankCard: React.FC<BankCardProps> = ({ card }) => {
    const [flipped, setFlipped] = useState(false);

    return (
        <Box
            onClick={() => setFlipped(!flipped)}
            sx={{
                width: '100%',
                maxWidth: 400,
                height: { xs: 200, sm: 240 },
                perspective: 1000,
                cursor: 'pointer',
                mx: 'auto',
                '&:hover': {
                    '& .card-inner': {
                        transform: flipped ? 'rotateY(180deg) translateY(-5px)' : 'translateY(-5px)',
                    }
                }
            }}
        >
            <Box
                className="card-inner"
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    textAlign: 'center',
                    transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    transformStyle: 'preserve-3d',
                    transform: flipped ? 'rotateY(180deg)' : 'none',
                    borderRadius: 4,
                    boxShadow: 6,
                }}
            >
                {/* Front */}
                <Box
                    sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        borderRadius: 4,
                        background: card.type === 'Debit'
                            ? 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)'
                            : 'linear-gradient(135deg, #111827 0%, #374151 100%)',
                        color: 'white',
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.1)',
                        filter: card.isBlocked ? 'grayscale(1)' : 'none',
                    }}
                >
                    {/* Background pattern */}
                    <Box sx={{
                        position: 'absolute',
                        bottom: -30,
                        right: -30,
                        width: 150,
                        height: 150,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)'
                    }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start' }}>
                        <Box>
                            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: 2, color: 'rgba(255,255,255,0.9)', lineHeight: 1 }}>
                                {card.brand.toUpperCase()}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.6rem', ml: 0.2 }}>
                                AADHYA BANK
                            </Typography>
                        </Box>
                        <Box sx={{
                            width: 50,
                            height: 38,
                            borderRadius: 1,
                            background: 'linear-gradient(135deg, #eab308 0%, #a16207 100%)',
                            boxShadow: 'inset 0 0 5px rgba(0,0,0,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Box sx={{ width: 35, height: 25, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 0.5 }} />
                        </Box>
                    </Box>

                    <Typography variant="h5" sx={{
                        letterSpacing: 4,
                        my: 2,
                        fontFamily: 'monospace',
                        width: '100%',
                        textAlign: 'center',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                        {card.number}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-end', zIndex: 1 }}>
                        <Box>
                            <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', fontSize: '0.65rem' }}>CARD HOLDER</Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ letterSpacing: 1 }}>{card.holderName}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', fontSize: '0.65rem' }}>EXPIRES</Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ letterSpacing: 1 }}>{card.expiry}</Typography>
                        </Box>
                    </Box>

                    {card.isBlocked && (
                        <Box sx={{
                            position: 'absolute',
                            inset: 0,
                            bgcolor: 'rgba(0,0,0,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(2px)',
                            borderRadius: 4
                        }}>
                            <Typography variant="h6" fontWeight={700} sx={{ color: 'white', border: '2px solid white', px: 2, py: 0.5 }}>LOCKED</Typography>
                        </Box>
                    )}
                </Box>

                {/* Back */}
                <Box
                    sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        borderRadius: 4,
                        background: card.type === 'Debit'
                            ? 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)'
                            : 'linear-gradient(135deg, #111827 0%, #374151 100%)',
                        color: 'white',
                        transform: 'rotateY(180deg)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        pt: 3,
                        border: '1px solid rgba(255,255,255,0.1)',
                        filter: card.isBlocked ? 'grayscale(1)' : 'none',
                    }}
                >
                    <Box sx={{ width: '100%', height: { xs: 40, sm: 50 }, bgcolor: '#000', mb: 3 }} />
                    <Box sx={{ display: 'flex', width: '90%', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flex: 1, height: 40, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: 1, display: 'flex', alignItems: 'center', px: 2 }}>
                            <Box sx={{ width: '100%', height: 4, background: 'repeating-linear-gradient(90deg, #ccc, #ccc 15px, transparent 15px, transparent 25px)' }} />
                        </Box>
                        <Box sx={{
                            bgcolor: '#fff',
                            color: '#000',
                            px: 2,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            fontWeight: 700,
                            borderRadius: 1,
                            minWidth: 60,
                            justifyContent: 'center',
                            fontFamily: 'monospace'
                        }}>
                            {card.cvv}
                        </Box>
                    </Box>
                    <Box sx={{ width: '90%', mt: 4, textAlign: 'left' }}>
                        <Typography variant="caption" sx={{ fontSize: '0.6rem', opacity: 0.6, lineHeight: 1.2 }}>
                            This card is property of Aadhya Bank. If found, please return to any branch or call our 24/7 helpline at +1 800 123 4567.
                            Unauthorized use is strictly prohibited. Use of this card is subject to the Bank's Terms and Conditions.
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};
