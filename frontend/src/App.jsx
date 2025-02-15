import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Games from './components/Games';
import ClimateRescue from './components/games/ClimateRescue';
import EcoCity from './components/games/EcoCity';
import ClimateDefender from './components/games/ClimateDefender';
import TimeEcoSavior from './components/games/TimeEcoSavior';
import EventManagement from './components/admin/EventManagement';
import RedemptionPortal from './components/RedemptionPortal';
import './styles/global.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
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
            path="/games/climate-rescue"
            element={
              <ProtectedRoute>
                <ClimateRescue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/games/eco-city"
            element={
              <ProtectedRoute>
                <EcoCity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/games/climate-defender"
            element={
              <ProtectedRoute>
                <ClimateDefender />
              </ProtectedRoute>
            }
          />
          <Route
            path="/games/time-eco-savior"
            element={
              <ProtectedRoute>
                <TimeEcoSavior />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-courses"
            element={
              <ProtectedRoute>
                <div>My Courses Page (Coming Soon)</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <div>Profile Page (Coming Soon)</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute requireAdmin={true}>
                <EventManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/redemption"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 