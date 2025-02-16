import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ShippingAddressModal from './ShippingAddressModal';

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState('');

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

  useEffect(() => {
    fetchUserPoints();
  }, []);

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

  const handleRedeem = (item) => {
    if (userPoints < item.points_required) {
      setError(`Insufficient points. You need ${item.points_required} points but have ${userPoints}`);
      return;
    }
    setSelectedItem(item);
    setShowModal(true);
    setError('');
  };

  const handleRedemptionSubmit = async (shippingAddress) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/redemption/redeem', 
        {
          itemId: selectedItem.id,
          shippingAddress
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSuccess('Item redeemed successfully!');
      setShowModal(false);
      fetchUserPoints(); // Refresh points
      fetchRewards(); // Refresh rewards list
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to redeem item');
    }
  };

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Your Points: {userPoints}</h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img 
              src={item.image_url} 
              alt={item.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-green-600 font-bold">{item.points_required} points</span>
                <button
                  onClick={() => handleRedeem(item)}
                  disabled={userPoints < item.points_required || item.stock === 0}
                  className={`px-4 py-2 rounded ${
                    userPoints >= item.points_required && item.stock > 0
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {item.stock === 0 ? 'Out of Stock' : 'Redeem'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedItem && (
        <ShippingAddressModal
          onSubmit={handleRedemptionSubmit}
          onClose={() => setShowModal(false)}
          itemName={selectedItem.name}
          pointsRequired={selectedItem.points_required}
        />
      )}
    </div>
  );
};

export default React.memo(Rewards); 