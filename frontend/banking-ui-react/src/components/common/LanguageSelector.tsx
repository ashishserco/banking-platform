import React from 'react';
import { Box, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Language as LanguageIcon } from '@mui/icons-material';

export const LanguageSelector: React.FC = () => {
    const { i18n } = useTranslation();

    const handleChange = (event: SelectChangeEvent) => {
        i18n.changeLanguage(event.target.value);
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LanguageIcon sx={{ fontSize: '1.2rem', color: 'text.secondary' }} />
            <Select
                value={i18n.language.split('-')[0]} // Handle cases like 'en-US'
                onChange={handleChange}
                size="small"
                variant="standard"
                disableUnderline
                sx={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'text.primary',
                    '& .MuiSelect-select': {
                        py: 0.5,
                        pr: '24px !important'
                    }
                }}
            >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="hi">हिंदी</MenuItem>
            </Select>
        </Box>
    );
};
