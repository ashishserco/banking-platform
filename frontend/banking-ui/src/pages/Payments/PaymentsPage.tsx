import React from 'react';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { BanknotesIcon, DevicePhoneMobileIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const PaymentsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600">Pay bills, recharge mobile, and more</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Card.Body className="text-center p-8">
            <div className="mx-auto h-16 w-16 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
              <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bill Payments</h3>
            <p className="text-gray-500 mb-4">Pay utility bills, insurance, and more</p>
            <Button variant="primary" fullWidth>Pay Bills</Button>
          </Card.Body>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Card.Body className="text-center p-8">
            <div className="mx-auto h-16 w-16 bg-success-100 rounded-lg flex items-center justify-center mb-4">
              <DevicePhoneMobileIcon className="h-8 w-8 text-success-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Mobile Recharge</h3>
            <p className="text-gray-500 mb-4">Top up your mobile phone balance</p>
            <Button variant="success" fullWidth>Recharge</Button>
          </Card.Body>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Card.Body className="text-center p-8">
            <div className="mx-auto h-16 w-16 bg-warning-100 rounded-lg flex items-center justify-center mb-4">
              <BanknotesIcon className="h-8 w-8 text-warning-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Merchant Payment</h3>
            <p className="text-gray-500 mb-4">Pay merchants and online stores</p>
            <Button variant="primary" fullWidth>Pay Merchant</Button>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default PaymentsPage;