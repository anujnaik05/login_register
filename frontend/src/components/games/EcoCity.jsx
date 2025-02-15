import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';

const EcoCity = () => {
  const [resources, setResources] = useState({
    money: 1000,
    energy: 100,
    happiness: 80,
    pollution: 20
  });

  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const buildingTypes = {
    SOLAR_PLANT: {
      name: 'Solar Power Plant',
      cost: 200,
      effects: {
        energy: +20,
        pollution: -5,
        happiness: +5
      },
      icon: '☀️'
    },
    PARK: {
      name: 'Green Park',
      cost: 100,
      effects: {
        happiness: +10,
        pollution: -5
      },
      icon: '🌳'
    },
    RECYCLING: {
      name: 'Recycling Center',
      cost: 150,
      effects: {
        pollution: -15,
        money: +10
      },
      icon: '♻️'
    }
  };

  const handleBuild = (type) => {
    if (resources.money >= buildingTypes[type].cost) {
      setBuildings([...buildings, { type, id: Date.now() }]);
      setResources({
        ...resources,
        money: resources.money - buildingTypes[type].cost
      });
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      // Update resources based on buildings
      const newResources = { ...resources };
      buildings.forEach(building => {
        const effects = buildingTypes[building.type].effects;
        Object.entries(effects).forEach(([resource, value]) => {
          newResources[resource] += value / 60; // Per second effect
        });
      });
      setResources(newResources);
    }, 1000);

    return () => clearInterval(timer);
  }, [buildings, resources]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Resource Display */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {Object.entries(resources).map(([resource, value]) => (
              <div key={resource} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold capitalize">{resource}</h3>
                <p className="text-2xl font-bold">{Math.round(value)}</p>
              </div>
            ))}
          </div>

          {/* Building Options */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {Object.entries(buildingTypes).map(([type, building]) => (
              <button
                key={type}
                onClick={() => handleBuild(type)}
                disabled={resources.money < building.cost}
                className={`p-4 rounded-lg border-2 ${
                  resources.money >= building.cost
                    ? 'border-green-500 hover:bg-green-50'
                    : 'border-gray-300 opacity-50'
                }`}
              >
                <div className="text-3xl mb-2">{building.icon}</div>
                <h3 className="font-bold">{building.name}</h3>
                <p className="text-sm text-gray-600">Cost: ${building.cost}</p>
                <div className="text-sm mt-2">
                  {Object.entries(building.effects).map(([effect, value]) => (
                    <div key={effect}>
                      {effect}: {value > 0 ? '+' : ''}{value}
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* City View */}
          <div className="border rounded-lg p-4 min-h-[400px]">
            <div className="grid grid-cols-6 gap-2">
              {buildings.map(building => (
                <div key={building.id} className="text-4xl">
                  {buildingTypes[building.type].icon}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcoCity; 