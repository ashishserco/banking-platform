import React from 'react';
import { Box, Typography, Grid, Paper, IconButton, Avatar, Button, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Divider } from '@mui/material';
import { Add as AddIcon, MoreVert, Star, StarBorder } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { addBeneficiary, toggleFavorite } from '@/store/slices/beneficiarySlice';

export const BeneficiariesPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const list = useAppSelector((state) => state.beneficiaries.list);
    const [open, setOpen] = React.useState(false);
    const [newPayee, setNewPayee] = React.useState({ name: '', acc: '', bank: '' });

    const [detailPayee, setDetailPayee] = React.useState<any>(null);

    const handleAdd = () => {
        if (newPayee.name && newPayee.acc) {
            dispatch(addBeneficiary(newPayee));
            setOpen(false);
            setNewPayee({ name: '', acc: '', bank: '' });
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight={700}>
                    Manage Beneficiaries
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                    Add New Payee
                </Button>
            </Box>

            <Grid container spacing={3}>
                {list.map((person) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={person.id}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                        >
                            <Avatar sx={{ bgcolor: 'secondary.light' }}>{person.name.charAt(0)}</Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle1" fontWeight={600}>{person.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{person.bank}</Typography>
                                <Typography variant="caption" color="text.secondary">{person.acc}</Typography>
                            </Box>
                            <Stack>
                                <IconButton
                                    size="small"
                                    color={person.favorite ? 'warning' : 'default'}
                                    onClick={() => dispatch(toggleFavorite(person.id))}
                                >
                                    {person.favorite ? <Star /> : <StarBorder />}
                                </IconButton>
                                <IconButton size="small" onClick={() => setDetailPayee(person)}>
                                    <MoreVert />
                                </IconButton>
                            </Stack>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* Beneficiary Details Dialog */}
            <Dialog open={!!detailPayee} onClose={() => setDetailPayee(null)} fullWidth maxWidth="xs">
                <DialogTitle>Beneficiary Details</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={3} sx={{ py: 1 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 1, bgcolor: 'secondary.main', fontSize: '1.5rem' }}>
                                {detailPayee?.name?.charAt(0)}
                            </Avatar>
                            <Typography variant="h6">{detailPayee?.name}</Typography>
                            <Typography variant="body2" color="text.secondary">Added on Dec 15, 2025</Typography>
                        </Box>
                        <Divider />
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">Account Number</Typography>
                            <Typography variant="body1" fontWeight={500}>{detailPayee?.acc}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">Bank Name</Typography>
                            <Typography variant="body1" fontWeight={500}>{detailPayee?.bank}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary" display="block">Branch</Typography>
                            <Typography variant="body1" fontWeight={500}>Downtime Manhattan, NY</Typography>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailPayee(null)}>Close</Button>
                    <Button variant="contained">Transfer Money</Button>
                </DialogActions>
            </Dialog>

            {/* Add Beneficiary Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Add New Beneficiary</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="Payee Name"
                            fullWidth
                            value={newPayee.name}
                            onChange={(e) => setNewPayee({ ...newPayee, name: e.target.value })}
                        />
                        <TextField
                            label="Account Number"
                            fullWidth
                            value={newPayee.acc}
                            onChange={(e) => setNewPayee({ ...newPayee, acc: e.target.value })}
                        />
                        <TextField
                            label="Bank Name"
                            fullWidth
                            value={newPayee.bank}
                            onChange={(e) => setNewPayee({ ...newPayee, bank: e.target.value })}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAdd}>Add Payee</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
