import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminEventPage from './components/admin/AdminEventPage';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import ClimateDefender from './components/games/ClimateDefender';
import ClimateRescue from './components/games/ClimateRescue';
import EcoCity from './components/games/EcoCity';
import TimeEcoSavior from './components/games/TimeEcoSavior';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import Games from './components/Games';
import RedemptionPortal from './components/RedemptionPortal';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected admin route */}
          <Route 
            path="/admin/events" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminEventPage />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/games/climate-defender" element={<ClimateDefender />} />
          <Route path="/games/climate-rescue" element={<ClimateRescue />} />
          <Route path="/games/eco-city" element={<EcoCity />} />
          <Route path="/games/time-eco-savior" element={<TimeEcoSavior />} />

          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/games"
            element={
              <ProtectedRoute>
                <Games />
              </ProtectedRoute>
            }
          />

          <Route
            path="/redemption"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-gray-100">
                  <Navbar />
                  <div className="container mx-auto px-4 py-8">
                    <RedemptionPortal />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 