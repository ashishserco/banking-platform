import React from 'react';
import { Box, Paper, Typography, Avatar, Chip, Stack } from '@mui/material';
import { SmartToy as BotIcon, Person as PersonIcon } from '@mui/icons-material';
import { ChatMessage, QuickReply } from './types';
import { formatDateTime } from '@/utils/formatters';

interface ConversationUIProps {
    messages: ChatMessage[];
    isTyping: boolean;
    onQuickReply: (reply: QuickReply) => void;
}

export const ConversationUI: React.FC<ConversationUIProps> = ({
    messages,
    isTyping,
    onQuickReply,
}) => {
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    return (
        <Box
            sx={{
                flex: 1,
                overflowY: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
            }}
        >
            {messages.map((message) => (
                <Box key={message.id}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                            gap: 1,
                            mb: 1,
                        }}
                    >
                        {message.sender === 'bot' && (
                            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                                <BotIcon sx={{ fontSize: 20 }} />
                            </Avatar>
                        )}

                        <Paper
                            elevation={0}
                            sx={{
                                maxWidth: '75%',
                                p: 1.5,
                                bgcolor: message.sender === 'user' ? 'primary.main' : 'grey.100',
                                color: message.sender === 'user' ? 'white' : 'text.primary',
                                borderRadius: 2,
                                borderTopLeftRadius: message.sender === 'bot' ? 0 : 2,
                                borderTopRightRadius: message.sender === 'user' ? 0 : 2,
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                }}
                            >
                                {message.text}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'block',
                                    mt: 0.5,
                                    opacity: 0.7,
                                    fontSize: '0.7rem',
                                }}
                            >
                                {formatDateTime(message.timestamp.toISOString())}
                            </Typography>
                        </Paper>

                        {message.sender === 'user' && (
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                                <PersonIcon sx={{ fontSize: 20 }} />
                            </Avatar>
                        )}
                    </Box>

                    {/* Quick Replies */}
                    {message.sender === 'bot' && message.quickReplies && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: 5 }}>
                            {message.quickReplies.map((reply) => (
                                <Chip
                                    key={reply.id}
                                    label={reply.text}
                                    onClick={() => onQuickReply(reply)}
                                    size="small"
                                    sx={{
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: 'primary.light',
                                            color: 'white',
                                        },
                                    }}
                                />
                            ))}
                        </Box>
                    )}
                </Box>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                        <BotIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 1.5,
                            bgcolor: 'grey.100',
                            borderRadius: 2,
                            borderTopLeftRadius: 0,
                        }}
                    >
                        <Stack direction="row" spacing={0.5}>
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: 'grey.400',
                                    animation: 'typing 1.4s infinite',
                                    '@keyframes typing': {
                                        '0%, 60%, 100%': { transform: 'translateY(0)' },
                                        '30%': { transform: 'translateY(-10px)' },
                                    },
                                }}
                            />
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: 'grey.400',
                                    animation: 'typing 1.4s infinite 0.2s',
                                    '@keyframes typing': {
                                        '0%, 60%, 100%': { transform: 'translateY(0)' },
                                        '30%': { transform: 'translateY(-10px)' },
                                    },
                                }}
                            />
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: 'grey.400',
                                    animation: 'typing 1.4s infinite 0.4s',
                                    '@keyframes typing': {
                                        '0%, 60%, 100%': { transform: 'translateY(0)' },
                                        '30%': { transform: 'translateY(-10px)' },
                                    },
                                }}
                            />
                        </Stack>
                    </Paper>
                </Box>
            )}

            <div ref={messagesEndRef} />
        </Box>
    );
};
