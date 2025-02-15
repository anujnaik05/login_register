import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ isAdmin }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo/Brand */}
            <div className="flex-shrink-0 flex items-center">
              <Link to={isAdmin ? '/admin-dashboard' : '/user-dashboard'} 
                    className="text-xl font-bold text-primary-600">
                Climate App
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to={isAdmin ? '/admin-dashboard' : '/user-dashboard'}
                className="border-transparent text-gray-500 hover:border-primary-500 hover:text-primary-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              
              <Link
                to="/my-courses"
                className="border-transparent text-gray-500 hover:border-primary-500 hover:text-primary-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                My Courses
              </Link>
              
              <Link
                to="/games"
                className="border-transparent text-gray-500 hover:border-primary-500 hover:text-primary-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Games
              </Link>

              {/* Space for additional links */}
              {/* Add new links here */}

              <Link
                to="/profile"
                className="border-transparent text-gray-500 hover:border-primary-500 hover:text-primary-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Profile
              </Link>
            </div>
          </div>

          {/* Right side - User Info & Logout */}
          <div className="flex items-center">
            <span className="text-gray-700 mr-4">
              Welcome, {isAdmin ? 'Admin' : ''} {user?.username}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - shown/hidden with state */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          <Link
            to={isAdmin ? '/admin-dashboard' : '/user-dashboard'}
            className="text-gray-500 hover:text-primary-700 block pl-3 pr-4 py-2 text-base font-medium"
          >
            Dashboard
          </Link>
          
          <Link
            to="/my-courses"
            className="text-gray-500 hover:text-primary-700 block pl-3 pr-4 py-2 text-base font-medium"
          >
            My Courses
          </Link>
          
          <Link
            to="/games"
            className="text-gray-500 hover:text-primary-700 block pl-3 pr-4 py-2 text-base font-medium"
          >
            Games
          </Link>

          <Link
            to="/profile"
            className="text-gray-500 hover:text-primary-700 block pl-3 pr-4 py-2 text-base font-medium"
          >
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 