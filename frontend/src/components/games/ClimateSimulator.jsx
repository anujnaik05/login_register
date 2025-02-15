import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';

const ClimateSimulator = () => {
  const [year, setYear] = useState(2024);
  const [temperature, setTemperature] = useState(14.5);
  const [co2Level, setCo2Level] = useState(420);
  const [resources, setResources] = useState(1000);
  const [policies, setPolicies] = useState([]);
  
  const availablePolicies = [
    {
      id: 1,
      name: "Renewable Energy Investment",
      cost: 200,
      tempEffect: -0.2,
      co2Effect: -15,
      description: "Invest in solar and wind power infrastructure"
    },
    {
      id: 2,
      name: "Forest Conservation",
      cost: 150,
      tempEffect: -0.1,
      co2Effect: -10,
      description: "Protect and expand forest areas"
    },
    {
      id: 3,
      name: "Clean Transportation",
      cost: 250,
      tempEffect: -0.15,
      co2Effect: -20,
      description: "Implement electric vehicle infrastructure"
    }
  ];

  const implementPolicy = (policy) => {
    if (resources >= policy.cost) {
      setResources(prev => prev - policy.cost);
      setPolicies(prev => [...prev, policy]);
      setTemperature(prev => prev + policy.tempEffect);
      setCo2Level(prev => prev + policy.co2Effect);
    }
  };

  const advanceYear = () => {
    setYear(prev => prev + 1);
    // Natural increase in temperature and CO2 if no action is taken
    setTemperature(prev => prev + 0.1);
    setCo2Level(prev => prev + 5);
    setResources(prev => prev + 100); // Annual budget
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Climate Impact Simulator</h1>
          
          {/* Status Dashboard */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">Year</h3>
              <p className="text-2xl text-primary-600">{year}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">Global Temperature</h3>
              <p className="text-2xl text-red-600">{temperature.toFixed(1)}°C</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">CO2 Level</h3>
              <p className="text-2xl text-gray-600">{co2Level} ppm</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold">Resources</h3>
              <p className="text-2xl text-green-600">${resources}</p>
            </div>
          </div>

          {/* Available Policies */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Available Policies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availablePolicies.map(policy => (
                <div key={policy.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{policy.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{policy.description}</p>
                  <div className="text-sm text-gray-500">
                    <p>Cost: ${policy.cost}</p>
                    <p>Temperature Effect: {policy.tempEffect}°C</p>
                    <p>CO2 Effect: {policy.co2Effect} ppm</p>
                  </div>
                  <button
                    onClick={() => implementPolicy(policy)}
                    disabled={resources < policy.cost}
                    className={`mt-2 px-4 py-2 rounded-md text-white ${
                      resources >= policy.cost 
                        ? 'bg-primary-600 hover:bg-primary-700' 
                        : 'bg-gray-400'
                    }`}
                  >
                    Implement Policy
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Advance Time Button */}
          <button
            onClick={advanceYear}
            className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700"
          >
            Advance to Next Year
          </button>

          {/* Game Over Conditions */}
          {temperature >= 16 && (
            <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg">
              Warning: Global temperature is reaching critical levels!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClimateSimulator; 