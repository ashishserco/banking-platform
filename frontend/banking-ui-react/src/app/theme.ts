import { createTheme, ThemeOptions } from '@mui/material/styles';

/**
 * Enterprise Banking Portal Theme
 * Professional color palette inspired by real banking applications
 */
const themeOptions: ThemeOptions = {
    palette: {
        mode: 'light',
        primary: {
            main: '#97144d', // Aadhya Bank Maroon
            light: '#c24679',
            dark: '#6d0025',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#00897B', // Teal accent
            light: '#4DB6AC',
            dark: '#00695C',
            contrastText: '#FFFFFF',
        },
        success: {
            main: '#2E7D32',
            light: '#66BB6A',
            dark: '#1B5E20',
        },
        error: {
            main: '#C62828',
            light: '#EF5350',
            dark: '#B71C1C',
        },
        warning: {
            main: '#F57C00',
            light: '#FFB74D',
            dark: '#E65100',
        },
        info: {
            main: '#0288D1',
            light: '#4FC3F7',
            dark: '#01579B',
        },
        background: {
            default: '#F5F7FA',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#212121',
            secondary: '#757575',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: '2.5rem',
            fontWeight: 600,
            lineHeight: 1.2,
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 600,
            lineHeight: 1.3,
        },
        h3: {
            fontSize: '1.75rem',
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 600,
            lineHeight: 1.4,
        },
        h5: {
            fontSize: '1.25rem',
            fontWeight: 600,
            lineHeight: 1.5,
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.6,
        },
        button: {
            textTransform: 'none',
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 8,
    },
    shadows: [
        'none',
        '0px 2px 4px rgba(0,0,0,0.05)',
        '0px 4px 8px rgba(0,0,0,0.08)',
        '0px 6px 12px rgba(0,0,0,0.1)',
        '0px 8px 16px rgba(0,0,0,0.12)',
        '0px 10px 20px rgba(0,0,0,0.14)',
        '0px 12px 24px rgba(0,0,0,0.16)',
        '0px 14px 28px rgba(0,0,0,0.18)',
        '0px 16px 32px rgba(0,0,0,0.2)',
        '0px 18px 36px rgba(0,0,0,0.22)',
        '0px 20px 40px rgba(0,0,0,0.24)',
        '0px 22px 44px rgba(0,0,0,0.26)',
        '0px 24px 48px rgba(0,0,0,0.28)',
        '0px 26px 52px rgba(0,0,0,0.3)',
        '0px 28px 56px rgba(0,0,0,0.32)',
        '0px 30px 60px rgba(0,0,0,0.34)',
        '0px 32px 64px rgba(0,0,0,0.36)',
        '0px 34px 68px rgba(0,0,0,0.38)',
        '0px 36px 72px rgba(0,0,0,0.4)',
        '0px 38px 76px rgba(0,0,0,0.42)',
        '0px 40px 80px rgba(0,0,0,0.44)',
        '0px 42px 84px rgba(0,0,0,0.46)',
        '0px 44px 88px rgba(0,0,0,0.48)',
        '0px 46px 92px rgba(0,0,0,0.5)',
        '0px 48px 96px rgba(0,0,0,0.52)',
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '10px 24px',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0px 4px 8px rgba(0,0,0,0.15)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
                elevation1: {
                    boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontWeight: 500,
                },
            },
        },
    },
};

export const theme = createTheme(themeOptions);
