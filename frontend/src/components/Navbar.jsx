import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="nav-sustainable">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to={user?.isAdmin ? '/admin-dashboard' : '/user-dashboard'} 
                  className="text-xl font-bold flex items-center">
              <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Climate Action
            </Link>
            
            {user?.isAdmin ? (
              // Admin Navigation Links
              <>
                <Link to="/admin/events" className="hover:text-green-200">
                  Manage Events
                </Link>
                <Link to="/admin-dashboard" className="hover:text-green-200">
                  Dashboard
                </Link>
              </>
            ) : (
              // User Navigation Links
              <>
                <Link to="/games" className="hover:text-green-200">
                  Games
                </Link>
                <Link to="/user-dashboard" className="hover:text-green-200">
                  Dashboard
                </Link>
                <Link to="/redemption" className="hover:text-green-200">
                  Rewards Shop
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm">{user?.username}</span>
            <button
              onClick={handleLogout}
              className="bg-green-700 px-4 py-2 rounded hover:bg-green-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 