import React from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Box,
    Chip,
    Stack,
    Alert,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface AlertItem {
    id: string;
    type: 'warning' | 'info' | 'success';
    title: string;
    message: string;
    date: string;
}

const mockAlerts: AlertItem[] = [
    {
        id: '1',
        type: 'warning',
        title: 'Unusual Activity Detected',
        message: 'We noticed a large transaction of $5,000 from your savings account. If this wasn\'t you, please contact us immediately.',
        date: '2 hours ago',
    },
    {
        id: '2',
        type: 'info',
        title: 'New Feature Available',
        message: 'You can now schedule recurring payments directly from the payments page. Try it out!',
        date: '1 day ago',
    },
    {
        id: '3',
        type: 'success',
        title: 'Payment Successful',
        message: 'Your scheduled payment of $150 to Electric Company was processed successfully.',
        date: '2 days ago',
    },
];

export const AlertsAccordion: React.FC = () => {
    const [expanded, setExpanded] = React.useState<string | false>('alert-0');

    const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'warning':
                return <WarningIcon sx={{ color: 'warning.main' }} />;
            case 'info':
                return <InfoIcon sx={{ color: 'info.main' }} />;
            case 'success':
                return <CheckCircleIcon sx={{ color: 'success.main' }} />;
            default:
                return <InfoIcon />;
        }
    };

    const getAlertColor = (type: string) => {
        switch (type) {
            case 'warning':
                return 'warning';
            case 'info':
                return 'info';
            case 'success':
                return 'success';
            default:
                return 'default';
        }
    };

    return (
        <Box>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Alerts & Notifications
            </Typography>
            {mockAlerts.map((alert, index) => (
                <Accordion
                    key={alert.id}
                    expanded={expanded === `alert-${index}`}
                    onChange={handleChange(`alert-${index}`)}
                    elevation={0}
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        mb: 1,
                        '&:before': { display: 'none' },
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                            '&:hover': {
                                bgcolor: 'action.hover',
                            },
                        }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                            {getAlertIcon(alert.type)}
                            <Box sx={{ flex: 1 }}>
                                <Typography fontWeight={600}>{alert.title}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {alert.date}
                                </Typography>
                            </Box>
                            <Chip
                                label={alert.type.toUpperCase()}
                                size="small"
                                color={getAlertColor(alert.type) as any}
                            />
                        </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Alert severity={alert.type as any} sx={{ border: 'none' }}>
                            {alert.message}
                        </Alert>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};
