import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

const Games = () => {
  const games = [
    {
      id: 1,
      title: 'Climate Defender',
      description: 'Protect the Earth from climate threats in this action-packed game!',
      path: '/games/climate-defender',
      color: 'from-blue-500 to-green-500'
    },
    {
      id: 2,
      title: 'Climate Rescue',
      description: 'Save endangered species and restore their habitats.',
      path: '/games/climate-rescue',
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 3,
      title: 'Eco City',
      description: 'Build and manage a sustainable city of the future.',
      path: '/games/eco-city',
      color: 'from-teal-500 to-blue-500'
    },
    {
      id: 4,
      title: 'Time Eco Savior',
      description: 'Travel through time to prevent environmental disasters.',
      path: '/games/time-eco-savior',
      color: 'from-purple-500 to-blue-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Climate Games</h1>
        <p className="text-lg text-gray-600 mb-8">Learn about climate change through interactive adventures!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game) => (
            <Link 
              key={game.id} 
              to={game.path}
              className="transform transition duration-300 hover:scale-105"
            >
              <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-green-100 hover:border-green-300">
                <div className={`h-48 bg-gradient-to-r ${game.color} relative`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{game.title}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">{game.title}</h2>
                  <p className="text-gray-600">{game.description}</p>
                  <div className="mt-4">
                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      Play Now
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Games; 