import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import {
    Inbox as InboxIcon,
    SearchOff as SearchOffIcon,
    ErrorOutline as ErrorIcon,
} from '@mui/icons-material';

interface EmptyStateProps {
    icon?: 'inbox' | 'search' | 'error';
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon = 'inbox',
    title,
    description,
    actionLabel,
    onAction,
}) => {
    const IconComponent = {
        inbox: InboxIcon,
        search: SearchOffIcon,
        error: ErrorIcon,
    }[icon];

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                px: 3,
                textAlign: 'center',
            }}
        >
            <IconComponent
                sx={{
                    fontSize: 80,
                    color: 'text.disabled',
                    mb: 2,
                }}
            />
            <Typography variant="h6" fontWeight={600} gutterBottom>
                {title}
            </Typography>
            {description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                    {description}
                </Typography>
            )}
            {actionLabel && onAction && (
                <Button variant="contained" onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </Box>
    );
};
