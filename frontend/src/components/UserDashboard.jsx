import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import RedemptionPortal from './RedemptionPortal';
import Profile from './Profile';
import ErrorBoundary from './ErrorBoundary';
import { useLocation } from 'react-router-dom';

const UserDashboard = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  // Check if we're on the redemption page
  const isRedemptionPage = location.pathname === '/redemption';

  useEffect(() => {
    if (!isRedemptionPage) {
      fetchEvents();
      fetchRegisteredEvents();
      fetchUserPoints();
    }
  }, [isRedemptionPage]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events');
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/events/my-registrations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegisteredEvents(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users/points', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserPoints(response.data.points);
    } catch (error) {
      console.error('Error fetching points:', error);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      setError(''); // Clear any previous errors
      setSuccess(''); // Clear any previous success messages
      
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/events/register/${eventId}`, {}, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccess(response.data.message);
      fetchEvents();
      fetchRegisteredEvents();
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Failed to register for event');
    }
  };

  const handleCancelRegistration = async (eventId) => {
    try {
      setError(''); // Clear any previous errors
      setSuccess(''); // Clear any previous success messages
      
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/api/events/register/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(response.data.message);
      fetchEvents();
      fetchRegisteredEvents();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to cancel registration');
    }
  };

  const isRegistered = (eventId) => {
    return registeredEvents.some(reg => reg.event_id === eventId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {isRedemptionPage ? (
          <ErrorBoundary>
            <RedemptionPortal />
          </ErrorBoundary>
        ) : (
          <div>
            <h1 className="text-3xl font-bold mb-8 text-forest">Welcome, {user?.username}!</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Card */}
              <div onClick={() => setShowProfile(true)} 
                   className="eco-card p-6 cursor-pointer hover-lift">
                <h2 className="text-xl font-semibold text-forest">My Profile</h2>
                <p className="text-gray-600">View and update your profile</p>
              </div>

              {/* Points Card */}
              <div className="eco-card p-6 hover-lift">
                <h2 className="text-xl font-semibold text-forest">My Points</h2>
                <div className="text-3xl font-bold text-leaf">
                  {userPoints} pts
                </div>
              </div>
            </div>

            {/* Events Section */}
            <div className="mt-8 eco-card p-6">
              <h2 className="text-2xl font-semibold mb-6">Upcoming Events</h2>
              {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
                  {success}
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left">Title</th>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Location</th>
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{event.title}</td>
                        <td className="px-4 py-2">{event.description}</td>
                        <td className="px-4 py-2">
                          {new Date(event.date).toLocaleString()}
                        </td>
                        <td className="px-4 py-2">{event.location}</td>
                        <td className="px-4 py-2 capitalize">{event.type}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded text-sm ${
                              event.status === 'upcoming'
                                ? 'bg-green-100 text-green-800'
                                : event.status === 'ongoing'
                                ? 'bg-blue-100 text-blue-800'
                                : event.status === 'completed'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {event.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {isRegistered(event.id) ? (
                            <button
                              onClick={() => handleCancelRegistration(event.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Cancel Registration
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRegister(event.id)}
                              className="text-blue-600 hover:text-blue-800"
                              disabled={event.status !== 'upcoming'}
                            >
                              Register
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {events.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No events available at the moment.
                  </p>
                )}
              </div>
            </div>

            {/* Show redemption preview */}
            <div className="mt-8">
              <ErrorBoundary>
                <RedemptionPortal preview={true} />
              </ErrorBoundary>
            </div>
          </div>
        )}

        {showProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
              <div className="p-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowProfile(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <Profile />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(UserDashboard); 