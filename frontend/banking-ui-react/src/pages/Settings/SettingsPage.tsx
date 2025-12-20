import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, ListItemSecondaryAction, Switch, Divider, Button, ListItemIcon } from '@mui/material';
import { Notifications, Security, Language, Visibility, DarkMode } from '@mui/icons-material';

export const SettingsPage: React.FC = () => {
    return (
        <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
                Settings
            </Typography>

            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', maxWidth: 800 }}>
                <List sx={{ py: 0 }}>
                    <ListItem sx={{ py: 2 }}>
                        <ListItemIcon>
                            <Notifications color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Push Notifications"
                            secondary="Receive alerts for transactions and messages"
                        />
                        <ListItemSecondaryAction>
                            <Switch defaultChecked />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />

                    <ListItem sx={{ py: 2 }}>
                        <ListItemIcon>
                            <Security color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Two-Factor Authentication"
                            secondary="Add an extra layer of security to your account"
                        />
                        <ListItemSecondaryAction>
                            <Switch />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />

                    <ListItem sx={{ py: 2 }}>
                        <ListItemIcon>
                            <DarkMode color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Dark Mode"
                            secondary="Toggle between light and dark theme"
                        />
                        <ListItemSecondaryAction>
                            <Switch />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />

                    <ListItem sx={{ py: 2 }}>
                        <ListItemIcon>
                            <Language color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Language"
                            secondary="English (US)"
                        />
                        <Button variant="outlined" size="small">Change</Button>
                    </ListItem>
                    <Divider />

                    <ListItem sx={{ py: 2 }}>
                        <ListItemIcon>
                            <Visibility color="primary" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Privacy Settings"
                            secondary="Manage how your data is used and shared"
                        />
                        <Button variant="outlined" size="small">Manage</Button>
                    </ListItem>
                </List>
            </Paper>

            <Box sx={{ mt: 4 }}>
                <Button variant="contained" color="error">
                    Deactivate Account
                </Button>
            </Box>
        </Box>
    );
};
