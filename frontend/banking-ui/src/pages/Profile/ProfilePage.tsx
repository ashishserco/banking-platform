import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import { UserIcon } from '@heroicons/react/24/outline';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      <Card>
        <Card.Header>
          <h3 className="text-lg font-medium">Personal Information</h3>
        </Card.Header>
        <Card.Body>
          <div className="flex items-center space-x-6">
            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center">
              <UserIcon className="h-10 w-10 text-gray-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500">Customer ID: {user?.id}</p>
            </div>
          </div>
        </Card.Body>
        <Card.Footer>
          <Button variant="primary">Edit Profile</Button>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default ProfilePage;