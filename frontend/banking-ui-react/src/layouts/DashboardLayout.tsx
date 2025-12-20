import React from 'react';
import { Box, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { ChatWidget } from '@/chatbot/ChatWidget';

export const DashboardLayout: React.FC = () => {
    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'background.default' }}>
            <Header />
            <Sidebar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - 260px)` },
                    height: '100%',
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Toolbar /> {/* Spacer for fixed header */}
                <Toolbar /> {/* Extra spacer for Top Bar */}
                <Box sx={{ flexGrow: 1 }}>
                    <Outlet />
                </Box>
                <Footer />
            </Box>
            {/* AI Chatbot Widget - Available on all pages */}
            <ChatWidget />
        </Box>
    );
};
