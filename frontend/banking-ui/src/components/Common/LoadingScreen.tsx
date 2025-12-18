import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 loading-spinner"></div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Banking Platform
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Loading your banking experience...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;