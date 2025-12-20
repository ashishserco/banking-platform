import React from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    InputBase,
    IconButton,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Stack,
    Button,
    Chip,
    useTheme,
    alpha
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
    Search,
    ArrowForward,
    AccountBalance,
    CreditCard,
    CurrencyExchange,
    Business,
    Flight,
    Agriculture,
    CardGiftcard,
    School,
    Smartphone,
    ReceiptLong,
    Send,
    Security,
    AccountBalanceWallet,
    TrendingUp,
    HealthAndSafety
} from '@mui/icons-material';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from 'react-router-dom';

// Assets (Assuming these are where the generated images will be placed/referenced)
import heroFamily from '@/assets/banking_lifestyle_family.png';
import heroProfessional from '@/assets/banking_digital_professional.png';
import businessImage from '@/assets/banking_business_meeting.png';
import cardsImage from '@/assets/credit_cards_premium.png';





export const LandingPage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const quickActions = [
        { title: t('dashboard.sendMoney'), icon: <Send /> },
        { title: t('dashboard.payBills'), icon: <ReceiptLong /> },
        { title: t('nav.bankSmart'), icon: <Smartphone /> },
        { title: t('landing.hero.openAccount'), icon: <AccountBalance /> },
        { title: t('nav.investments'), icon: <CurrencyExchange /> },
    ];

    const segments = [
        { title: t('landing.segments.personal.title'), icon: <AccountBalance />, desc: t('landing.segments.personal.desc') },
        { title: t('landing.segments.business.title'), icon: <Business />, desc: t('landing.segments.business.desc') },
        { title: t('landing.segments.nri.title'), icon: <Flight />, desc: t('landing.segments.nri.desc') },
        { title: t('landing.segments.agri.title'), icon: <Agriculture />, desc: t('landing.segments.agri.desc') },
        { title: t('landing.segments.startups.title'), icon: <CardGiftcard />, desc: t('landing.segments.startups.desc') },
        { title: t('landing.segments.wealth.title'), icon: <Security />, desc: t('landing.segments.wealth.desc') },
    ];

    const spotlightProducts = [
        {
            title: t('landing.spotlight.items.cards.title'),
            desc: t('landing.spotlight.items.cards.desc'),
            image: cardsImage,
            tag: t('landing.spotlight.items.cards.tag')
        },
        {
            title: t('landing.spotlight.items.loans.title'),
            desc: t('landing.spotlight.items.loans.desc'),
            image: heroFamily,
            tag: t('landing.spotlight.items.loans.tag')
        },
        {
            title: t('landing.spotlight.items.business.title'),
            desc: t('landing.spotlight.items.business.desc'),
            image: businessImage,
            tag: t('landing.spotlight.items.business.tag')
        },
    ];

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
    };

    return (
        <Box sx={{ overflowX: 'hidden' }}>
            {/* Hero Carousel Section */}
            <Box sx={{ position: 'relative', bgcolor: 'primary.dark' }}>
                <Slider {...sliderSettings}>
                    {/* Slide 1 */}
                    <Box sx={{ position: 'relative', height: { xs: 500, md: 600 } }}>
                        <Box
                            component="img"
                            src={heroFamily}
                            alt="Happy Family"
                            sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
                        />
                        <Container
                            maxWidth="lg"
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                color: 'white',
                                textAlign: { xs: 'center', md: 'left' }
                            }}
                        >
                            <Box sx={{ maxWidth: 600 }}>
                                <Typography variant="h2" fontWeight={800} gutterBottom sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                                    {t('landing.hero.slide1.title')}
                                </Typography>
                                <Typography variant="h5" sx={{ mb: 4, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                                    {t('landing.hero.slide1.subtitle')}
                                </Typography>
                                <Button variant="contained" color="secondary" size="large" sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }} onClick={() => navigate('/open-account')}>
                                    {t('common.getStarted')}
                                </Button>
                            </Box>
                        </Container>
                    </Box>
                    {/* Slide 2 */}
                    <Box sx={{ position: 'relative', height: { xs: 500, md: 600 } }}>
                        <Box
                            component="img"
                            src={heroProfessional}
                            alt="Digital Banking"
                            sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
                        />
                        <Container
                            maxWidth="lg"
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                color: 'white',
                                textAlign: { xs: 'center', md: 'left' }
                            }}
                        >
                            <Box sx={{ maxWidth: 600, ml: { md: 'auto' } }}>
                                <Typography variant="h2" fontWeight={800} gutterBottom sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                                    {t('landing.hero.slide2.title')}
                                </Typography>
                                <Typography variant="h5" sx={{ mb: 4, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                                    {t('landing.hero.slide2.subtitle')}
                                </Typography>
                                <Button variant="contained" color="secondary" size="large" sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }} onClick={() => navigate('/open-account')}>
                                    {t('common.exploreApp')}
                                </Button>
                            </Box>
                        </Container>
                    </Box>
                </Slider>

                {/* Search Bar Overlay - Keeping it accessible */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: { xs: -30, md: -40 },
                        left: 0,
                        right: 0,
                        zIndex: 10
                    }}
                >
                    <Container maxWidth="md">
                        <Paper
                            elevation={6}
                            component="form"
                            sx={{
                                p: '8px 16px',
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: 10,
                                height: { xs: 60, md: 80 }
                            }}
                        >
                            <InputBase
                                sx={{ ml: 2, flex: 1, fontSize: '1.1rem' }}
                                placeholder={t('landing.hero.searchPlaceholder')}
                            />
                            <IconButton type="button" sx={{ p: '10px', bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
                                <Search fontSize="large" />
                            </IconButton>
                        </Paper>
                    </Container>
                </Box>
            </Box>

            {/* Quick Actions Strip */}
            <Box sx={{ bgcolor: 'grey.50', pt: 10, pb: 4 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={2} justifyContent="center">
                        {quickActions.map((action) => (
                            <Grid key={action.title}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        width: 120,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': { transform: 'translateY(-4px)', color: 'primary.main', boxShadow: 2 },
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    <Box sx={{ color: 'primary.main', mb: 1 }}>{action.icon}</Box>
                                    <Typography variant="body2" fontWeight={600} align="center">{action.title}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Banking for Everyone (Segments) */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Typography variant="h6" color="primary" fontWeight={700} gutterBottom textTransform="uppercase" letterSpacing={1}>
                    {t('landing.segments.tagline')}
                </Typography>
                <Typography variant="h3" fontWeight={800} sx={{ mb: 6 }}>
                    {t('landing.segments.heading')}
                </Typography>

                <Grid container spacing={3}>
                    {segments.map((segment) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={segment.title}>
                            <Card
                                elevation={0}
                                sx={{
                                    height: '100%',
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    transition: 'all 0.3s',
                                    '&:hover': { borderColor: 'primary.main', boxShadow: 4 }
                                }}
                            >
                                <CardContent sx={{ p: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mr: 2 }}>
                                            {segment.icon}
                                        </Box>
                                        <Typography variant="h6" fontWeight={700}>
                                            {segment.title}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                                        {segment.desc}
                                    </Typography>
                                    <Button
                                        endIcon={<ArrowForward />}
                                        sx={{ p: 0, '&:hover': { bgcolor: 'transparent' } }}
                                        onClick={() => navigate(`/segment/${segment.title.toLowerCase().replace(/\s+/g, '')}`)} // Navigate to segment
                                    >
                                        {t('common.viewProducts')}
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Our Products - User Requested Section */}
            <Box sx={{ py: 8, bgcolor: 'background.default' }}>
                <Container maxWidth="lg">
                    <Typography variant="h4" fontWeight={800} gutterBottom align="center">
                        {t('landing.products.title')}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 6 }}>
                        {t('landing.products.subtitle')}
                    </Typography>

                    <Grid container spacing={3}>
                        {[
                            { title: t('nav.accounts'), icon: <AccountBalance fontSize="large" />, path: '/product/accounts', color: 'primary' },
                            { title: t('nav.deposits'), icon: <AccountBalanceWallet fontSize="large" />, path: '/product/deposits', color: 'success' },
                            { title: t('nav.cards'), icon: <CreditCard fontSize="large" />, path: '/product/cards', color: 'secondary' },
                            { title: t('nav.forex'), icon: <CurrencyExchange fontSize="large" />, path: '/product/forex', color: 'warning' },
                            { title: t('nav.loans'), icon: <AccountBalance fontSize="large" />, path: '/product/loans', color: 'error' },
                            { title: t('nav.investments'), icon: <TrendingUp fontSize="large" />, path: '/product/investments', color: 'success' },
                            { title: t('nav.insurance'), icon: <HealthAndSafety fontSize="large" />, path: '/product/insurance', color: 'info' },
                            { title: t('nav.payments'), icon: <ReceiptLong fontSize="large" />, path: '/product/payments', color: 'primary' },
                            { title: t('nav.offers'), icon: <CardGiftcard fontSize="large" />, path: '/product/offers', color: 'secondary' },
                            { title: t('nav.learning'), icon: <School fontSize="large" />, path: '/product/learning', color: 'info' },
                            { title: t('nav.bankSmart'), icon: <Smartphone fontSize="large" />, path: '/product/banksmart', color: 'primary' },
                        ].map((item) => (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.title}>
                                <Paper
                                    elevation={2}
                                    sx={{
                                        p: 3,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        height: '100%',
                                        cursor: 'pointer',
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-8px)',
                                            boxShadow: 6,
                                            '& .icon-box': {
                                                bgcolor: (theme) => {
                                                    const colorBranch = (theme.palette as any)[item.color];
                                                    return alpha(colorBranch?.main || theme.palette.primary.main, 0.2);
                                                }
                                            }
                                        }
                                    }}
                                    onClick={() => navigate(item.path)}
                                >
                                    <Box
                                        className="icon-box"
                                        sx={{
                                            p: 2.5,
                                            mb: 2,
                                            borderRadius: '50%',
                                            bgcolor: (theme) => {
                                                const colorBranch = (theme.palette as any)[item.color];
                                                return alpha(colorBranch?.main || theme.palette.primary.main, 0.1);
                                            },
                                            color: (theme) => {
                                                const colorBranch = (theme.palette as any)[item.color];
                                                return colorBranch?.main || theme.palette.primary.main;
                                            },
                                            transition: 'background-color 0.3s'
                                        }}
                                    >
                                        {item.icon}
                                    </Box>
                                    <Typography variant="h6" fontWeight={700} gutterBottom>
                                        {item.title}
                                    </Typography>
                                    <Button
                                        endIcon={<ArrowForward />}
                                        sx={{
                                            mt: 'auto',
                                            color: (theme) => {
                                                const colorBranch = (theme.palette as any)[item.color];
                                                return colorBranch?.main || theme.palette.primary.main;
                                            }
                                        }}
                                    >
                                        {t('common.explore')}
                                    </Button>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Featured Products */}
            <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 10 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography variant="h3" fontWeight={700} gutterBottom>
                                {t('landing.spotlight.title')}
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.7, mb: 4 }} paragraph>
                                {t('landing.spotlight.desc')}
                            </Typography>
                            <Button variant="outlined" color="inherit" size="large">
                                {t('common.viewAllOffers')}
                            </Button>
                        </Grid>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <Grid container spacing={3}>
                                {spotlightProducts.map((product) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.title}>
                                        <Card sx={{ height: '100%', borderRadius: 4, overflow: 'hidden' }}>
                                            <Box sx={{ position: 'relative', height: 160 }}>
                                                <CardMedia
                                                    component="img"
                                                    height="100%"
                                                    image={product.image}
                                                    alt={product.title}
                                                />
                                                <Chip
                                                    label={product.tag}
                                                    color="secondary"
                                                    size="small"
                                                    sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 700 }}
                                                />
                                            </Box>
                                            <CardContent>
                                                <Typography variant="h6" fontWeight={700} gutterBottom>
                                                    {product.title}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {product.desc}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Detailed Quick Links Footer-ish */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Grid container spacing={4}>
                    {[
                        { title: 'Accounts', items: ['Savings Account', 'Current Account', 'Salary Account'] },
                        { title: 'Cards', items: ['Credit Cards', 'Debit Cards', 'Prepaid Cards'] },
                        { title: 'Loans', items: ['Home Loan', 'Personal Loan', 'Car Loan', 'Education Loan'] },
                        { title: 'Investments', items: ['Fixed Deposits', 'Recurring Deposits', 'Mutual Funds'] },
                    ].map((section) => (
                        <Grid size={{ xs: 6, md: 3 }} key={section.title}>
                            <Typography variant="subtitle1" fontWeight={700} gutterBottom color="primary">
                                {section.title}
                            </Typography>
                            <Stack spacing={1}>
                                {section.items.map(item => (
                                    <Typography
                                        key={item}
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                                        onClick={() => navigate(`/product/${section.title.toLowerCase()}`)} // Navigate to category
                                    >
                                        {item}
                                    </Typography>
                                ))}
                            </Stack>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};
