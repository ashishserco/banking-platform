import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { PlusIcon, CreditCardIcon, EyeIcon } from '@heroicons/react/24/outline';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Badge from '../../components/Common/Badge';
import Modal from '../../components/Common/Modal';
import { formatCurrency, formatAccountNumber, formatDate } from '../../utils/formatters';

// Mock data
const mockAccounts = [
  {
    accountId: '1',
    accountNumber: 'ACC001234567890',
    customerId: '1',
    accountType: 'SAVINGS',
    balance: 85750.50,
    currency: 'USD',
    status: 'ACTIVE',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2025-12-18T14:30:00Z',
    customer: {
      customerId: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phoneNumber: '+1234567890',
      dateOfBirth: '1990-01-01',
      kycStatus: 'VERIFIED',
      createdAt: '2024-01-15T10:00:00Z'
    }
  },
  {
    accountId: '2',
    accountNumber: 'ACC001234567891',
    customerId: '1',
    accountType: 'CURRENT',
    balance: 40000.00,
    currency: 'USD',
    status: 'ACTIVE',
    createdAt: '2024-06-10T15:45:00Z',
    updatedAt: '2025-12-18T14:30:00Z',
    customer: {
      customerId: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      phoneNumber: '+1234567890',
      dateOfBirth: '1990-01-01',
      kycStatus: 'VERIFIED',
      createdAt: '2024-01-15T10:00:00Z'
    }
  }
];

const AccountsPage: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  const { data: accounts, isLoading } = useQuery(
    'accounts',
    () => Promise.resolve(mockAccounts),
    { refetchInterval: 30000 }
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'warning';
      case 'FROZEN':
        return 'error';
      case 'CLOSED':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getAccountTypeIcon = (type: string) => {
    return CreditCardIcon;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 skeleton"></div>
          <div className="h-10 w-32 skeleton"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 skeleton rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const totalBalance = accounts?.reduce((sum, account) => sum + account.balance, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Accounts</h1>
          <p className="text-gray-600">
            Total Balance: <span className="font-semibold text-primary-600">{formatCurrency(totalBalance)}</span>
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Account
        </Button>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {accounts?.map((account) => {
          const AccountIcon = getAccountTypeIcon(account.accountType);
          return (
            <Card key={account.accountId} className="hover:shadow-lg transition-shadow">
              <Card.Body>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <AccountIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {account.accountType} Account
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatAccountNumber(account.accountNumber)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(account.status)}>
                    {account.status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Available Balance</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(account.balance, account.currency)}
                    </p>
                  </div>

                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-gray-500">Account Type</p>
                      <p className="font-medium">{account.accountType}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Opened</p>
                      <p className="font-medium">{formatDate(account.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => setSelectedAccount(account)}
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button variant="secondary" size="sm" fullWidth>
                    Statements
                  </Button>
                </div>
              </Card.Body>
            </Card>
          );
        })}
      </div>

      {accounts?.length === 0 && (
        <div className="text-center py-12">
          <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No accounts</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first bank account.
          </p>
          <div className="mt-6">
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Account
            </Button>
          </div>
        </div>
      )}

      {/* Account Details Modal */}
      {selectedAccount && (
        <Modal
          isOpen={!!selectedAccount}
          onClose={() => setSelectedAccount(null)}
          title="Account Details"
          size="lg"
        >
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Account Number</p>
                  <p className="font-medium">{selectedAccount.accountNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Type</p>
                  <p className="font-medium">{selectedAccount.accountType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className="font-medium">{formatCurrency(selectedAccount.balance)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={getStatusBadgeVariant(selectedAccount.status)}>
                    {selectedAccount.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Account Holder</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">
                    {selectedAccount.customer.firstName} {selectedAccount.customer.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedAccount.customer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedAccount.customer.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">KYC Status</p>
                  <Badge variant={selectedAccount.customer.kycStatus === 'VERIFIED' ? 'success' : 'warning'}>
                    {selectedAccount.customer.kycStatus}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setSelectedAccount(null)}>
                Close
              </Button>
              <Button variant="primary">
                View Transactions
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Account Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Account"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Create a new banking account. All accounts require KYC verification.
          </p>
          
          <div>
            <label className="form-label">Account Type</label>
            <select className="form-input">
              <option value="">Select account type</option>
              <option value="SAVINGS">Savings Account</option>
              <option value="CURRENT">Current Account</option>
            </select>
          </div>

          <div>
            <label className="form-label">Initial Deposit</label>
            <input
              type="number"
              className="form-input"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum deposit of $100 required for savings accounts
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary">
              Create Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AccountsPage;