import React from 'react';
import { useQuery } from 'react-query';
import { 
  CreditCardIcon, 
  BanknotesIcon, 
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/Common/Card';
import Badge from '../../components/Common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

// Mock data - replace with actual API calls
const mockDashboardData = {
  totalBalance: 125750.50,
  totalAccounts: 3,
  monthlyTransactions: 24,
  pendingPayments: 2,
  accounts: [
    {
      accountNumber: 'ACC001234567890',
      accountType: 'SAVINGS',
      balance: 85750.50,
      currency: 'USD',
      status: 'ACTIVE'
    },
    {
      accountNumber: 'ACC001234567891',
      accountType: 'CURRENT',
      balance: 40000.00,
      currency: 'USD',
      status: 'ACTIVE'
    }
  ],
  recentTransactions: [
    {
      transactionId: '1',
      transactionType: 'TRANSFER',
      amount: -500.00,
      description: 'Transfer to John Doe',
      createdAt: '2025-12-18T10:30:00Z',
      status: 'COMPLETED'
    },
    {
      transactionId: '2',
      transactionType: 'DEPOSIT',
      amount: 2000.00,
      description: 'Salary deposit',
      createdAt: '2025-12-17T14:15:00Z',
      status: 'COMPLETED'
    },
    {
      transactionId: '3',
      transactionType: 'PAYMENT',
      amount: -150.00,
      description: 'Utility bill payment',
      createdAt: '2025-12-16T09:45:00Z',
      status: 'COMPLETED'
    }
  ]
};

const DashboardPage: React.FC = () => {
  const { data: dashboardData, isLoading } = useQuery(
    'dashboard',
    () => Promise.resolve(mockDashboardData),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg h-24 skeleton"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg h-96 skeleton"></div>
          </div>
          <div className="bg-white rounded-lg h-96 skeleton"></div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Balance',
      value: formatCurrency(dashboardData?.totalBalance || 0),
      icon: BanknotesIcon,
      change: '+2.5%',
      changeType: 'increase',
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-600',
    },
    {
      name: 'Active Accounts',
      value: dashboardData?.totalAccounts || 0,
      icon: CreditCardIcon,
      change: '+1',
      changeType: 'increase',
      bgColor: 'bg-success-50',
      iconColor: 'text-success-600',
    },
    {
      name: 'This Month',
      value: `${dashboardData?.monthlyTransactions || 0} transactions`,
      icon: ArrowTrendingUpIcon,
      change: '+12%',
      changeType: 'increase',
      bgColor: 'bg-warning-50',
      iconColor: 'text-warning-600',
    },
    {
      name: 'Pending',
      value: `${dashboardData?.pendingPayments || 0} payments`,
      icon: ExclamationTriangleIcon,
      change: '-1',
      changeType: 'decrease',
      bgColor: 'bg-error-50',
      iconColor: 'text-error-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-soft">
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, John!
          </h1>
          <p className="text-primary-100 mt-2">
            Here's what's happening with your accounts today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.name} className="overflow-hidden">
            <Card.Body className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${item.bgColor}`}>
                    <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {item.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        item.changeType === 'increase' ? 'text-success-600' : 'text-error-600'
                      }`}>
                        {item.changeType === 'increase' ? (
                          <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                        </span>
                        {item.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Accounts Overview */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Account Overview
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Your active banking accounts
              </p>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {dashboardData?.accounts.map((account) => (
                    <li key={account.accountNumber} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <CreditCardIcon className="h-6 w-6 text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {account.accountType} Account
                            </div>
                            <div className="text-sm text-gray-500">
                              {account.accountNumber}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(account.balance)}
                          </div>
                          <Badge variant="success" size="sm">
                            {account.status}
                          </Badge>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Recent Transactions */}
        <div>
          <Card>
            <Card.Header>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Activity
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Latest transactions
              </p>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {dashboardData?.recentTransactions.map((transaction) => (
                    <li key={transaction.transactionId} className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            transaction.amount > 0 ? 'bg-success-100' : 'bg-error-100'
                          }`}>
                            {transaction.amount > 0 ? (
                              <ArrowUpIcon className="h-4 w-4 text-success-600" />
                            ) : (
                              <ArrowDownIcon className="h-4 w-4 text-error-600" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            transaction.amount > 0 ? 'text-success-600' : 'text-error-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                          </div>
                          <Badge 
                            variant={transaction.status === 'COMPLETED' ? 'success' : 'warning'} 
                            size="sm"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Card.Body>
            <Card.Footer>
              <div className="text-sm">
                <a
                  href="/transactions"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  View all transactions
                  <span aria-hidden="true"> →</span>
                </a>
              </div>
            </Card.Footer>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <Card.Header>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Quick Actions
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Common banking operations
          </p>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Transfer Money</p>
                <p className="text-sm text-gray-500 truncate">Send to another account</p>
              </div>
            </button>

            <button className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <div className="flex-shrink-0">
                <BanknotesIcon className="h-6 w-6 text-success-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Pay Bills</p>
                <p className="text-sm text-gray-500 truncate">Utilities and services</p>
              </div>
            </button>

            <button className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <div className="flex-shrink-0">
                <CreditCardIcon className="h-6 w-6 text-warning-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Mobile Recharge</p>
                <p className="text-sm text-gray-500 truncate">Top up your mobile</p>
              </div>
            </button>

            <button className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-error-600" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">View Statements</p>
                <p className="text-sm text-gray-500 truncate">Download statements</p>
              </div>
            </button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DashboardPage;