# Enterprise Banking Portal - React UI

A production-grade, enterprise-level banking portal built with React, TypeScript, Material-UI, and Redux Toolkit. This application demonstrates professional software architecture patterns suitable for real-world banking systems.

## 🏦 Overview

This is a **complete, interview-ready** banking portal UI that showcases:
- Enterprise-grade architecture and code organization
- Real-world banking features (accounts, payments, transactions, beneficiaries)
- Production-ready patterns (idempotency, correlation IDs, error handling)
- Professional UI/UX matching real banking portals (ICICI, Citi, HDFC)
- Scalable state management and API integration

## 🚀 Technology Stack

### Core
- **React 19** - Modern UI library with hooks
- **TypeScript 5** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **Material-UI (MUI) 7** - Enterprise-grade component library

### State Management
- **Redux Toolkit** - Predictable state management
- **React Query (TanStack Query)** - Server state management and caching

### Routing & Forms
- **React Router 7** - Client-side routing
- **React Hook Form** - Performant form validation
- **Zod** - Schema validation

### API & Data
- **Axios** - HTTP client with interceptors
- **date-fns** - Modern date manipulation
- **uuid** - Unique ID generation

### Charts & Visualization
- **Recharts** - Composable charting library

## 📁 Project Structure

```
src/
├── app/                    # Application core
│   ├── App.tsx            # Main app component with routing
│   └── theme.ts           # Material-UI theme configuration
├── components/            # Reusable UI components
│   ├── common/           # Generic components (cards, tables, etc.)
│   └── forms/            # Form components
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Authentication hook
│   ├── useDebounce.ts    # Debounce hook
│   ├── useIdempotency.ts # Idempotency key management
│   └── useRedux.ts       # Typed Redux hooks
├── layouts/              # Layout components
│   ├── DashboardLayout.tsx
│   ├── Header.tsx
│   └── Sidebar.tsx
├── pages/                # Feature pages
│   ├── Auth/            # Login, register
│   ├── Dashboard/       # Dashboard with KPIs
│   ├── Accounts/        # Account management
│   ├── Payments/        # Payments & transfers
│   ├── Transactions/    # Transaction history
│   ├── Beneficiaries/   # Beneficiary management
│   ├── Notifications/   # Notification center
│   ├── Support/         # Customer support
│   └── Profile/         # User profile
├── services/            # API integration layer
│   └── api/
│       ├── client.ts           # Axios client with interceptors
│       ├── authService.ts      # Authentication APIs
│       ├── accountService.ts   # Account APIs
│       ├── transactionService.ts
│       ├── paymentService.ts
│       ├── notificationService.ts
│       ├── supportService.ts
│       └── dashboardService.ts
├── store/               # Redux store
│   ├── index.ts         # Store configuration
│   └── slices/
│       ├── authSlice.ts
│       └── uiSlice.ts
├── types/               # TypeScript type definitions
│   ├── account.types.ts
│   ├── transaction.types.ts
│   ├── payment.types.ts
│   ├── notification.types.ts
│   ├── support.types.ts
│   ├── auth.types.ts
│   ├── api.types.ts
│   └── index.ts
└── utils/               # Utility functions
    ├── constants.ts     # App constants
    ├── formatters.ts    # Currency, date formatters
    ├── validators.ts    # Form validators
    ├── errorHandler.ts  # Error handling
    └── idempotency.ts   # Idempotency utilities
```

## 🎯 Key Features

### 1. Dashboard
- **KPI Cards**: Total balance, active accounts, monthly transactions, pending payments
- **Account Overview**: List of all accounts with balances and status
- **Recent Transactions**: Latest transaction activity
- **Quick Actions**: Fast access to common operations
- **Real-time Updates**: Auto-refresh capabilities

### 2. Account Management
- View all accounts with balances
- Account details and statements
- Download statements (mock)
- Account-specific transaction history

### 3. Payments & Transfers
- **Internal Transfers**: Between own accounts
- **External Transfers**: To beneficiaries
- **Scheduled Payments**: Recurring payment setup
- **Payment Tracking**: Real-time status updates
- **Idempotency Protection**: Prevents duplicate submissions

### 4. Transaction History
- Advanced search and filtering
- Date range selection
- Transaction type and status filters
- Pagination with configurable page size
- Export functionality (mock)

### 5. Beneficiary Management
- Add/edit/delete beneficiaries
- Beneficiary validation
- Approval workflow (mock)
- Categorization (individual, merchant, utility)

### 6. Notifications
- Transaction alerts
- System notifications
- Filter by type and priority
- Mark as read/unread
- Notification preferences

### 7. Customer Support
- Create support tickets
- View ticket status
- Ticket timeline
- AI chat widget entry point

### 8. User Profile & Security
- Profile information
- Active sessions
- Role-based access display
- Security settings

## 🏗️ Architecture Decisions

### Why This Structure?

**Feature-Based Organization**: Each feature module is self-contained with its components, making it easy to locate and maintain code.

**Service Layer Pattern**: API calls are abstracted into service modules, making it easy to:
- Mock APIs during development
- Swap implementations
- Test business logic independently
- Maintain consistent error handling

**Type-Safe Development**: Comprehensive TypeScript types ensure:
- Compile-time error detection
- Better IDE autocomplete
- Self-documenting code
- Reduced runtime errors

**Redux Toolkit**: Chosen over Context API for:
- Better DevTools support
- Middleware for async operations
- Scalability for complex state
- Time-travel debugging

**Material-UI**: Selected for:
- Enterprise-grade components
- Professional default styling
- Excellent TypeScript support
- Comprehensive component library
- Better for data-heavy applications

### Idempotency & Duplicate Prevention

