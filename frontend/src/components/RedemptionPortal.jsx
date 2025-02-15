import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RedemptionPortal = ({ preview = false }) => {
  const [items, setItems] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [shippingAddress, setShippingAddress] = useState('');

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'merchandise', name: 'Merchandise' },
    { id: 'vouchers', name: 'Vouchers' },
    { id: 'experiences', name: 'Experiences' },
    { id: 'donations', name: 'Donations' }
  ];

  // Fetch items and points only once when component mounts
  useEffect(() => {
    let mounted = true;

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        
        console.log('Fetching rewards data...');
        const [itemsResponse, pointsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/redemption/items', {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          axios.get('http://localhost:5000/api/users/points', {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        console.log('Rewards response:', itemsResponse.data);

        if (mounted) {
          if (Array.isArray(itemsResponse.data)) {
            const uniqueItems = Array.from(new Set(itemsResponse.data.map(item => item.id)))
              .map(id => itemsResponse.data.find(item => item.id === id))
              .sort((a, b) => {
                if (a.category === b.category) {
                  return a.points_required - b.points_required;
                }
                return a.category.localeCompare(b.category);
              });

            setItems(uniqueItems);
            setUserPoints(pointsResponse.data.points);
            setError('');
          } else {
            console.error('Invalid data format:', itemsResponse.data);
            setError('Invalid data received from server');
          }
        }
      } catch (err) {
        console.error('Error details:', err.response || err);
        if (mounted) {
          setError(
            err.response?.data?.message || 
            'Failed to load rewards. Please try again.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchInitialData();
    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array means this runs once on mount

  // Memoize filtered items to prevent unnecessary recalculations
  const filteredItems = React.useMemo(() => {
    return selectedCategory === 'all'
      ? items
      : items.filter(item => item.category === selectedCategory);
  }, [items, selectedCategory]);

  // Limit items in preview mode
  const displayItems = React.useMemo(() => {
    const filtered = selectedCategory === 'all' 
      ? items 
      : items.filter(item => item.category === selectedCategory);
    
    return preview ? filtered.slice(0, 3) : filtered;
  }, [items, selectedCategory, preview]);

  const handleRedeem = async () => {
    if (!selectedItem || !shippingAddress.trim()) {
      setError('Please provide shipping address');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/redemption/redeem', 
        {
          itemId: selectedItem.id,
          shippingAddress: shippingAddress.trim()
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess('Item redeemed successfully!');
      setShowRedemptionModal(false);
      setShippingAddress('');
      
      // Update points and items after successful redemption
      const [newItems, newPoints] = await Promise.all([
        axios.get('/api/redemption/items', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/users/points', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setItems(newItems.data);
      setUserPoints(newPoints.data.points);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to redeem item');
    }
  };

  // Don't show certain elements in preview mode
  if (preview) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Featured Rewards</h2>
          <a 
            href="/redemption" 
            className="text-green-600 hover:text-green-700 font-medium"
          >
            View All Rewards →
          </a>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayItems.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
                <img
                  src={item.image_url || 'https://via.placeholder.com/300x200?text=Product+Image'}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Product+Image';
                  }}
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-green-600 font-bold">
                        {item.points_required} points
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {item.stock > 0 ? `${item.stock} left` : 'Out of stock'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowRedemptionModal(true);
                      }}
                      disabled={userPoints < item.points_required || item.stock <= 0}
                      className={`px-4 py-2 rounded-lg transition-colors
                        ${userPoints >= item.points_required && item.stock > 0
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    >
                      {item.stock <= 0 ? 'Out of Stock' : 'Redeem'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Full redemption portal view
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Rewards Shop</h2>
            <div className="text-green-600 font-semibold">
              {userPoints} Points Available
            </div>
          </div>

          {/* Category filters */}
          <div className="flex space-x-4 mb-6">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Error and loading states */}
          {error && (
            <div className="text-red-600 mb-4 p-4 bg-red-50 rounded-lg">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-8">Loading rewards...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Filtered items */}
              {items
                .filter(item => 
                  selectedCategory === 'all' || 
                  item.category === selectedCategory
                )
                .map(item => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                    <p className="text-gray-600 mb-4">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 font-semibold">
                        {item.points_required} Points
                      </span>
                      <button
                        onClick={() => handleRedeem(item)}
                        disabled={userPoints < item.points_required}
                        className={`px-4 py-2 rounded-lg ${
                          userPoints < item.points_required
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        Redeem
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedemptionPortal; 