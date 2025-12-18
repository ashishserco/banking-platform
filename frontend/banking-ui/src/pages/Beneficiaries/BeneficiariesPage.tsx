import React from 'react';
import Card from '../../components/Common/Card';
import { UsersIcon } from '@heroicons/react/24/outline';

const BeneficiariesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Beneficiaries</h1>
        <p className="text-gray-600">Manage your payment beneficiaries</p>
      </div>

      <Card>
        <Card.Body className="text-center py-12">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Beneficiaries</h3>
          <p className="text-gray-500">Add beneficiaries to make payments easier</p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default BeneficiariesPage;