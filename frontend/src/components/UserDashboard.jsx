import React from 'react';
import Navbar from './Navbar';

const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar isAdmin={false} />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96">
            {/* Add your user dashboard content here */}
            <div className="p-4">
              <h2 className="text-2xl font-bold mb-4">User Dashboard</h2>
              {/* Dashboard content */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 