import React from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Avatar, Divider } from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import { useAppDispatch } from '@/hooks/useRedux';
import { setUser } from '@/store/slices/authSlice';
import { STORAGE_KEYS } from '@/utils/constants';

export const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const dispatch = useAppDispatch();
    const [isEditing, setIsEditing] = React.useState(false);
    const [formData, setFormData] = React.useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: '+1 (555) 123-4567',
        address: '123 Banking Street, Finance District, NY 10001'
    });

    const handleSave = () => {
        if (isEditing) {
            const updatedUser = { ...user, firstName: formData.firstName, lastName: formData.lastName } as any;
            dispatch(setUser(updatedUser));
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        }
        setIsEditing(!isEditing);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
                My Profile
            </Typography>
            <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Avatar
                        sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: '2.5rem', mr: 3 }}
                    >
                        {user?.firstName?.charAt(0) || 'U'}
                    </Avatar>
                    <Box>
                        <Typography variant="h5" fontWeight={600}>
                            {user?.firstName} {user?.lastName}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {user?.email}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'success.main', fontWeight: 600 }}>
                            Verified Customer
                        </Typography>
                    </Box>
                    <Box sx={{ ml: 'auto' }}>
                        <Button
                            variant={isEditing ? "contained" : "outlined"}
                            startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                            onClick={handleSave}
                        >
                            {isEditing ? 'Save Changes' : 'Edit Profile'}
                        </Button>
                    </Box>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            name="firstName"
                            label="First Name"
                            value={formData.firstName}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            name="lastName"
                            label="Last Name"
                            value={formData.lastName}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            value={user?.email}
                            disabled={true}
                            helperText="Contact support to change email"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            name="phone"
                            label="Phone Number"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            name="address"
                            label="Address"
                            value={formData.address}
                            onChange={handleChange}
                            disabled={!isEditing}
                            multiline
                            rows={2}
                        />
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};
