import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { ArrowsRightLeftIcon, PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import Badge from '../../components/Common/Badge';
import Modal from '../../components/Common/Modal';
import { formatCurrency, formatDate, formatTransactionType } from '../../utils/formatters';

const mockTransactions = [
  {
    transactionId: '1',
    idempotencyKey: 'txn-001',
    fromAccountNumber: 'ACC001234567890',
    toAccountNumber: 'ACC987654321098',
    amount: 500.00,
    currency: 'USD',
    transactionType: 'TRANSFER',
    status: 'COMPLETED',
    description: 'Transfer to John Doe',
    referenceNumber: 'TXN20251218001',
    createdAt: '2025-12-18T10:30:00Z',
    completedAt: '2025-12-18T10:31:00Z'
  },
  {
    transactionId: '2',
    idempotencyKey: 'txn-002',
    toAccountNumber: 'ACC001234567890',
    amount: 2000.00,
    currency: 'USD',
    transactionType: 'DEPOSIT',
    status: 'COMPLETED',
    description: 'Salary deposit',
    referenceNumber: 'TXN20251217001',
    createdAt: '2025-12-17T14:15:00Z',
    completedAt: '2025-12-17T14:15:30Z'
  },
  {
    transactionId: '3',
    idempotencyKey: 'txn-003',
    fromAccountNumber: 'ACC001234567890',
    amount: 150.00,
    currency: 'USD',
    transactionType: 'WITHDRAWAL',
    status: 'COMPLETED',
    description: 'ATM withdrawal',
    referenceNumber: 'TXN20251216001',
    createdAt: '2025-12-16T09:45:00Z',
    completedAt: '2025-12-16T09:45:15Z'
  }
];

const TransactionsPage: React.FC = () => {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dateRange: '30days'
  });

  const { data: transactions, isLoading } = useQuery(
    ['transactions', filters],
    () => Promise.resolve(mockTransactions),
    { refetchInterval: 30000 }
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PENDING': return 'warning';
      case 'PROCESSING': return 'info';
      case 'FAILED': return 'error';
      case 'CANCELLED': return 'gray';
      default: return 'gray';
    }
  };

  const isCredit = (transaction: any) => {
    return transaction.transactionType === 'DEPOSIT' || 
           (transaction.transactionType === 'TRANSFER' && transaction.toAccountNumber === 'ACC001234567890');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 skeleton"></div>
          <div className="h-10 w-32 skeleton"></div>
        </div>
        <div className="h-96 skeleton rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">View and manage your transaction history</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary">
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </Button>
          <Button variant="primary" onClick={() => setIsTransferModalOpen(true)}>
            <PlusIcon className="h-5 w-5 mr-2" />
            New Transfer
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <Card.Body className="p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Transaction</th>
                  <th className="table-header-cell">Type</th>
                  <th className="table-header-cell">Amount</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Date</th>
                  <th className="table-header-cell">Reference</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {transactions?.map((transaction) => (
                  <tr key={transaction.transactionId} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center space-x-3">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                          isCredit(transaction) ? 'bg-success-100' : 'bg-error-100'
                        }`}>
                          <ArrowsRightLeftIcon className={`h-4 w-4 ${
                            isCredit(transaction) ? 'text-success-600' : 'text-error-600'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transaction.fromAccountNumber && `From: ${transaction.fromAccountNumber.slice(-6)}`}
                            {transaction.toAccountNumber && `To: ${transaction.toAccountNumber.slice(-6)}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-900">
                        {formatTransactionType(transaction.transactionType)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`text-sm font-medium ${
                        isCredit(transaction) ? 'text-success-600' : 'text-error-600'
                      }`}>
                        {isCredit(transaction) ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="table-cell">
                      <Badge variant={getStatusBadgeVariant(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-900">
                        {formatDate(transaction.createdAt, 'MMM dd, yyyy HH:mm')}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className="text-sm text-gray-500 font-mono">
                        {transaction.referenceNumber}
                      </span>
                    </td>
                    <td className="table-cell">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
      </Card>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <Modal
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          title="Transaction Details"
          size="lg"
        >
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-medium font-mono">{selectedTransaction.transactionId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reference Number</p>
                  <p className="font-medium font-mono">{selectedTransaction.referenceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{formatTransactionType(selectedTransaction.transactionType)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={getStatusBadgeVariant(selectedTransaction.status)}>
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium text-lg">{formatCurrency(selectedTransaction.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(selectedTransaction.createdAt, 'PPP p')}</p>
                </div>
              </div>
            </div>

            {selectedTransaction.description && (
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">{selectedTransaction.description}</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedTransaction(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Transfer Modal */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Transfer Money"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="form-label">From Account</label>
            <select className="form-input">
              <option value="">Select account</option>
              <option value="ACC001234567890">Savings Account - ACC***7890</option>
              <option value="ACC001234567891">Current Account - ACC***7891</option>
            </select>
          </div>

          <div>
            <label className="form-label">To Account</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter account number"
            />
          </div>

          <div>
            <label className="form-label">Amount</label>
            <input
              type="number"
              className="form-input"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="Optional description"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsTransferModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary">
              Transfer
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TransactionsPage;