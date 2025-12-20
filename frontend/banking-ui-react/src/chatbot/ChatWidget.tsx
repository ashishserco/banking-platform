import React, { useState } from 'react';
import {
    Box,
    Paper,
    IconButton,
    TextField,
    Typography,
    Fade,
    Badge,
} from '@mui/material';
import {
    Chat as ChatIcon,
    Close as CloseIcon,
    Minimize as MinimizeIcon,
    Send as SendIcon,
} from '@mui/icons-material';
import { ChatMessage, ChatState, QuickReply } from './types';
import { chatService } from './ChatService';
import { ConversationUI } from './ConversationUI';
import { v4 as uuidv4 } from 'uuid';

export const ChatWidget: React.FC = () => {
    const [chatState, setChatState] = useState<ChatState>({
        isOpen: false,
        isMinimized: false,
        messages: [],
        isTyping: false,
    });
    const [inputMessage, setInputMessage] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);

    // Initialize chat with greeting
    React.useEffect(() => {
        if (chatState.isOpen && chatState.messages.length === 0) {
            const greeting = chatService.getGreeting();
            setChatState((prev) => ({
                ...prev,
                messages: [greeting],
            }));
        }
    }, [chatState.isOpen, chatState.messages.length]);

    const handleToggleChat = () => {
        setChatState((prev) => ({
            ...prev,
            isOpen: !prev.isOpen,
            isMinimized: false,
        }));
        if (!chatState.isOpen) {
            setUnreadCount(0);
        }
    };

    const handleMinimize = () => {
        setChatState((prev) => ({
            ...prev,
            isMinimized: !prev.isMinimized,
        }));
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage: ChatMessage = {
            id: uuidv4(),
            text: inputMessage,
            sender: 'user',
            timestamp: new Date(),
        };

        setChatState((prev) => ({
            ...prev,
            messages: [...prev.messages, userMessage],
            isTyping: true,
        }));

        setInputMessage('');

        // Get bot response
        try {
            const botResponse = await chatService.processMessage(inputMessage);
            setChatState((prev) => ({
                ...prev,
                messages: [...prev.messages, botResponse],
                isTyping: false,
            }));

            // Increment unread if minimized
            if (chatState.isMinimized) {
                setUnreadCount((prev) => prev + 1);
            }
        } catch (error) {
            setChatState((prev) => ({
                ...prev,
                isTyping: false,
            }));
        }
    };

    const handleQuickReply = async (reply: QuickReply) => {
        const userMessage: ChatMessage = {
            id: uuidv4(),
            text: reply.text,
            sender: 'user',
            timestamp: new Date(),
        };

        setChatState((prev) => ({
            ...prev,
            messages: [...prev.messages, userMessage],
            isTyping: true,
        }));

        // Get bot response based on action
        try {
            const botResponse = await chatService.processMessage(reply.action);
            setChatState((prev) => ({
                ...prev,
                messages: [...prev.messages, botResponse],
                isTyping: false,
            }));
        } catch (error) {
            setChatState((prev) => ({
                ...prev,
                isTyping: false,
            }));
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Chat Window */}
            <Fade in={chatState.isOpen}>
                <Paper
                    elevation={8}
                    sx={{
                        position: 'fixed',
                        bottom: chatState.isMinimized ? -400 : 100,
                        right: 24,
                        width: 380,
                        height: 500,
                        display: chatState.isOpen ? 'flex' : 'none',
                        flexDirection: 'column',
                        borderRadius: 3,
                        overflow: 'hidden',
                        zIndex: 1300,
                        transition: 'bottom 0.3s ease-in-out',
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ChatIcon />
                            <Box>
                                <Typography variant="subtitle1" fontWeight={600}>
                                    Aadhya Assistant
                                </Typography>
                                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                    Online • Typically replies instantly
                                </Typography>
                            </Box>
                        </Box>
                        <Box>
                            <IconButton size="small" onClick={handleMinimize} sx={{ color: 'white' }}>
                                <MinimizeIcon />
                            </IconButton>
                            <IconButton size="small" onClick={handleToggleChat} sx={{ color: 'white' }}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Messages */}
                    <ConversationUI
                        messages={chatState.messages}
                        isTyping={chatState.isTyping}
                        onQuickReply={handleQuickReply}
                    />

                    {/* Input */}
                    <Box
                        sx={{
                            p: 2,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                        }}
                    >
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Type your message..."
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                multiline
                                maxRows={3}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3,
                                    },
                                }}
                            />
                            <IconButton
                                color="primary"
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim()}
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                    },
                                    '&:disabled': {
                                        bgcolor: 'grey.300',
                                    },
                                }}
                            >
                                <SendIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </Paper>
            </Fade>

            {/* Floating Chat Button */}
            <Fade in={!chatState.isOpen}>
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 1300,
                        display: chatState.isOpen ? 'none' : 'block',
                    }}
                >
                    <IconButton
                        onClick={handleToggleChat}
                        sx={{
                            width: 64,
                            height: 64,
                            bgcolor: 'primary.main',
                            color: 'white',
                            boxShadow: 4,
                            '&:hover': {
                                bgcolor: 'primary.dark',
                                boxShadow: 8,
                            },
                        }}
                    >
                        <Badge badgeContent={unreadCount} color="error">
                            <ChatIcon sx={{ fontSize: 32 }} />
                        </Badge>
                    </IconButton>
                </Box>
            </Fade>
        </>
    );
};