**Problem**: In banking, duplicate transactions can cause serious issues.

**Solution**: This UI implements idempotency protection:

1. **Idempotency Keys**: Generated on form mount using UUID
2. **Request Headers**: Keys sent with payment/transfer requests
3. **Button Disabling**: Submit button disabled after first click
4. **Loading States**: Clear visual feedback during processing
5. **Local Storage**: Track used keys to prevent resubmission

```typescript
// Example usage in payment form
const { idempotencyKey, regenerateKey } = useIdempotency();

const handleSubmit = async (data) => {
  await paymentService.processPayment({
    ...data,
    idempotencyKey,
  });
  regenerateKey(); // Generate new key for next submission
};
```

### Correlation ID Tracking

**Purpose**: Track requests across distributed services for debugging.

**Implementation**:
- Auto-generated UUID for each API request
- Included in `X-Correlation-ID` header
- Logged in development mode
- Displayed in error messages
- Stored in Redux for tracking

### Error Handling Strategy

**Three-Layer Approach**:

1. **API Layer**: Axios interceptors catch and normalize errors
2. **Service Layer**: Format errors for UI consumption
3. **UI Layer**: Display user-friendly error messages

```typescript
// Automatic token refresh on 401
if (error.response?.status === 401) {
  const newToken = await refreshToken();
  // Retry original request with new token
  return retryRequest(originalRequest, newToken);
}
```

## 🔌 Backend Integration

### API Mapping

This UI is designed to integrate with the following backend microservices:

| UI Module | Backend Service | Endpoints |
|-----------|----------------|-----------|
| Dashboard | AccountService | `/api/dashboard/stats` |
| Accounts | AccountService | `/api/accounts/*` |
| Payments | PaymentService | `/api/payments/*` |
| Transactions | TransactionService | `/api/transactions/*` |
| Beneficiaries | AccountService | `/api/beneficiaries/*` |
| Notifications | NotificationService | `/api/notifications/*` |
| Support | SupportService | `/api/support/*` |

### Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Enterprise Banking Portal
VITE_APP_VERSION=1.0.0
```

### API Client Features

- **Automatic Token Injection**: Auth tokens added to all requests
- **Token Refresh**: Automatic refresh on 401 errors
- **Correlation IDs**: Auto-generated for request tracking
- **Request Logging**: Development mode logging
- **Error Normalization**: Consistent error format

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend services running (optional for development)

### Installation

```bash
# Navigate to project directory
cd d:\aadhya-bank-app\frontend\banking-ui-react

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will start on `http://localhost:5173`

### Demo Login

Use these credentials to log in:
- **Email**: demo@banking.com
- **Password**: demo123

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🧪 Development

### Running with Mock Data

The application currently uses mock data for demonstration. To connect to real backend:

1. Start backend services
2. Update `.env` with correct API URL
3. Remove mock data from pages
4. Services will automatically connect to real APIs

### Adding New Features

1. **Create Types**: Define TypeScript interfaces in `src/types/`
2. **Create Service**: Add API methods in `src/services/api/`
3. **Create Components**: Build UI components in `src/components/`
4. **Create Page**: Assemble page in `src/pages/`
5. **Add Route**: Register route in `src/app/App.tsx`

### Code Style

- Use functional components with hooks
- Follow TypeScript strict mode
- Use Material-UI components
- Implement proper error handling
- Add loading states
- Include accessibility attributes

## 📊 Scalability

### How This Scales

**Code Splitting**: Routes are lazy-loaded for optimal performance

**State Management**: Redux Toolkit scales to complex applications

**Component Reusability**: Generic components reduce duplication

**Service Layer**: Easy to add new API endpoints

**Type Safety**: TypeScript prevents bugs at scale

**Modular Architecture**: Features are independent and testable

## 🎨 UI/UX Principles

### Professional Banking Design

- **Clean Layout**: Spacious, uncluttered interface
- **Consistent Colors**: Professional blue palette
- **Clear Typography**: Inter font for readability
- **Visual Hierarchy**: Important information stands out
- **Responsive Design**: Works on all screen sizes
- **Loading States**: Clear feedback during operations
- **Error Messages**: User-friendly error display

### Accessibility

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast compliance (WCAG AA)
- Focus management

## 🔒 Security Considerations

- **Token Storage**: Tokens in localStorage (consider httpOnly cookies for production)
- **Auto Logout**: On token expiration
- **HTTPS Only**: Enforce in production
- **Input Validation**: Client and server-side
- **XSS Protection**: React's built-in escaping
- **CSRF Protection**: Token-based authentication

## 📝 Interview Talking Points

When discussing this project in interviews, highlight:

1. **Architecture**: Feature-based organization, service layer pattern
2. **Type Safety**: Comprehensive TypeScript usage
3. **State Management**: Redux Toolkit for scalability
4. **API Integration**: Axios with interceptors, error handling
5. **Idempotency**: Duplicate prevention in payment flows
6. **Correlation IDs**: Request tracking across services
7. **Error Handling**: Three-layer error handling strategy
8. **Responsive Design**: Mobile-first approach
9. **Code Quality**: Clean code, reusable components
10. **Production Ready**: Build optimization, environment config

## 🤝 Contributing

This is a demonstration project. For production use:

1. Add comprehensive unit tests
2. Implement E2E testing
3. Add proper authentication (OAuth2/OIDC)
4. Implement proper session management
5. Add monitoring and analytics
6. Implement proper logging
7. Add performance monitoring

## 📄 License

This project is for demonstration and educational purposes.

## 🙋 Support

For questions or issues, please refer to the project documentation or contact the development team.

---

**Built with ❤️ for Enterprise Banking**
