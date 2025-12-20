import React from 'react';
import { Typography, Button, Paper } from '@mui/material';
import { ErrorOutline as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    title = 'Something went wrong',
    message = 'We encountered an error while loading this content. Please try again.',
    onRetry,
}) => {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 4,
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'error.light',
                bgcolor: 'error.50',
            }}
        >
            <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {message}
            </Typography>
            {onRetry && (
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<RefreshIcon />}
                    onClick={onRetry}
                >
                    Try Again
                </Button>
            )}
        </Paper>
    );
};
