import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';
import { Footer } from './Footer';
import { ChatWidget } from '@/chatbot/ChatWidget';

export const PublicLayout: React.FC = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
            <PublicHeader />
            <Box component="main" sx={{ flexGrow: 1 }}>
                <Outlet />
            </Box>
            <Footer />
            <ChatWidget />
        </Box>
    );
};
