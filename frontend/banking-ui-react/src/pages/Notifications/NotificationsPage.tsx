import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Paper, Button, Divider } from '@mui/material';
import { Security, Payment, Info, DeleteOutline } from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { clearAll } from '@/store/slices/notificationSlice';

export const NotificationsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const notifications = useAppSelector(state => state.notifications.list);

    const getIcon = (type: string) => {
        switch (type) {
            case 'credit': return <Payment />;
            case 'debit': return <Payment />;
            case 'security': return <Security />;
            default: return <Info />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'credit': return 'success.main';
            case 'debit': return 'error.main';
            case 'security': return 'error.main';
            default: return 'info.main';
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight={700}>
                    Notifications
                </Typography>
                <Button
                    color="error"
                    startIcon={<DeleteOutline />}
                    onClick={() => dispatch(clearAll())}
                    disabled={notifications.length === 0}
                >
                    Clear All
                </Button>
            </Box>

            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                {notifications.length === 0 ? (
                    <Box sx={{ p: 8, textAlign: 'center' }}>
                        <Typography color="text.secondary">No new notifications.</Typography>
                    </Box>
                ) : (
                    <List sx={{ p: 0 }}>
                        {notifications.map((note, index) => (
                            <React.Fragment key={note.id}>
                                <ListItem
                                    alignItems="flex-start"
                                    secondaryAction={
                                        <Typography variant="caption" color="text.secondary">{note.time}</Typography>
                                    }
                                    sx={{
                                        py: 2,
                                        '&:hover': { bgcolor: 'action.hover' },
                                        cursor: 'pointer'
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: getColor(note.type) }}>
                                            {getIcon(note.type)}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                {note.title}
                                            </Typography>
                                        }
                                        secondary={note.desc}
                                    />
                                </ListItem>
                                {index < notifications.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                )}
            </Paper>
        </Box>
    );
};
