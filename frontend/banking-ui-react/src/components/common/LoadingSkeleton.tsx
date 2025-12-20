import React from 'react';
import { Box, Skeleton, Card, CardContent, Stack } from '@mui/material';

export const DashboardSkeleton: React.FC = () => (
    <Box>
        {/* Banner Skeleton */}
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 3 }} />

        {/* KPI Cards Skeleton */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 3 }}>
            {[1, 2, 3, 4].map((i) => (
                <Box key={i} sx={{ flex: 1 }}>
                    <Card>
                        <CardContent>
                            <Skeleton variant="text" width="60%" />
                            <Skeleton variant="text" width="80%" height={40} />
                            <Skeleton variant="text" width="40%" />
                        </CardContent>
                    </Card>
                </Box>
            ))}
        </Stack>

        {/* Content Skeleton */}
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
            <Box sx={{ flex: 2 }}>
                <Card>
                    <CardContent>
                        <Skeleton variant="text" width="30%" height={30} sx={{ mb: 2 }} />
                        <Skeleton variant="rectangular" height={200} />
                    </CardContent>
                </Card>
            </Box>
            <Box sx={{ flex: 1 }}>
                <Card>
                    <CardContent>
                        <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
                        {[1, 2, 3].map((i) => (
                            <Box key={i} sx={{ mb: 2 }}>
                                <Skeleton variant="circular" width={40} height={40} sx={{ display: 'inline-block', mr: 2 }} />
                                <Skeleton variant="text" width="60%" sx={{ display: 'inline-block' }} />
                            </Box>
                        ))}
                    </CardContent>
                </Card>
            </Box>
        </Stack>
    </Box>
);

export const TableSkeleton: React.FC = () => (
    <Box>
        {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rectangular" height={50} sx={{ mb: 1 }} />
        ))}
    </Box>
);

export const CardSkeleton: React.FC = () => (
    <Card>
        <CardContent>
            <Skeleton variant="text" width="60%" height={30} />
            <Skeleton variant="text" width="100%" />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
        </CardContent>
    </Card>
);
