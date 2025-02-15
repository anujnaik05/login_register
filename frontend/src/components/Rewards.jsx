import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRewards = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/redemption/items', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (Array.isArray(response.data)) {
        const validRewards = response.data.filter(reward => 
          reward && reward.id && reward.name && reward.category
        );

        if (validRewards.length === 0) {
          setError('No valid rewards found');
          return;
        }

        // Sort rewards by category and points
        const sortedRewards = validRewards.sort((a, b) => {
          if (a.category === b.category) {
            return a.points_required - b.points_required;
          }
          return a.category.localeCompare(b.category);
        });

        setRewards(sortedRewards);
        setError('');
      } else {
        setError('Invalid data format received');
      }
    } catch (err) {
      console.error('Error fetching rewards:', err);
      setError(err.response?.data?.message || 'Failed to load rewards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadRewards = async () => {
      try {
        await fetchRewards();
      } catch (error) {
        if (mounted) {
          console.error('Error loading rewards:', error);
        }
      }
    };

    loadRewards();

    return () => {
      mounted = false;
    };
  }, [fetchRewards]);

  // Group rewards by category using useMemo to prevent unnecessary recalculations
  const groupedRewards = React.useMemo(() => {
    const groups = {};
    rewards.forEach(reward => {
      const category = reward.category.toLowerCase();
      if (!groups[category]) {
        groups[category] = [];
      }
      // Only add if not already in the array
      if (!groups[category].some(r => r.id === reward.id)) {
        groups[category].push(reward);
      }
    });
    return groups;
  }, [rewards]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6">Rewards & Achievements</h2>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6">Rewards & Achievements</h2>
        <div className="text-red-600 text-center p-4">{error}</div>
      </div>
    );
  }

  if (Object.keys(groupedRewards).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6">Rewards & Achievements</h2>
        <div className="text-gray-500 text-center p-4">No rewards available at the moment.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">Rewards & Achievements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(groupedRewards).map(([category, categoryRewards]) => (
          <div key={category} className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-blue-50">
            <h3 className="text-xl font-semibold mb-4 capitalize">{category}</h3>
            <div className="space-y-3">
              {categoryRewards.map(reward => (
                <div 
                  key={reward.id} 
                  className="flex items-start p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex-grow">
                    <h4 className="font-medium text-gray-800">{reward.name}</h4>
                    <p className="text-sm text-gray-600">{reward.description}</p>
                  </div>
                  <div className="ml-4 flex items-center">
                    <span className="text-sm font-semibold text-green-600">
                      {reward.points_required} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(Rewards); 