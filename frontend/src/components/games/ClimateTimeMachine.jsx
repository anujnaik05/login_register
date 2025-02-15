import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';

const ClimateTimeMachine = () => {
  const [year, setYear] = useState(2024);
  const [worldState, setWorldState] = useState({
    temperature: 14.5,
    seaLevel: 0,
    forestCover: 100,
    airQuality: 100,
    population: 8,
  });
  const [selectedAction, setSelectedAction] = useState(null);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [paused, setPaused] = useState(true);
  const [events, setEvents] = useState([]);
  const [score, setScore] = useState(0);

  const actions = [
    {
      id: 1,
      name: "Plant Trees",
      icon: "🌳",
      cost: 10,
      effects: {
        temperature: -0.1,
        forestCover: +2,
        airQuality: +5,
      },
      description: "Plant forests to absorb CO2"
    },
    {
      id: 2,
      name: "Clean Energy",
      icon: "☀️",
      cost: 20,
      effects: {
        temperature: -0.2,
        airQuality: +10,
      },
      description: "Invest in solar and wind power"
    },
    {
      id: 3,
      name: "Ocean Cleanup",
      icon: "🌊",
      cost: 15,
      effects: {
        seaLevel: -0.1,
        airQuality: +3,
      },
      description: "Remove plastic and restore marine ecosystems"
    }
  ];

  const randomEvents = [
    {
      name: "Industrial Revolution",
      year: 1850,
      effects: {
        temperature: +0.5,
        airQuality: -20,
        population: +1
      },
      description: "Factories emerge, changing the world"
    },
    {
      name: "Great Deforestation",
      year: 1950,
      effects: {
        forestCover: -30,
        temperature: +0.3,
        airQuality: -10
      },
      description: "Mass clearing of forests for agriculture"
    },
    // Add more historical events
  ];

  useEffect(() => {
    if (!paused) {
      const timer = setInterval(() => {
        progressTime();
      }, 1000 / gameSpeed);
      return () => clearInterval(timer);
    }
  }, [paused, gameSpeed, worldState]);

  const progressTime = () => {
    setYear(prev => prev + 1);
    
    // Natural changes
    setWorldState(prev => ({
      ...prev,
      temperature: prev.temperature + 0.01,
      seaLevel: prev.seaLevel + 0.02,
      forestCover: Math.max(0, prev.forestCover - 0.1),
      airQuality: Math.max(0, prev.airQuality - 0.1),
    }));

    // Check for historical events
    checkHistoricalEvents();
  };

  const checkHistoricalEvents = () => {
    randomEvents.forEach(event => {
      if (event.year === year && !events.includes(event.name)) {
        setEvents(prev => [...prev, event.name]);
        setWorldState(prev => ({
          ...prev,
          ...Object.keys(event.effects).reduce((acc, key) => ({
            ...acc,
            [key]: prev[key] + event.effects[key]
          }), {})
        }));
      }
    });
  };

  const implementAction = (action) => {
    setWorldState(prev => ({
      ...prev,
      ...Object.keys(action.effects).reduce((acc, key) => ({
        ...acc,
        [key]: prev[key] + action.effects[key]
      }), {})
    }));
    setScore(prev => prev + 10);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Climate Time Machine</h1>
            <div className="text-2xl font-bold text-primary-600">
              Year: {year} | Score: {score}
            </div>
          </div>

          {/* World State Dashboard */}
          <div className="grid grid-cols-5 gap-4 mb-8">
            <WorldStateCard
              title="Temperature"
              value={`${worldState.temperature.toFixed(1)}°C`}
              icon="🌡️"
              trend={worldState.temperature > 15 ? "rising" : "stable"}
            />
            <WorldStateCard
              title="Sea Level"
              value={`+${worldState.seaLevel.toFixed(1)}m`}
              icon="🌊"
              trend={worldState.seaLevel > 1 ? "critical" : "rising"}
            />
            <WorldStateCard
              title="Forest Cover"
              value={`${worldState.forestCover.toFixed(1)}%`}
              icon="🌳"
              trend={worldState.forestCover < 50 ? "critical" : "stable"}
            />
            <WorldStateCard
              title="Air Quality"
              value={`${worldState.airQuality.toFixed(1)}%`}
              icon="💨"
              trend={worldState.airQuality < 50 ? "critical" : "good"}
            />
            <WorldStateCard
              title="Population"
              value={`${worldState.population.toFixed(1)}B`}
              icon="👥"
              trend="rising"
            />
          </div>

          {/* Game Controls */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setPaused(!paused)}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              {paused ? "Start Time" : "Pause Time"}
            </button>
            <select
              value={gameSpeed}
              onChange={(e) => setGameSpeed(Number(e.target.value))}
              className="px-4 py-2 border rounded-lg"
            >
              <option value={1}>Normal Speed</option>
              <option value={2}>2x Speed</option>
              <option value={5}>5x Speed</option>
            </select>
          </div>

          {/* Available Actions */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {actions.map(action => (
              <div
                key={action.id}
                className="border rounded-lg p-4 hover:border-primary-500 cursor-pointer"
                onClick={() => implementAction(action)}
              >
                <div className="text-4xl mb-2">{action.icon}</div>
                <h3 className="font-bold">{action.name}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
                <div className="mt-2 text-sm">
                  {Object.entries(action.effects).map(([key, value]) => (
                    <div key={key}>
                      {key}: {value > 0 ? '+' : ''}{value}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Historical Events Log */}
          <div className="border-t pt-4">
            <h2 className="text-xl font-bold mb-2">Historical Events</h2>
            <div className="space-y-2">
              {events.map((event, index) => (
                <div key={index} className="text-gray-600">
                  {event}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for world state cards
const WorldStateCard = ({ title, value, icon, trend }) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'critical': return 'text-red-600';
      case 'rising': return 'text-yellow-600';
      case 'stable': return 'text-green-600';
      case 'good': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className={`text-xl font-bold ${getTrendColor()}`}>{value}</p>
    </div>
  );
};

export default ClimateTimeMachine; 