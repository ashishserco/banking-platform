import React from 'react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';

// Mock data for balance trend
const balanceTrendData = [
    { month: 'Jan', balance: 95000 },
    { month: 'Feb', balance: 102000 },
    { month: 'Mar', balance: 98000 },
    { month: 'Apr', balance: 110000 },
    { month: 'May', balance: 115000 },
    { month: 'Jun', balance: 125750 },
];

// Mock data for spending by category
const spendingData = [
    { category: 'Shopping', amount: 3500, color: '#1565C0' },
    { category: 'Food & Dining', amount: 2800, color: '#00897B' },
    { category: 'Utilities', amount: 1500, color: '#F57C00' },
    { category: 'Entertainment', amount: 1200, color: '#C62828' },
    { category: 'Transport', amount: 800, color: '#0288D1' },
];

// Mock data for monthly transactions
const monthlyTransactionsData = [
    { month: 'Jan', deposits: 15, withdrawals: 8, transfers: 12 },
    { month: 'Feb', deposits: 18, withdrawals: 10, transfers: 15 },
    { month: 'Mar', deposits: 12, withdrawals: 7, transfers: 10 },
    { month: 'Apr', deposits: 20, withdrawals: 12, transfers: 18 },
    { month: 'May', deposits: 22, withdrawals: 14, transfers: 20 },
    { month: 'Jun', deposits: 24, withdrawals: 11, transfers: 19 },
];

export const BalanceTrendChart: React.FC = () => {
    const theme = useTheme();

    return (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                    Balance Trend (Last 6 Months)
                </Typography>
                <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                    <ResponsiveContainer>
                        <AreaChart data={balanceTrendData}>
                            <defs>
                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                            <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                            <YAxis stroke={theme.palette.text.secondary} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 8,
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="balance"
                                stroke={theme.palette.primary.main}
                                fillOpacity={1}
                                fill="url(#colorBalance)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
};

export const SpendingChart: React.FC = () => {
    const theme = useTheme();

    return (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                    Spending by Category
                </Typography>
                <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={spendingData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(props: any) =>
                                    `${props.category} ${(props.percent * 100).toFixed(0)}%`
                                }
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="amount"
                            >
                                {spendingData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 8,
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
};

export const MonthlyTransactionsChart: React.FC = () => {
    const theme = useTheme();

    return (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                    Monthly Transaction Activity
                </Typography>
                <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                    <ResponsiveContainer>
                        <BarChart data={monthlyTransactionsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                            <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                            <YAxis stroke={theme.palette.text.secondary} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 8,
                                }}
                            />
                            <Legend />
                            <Bar dataKey="deposits" fill={theme.palette.success.main} />
                            <Bar dataKey="withdrawals" fill={theme.palette.error.main} />
                            <Bar dataKey="transfers" fill={theme.palette.info.main} />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
};
