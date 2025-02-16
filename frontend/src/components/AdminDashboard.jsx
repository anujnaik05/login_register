import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import axios from 'axios';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [eventRegistrations, setEventRegistrations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('events');

  useEffect(() => {
    if (activeTab === 'events') {
      fetchEventRegistrations();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchEventRegistrations = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching event registrations...'); // Debug log
      const response = await axios.get('http://localhost:5000/api/admin/event-registrations');
      
      console.log('Response received:', response.data); // Debug log

      if (Array.isArray(response.data)) {
        setEventRegistrations(response.data);
        setError('');
      } else {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error details:', err);
      setError('Error fetching event registrations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/admin/users');
      
      if (response.data && Array.isArray(response.data.users)) {
        setUsers(response.data.users);
        setError('');
      } else {
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Error fetching users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const UsersTable = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">User Management</h2>
      {users.length === 0 ? (
        <div className="text-gray-500 text-center">No users found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Events Registered
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isAdmin
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-green-600 font-medium">{user.points || 0}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(user.created_at), 'PPP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {user.event_count || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const EventRegistrationsTable = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">Event Registrations</h2>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : eventRegistrations.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No events found</div>
      ) : (
        <div className="space-y-8">
          {eventRegistrations.map(({ event, registrations }) => (
            <div key={event.id} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 border-b">
                <h3 className="text-xl font-semibold">{event.title}</h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Date: {format(new Date(event.date), 'PPP')}</p>
                  <p>Location: {event.location}</p>
                  <p>Status: <span className={`capitalize ${
                    event.status === 'upcoming' ? 'text-green-600' :
                    event.status === 'completed' ? 'text-blue-600' : 'text-gray-600'
                  }`}>{event.status}</span></p>
                </div>
              </div>
              
              {registrations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {registrations.map((registration) => (
                        <tr key={registration.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {registration.username}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{registration.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {format(new Date(registration.registrationDate), 'PPp')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              registration.status === 'confirmed' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {registration.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-gray-500 text-center">No registrations for this event</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ManageEventsSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Link to="/admin/events/create" className="block">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Create Event</h2>
          <p className="text-gray-600">Create a new event</p>
        </div>
      </Link>
      <Link to="/admin/events" className="block">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">Manage Events</h2>
          <p className="text-gray-600">View and manage all events</p>
        </div>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded ${
              activeTab === 'events'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Event Registrations
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 rounded ${
              activeTab === 'manage'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Manage Events
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-red-600 mb-4 p-4 bg-red-50 rounded">{error}</div>
        ) : (
          <>
            {activeTab === 'users' && <UsersTable />}
            {activeTab === 'events' && <EventRegistrationsTable />}
            {activeTab === 'manage' && <ManageEventsSection />}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 