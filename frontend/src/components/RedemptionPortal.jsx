import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ShippingAddressModal from './ShippingAddressModal';

const RedemptionPortal = ({ preview = false }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'merchandise', name: 'Merchandise' },
    { id: 'vouchers', name: 'Vouchers' },
    { id: 'experiences', name: 'Experiences' },
    { id: 'donations', name: 'Donations' }
  ];

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const [itemsResponse, pointsResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/redemption/items', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/users/points', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (Array.isArray(itemsResponse.data)) {
        // Sort by points required and take first 3 for preview
        const sortedItems = itemsResponse.data.sort((a, b) => a.points_required - b.points_required);
        setItems(sortedItems);
        setUserPoints(pointsResponse.data.points);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleRedeem = (item) => {
    if (userPoints < item.points_required) {
      setError(`Insufficient points. You need ${item.points_required} points but have ${userPoints}`);
      return;
    }
    setSelectedItem(item);
    setShowRedemptionModal(true);
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
      setShowRedemptionModal(false);
      await fetchInitialData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to redeem item');
    }
  };

  // Filter items based on selected category
  const displayItems = items.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  // Preview mode shows only first 3 items
  const previewItems = preview ? displayItems.slice(0, 3) : displayItems;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          {preview ? 'Featured Rewards' : 'Rewards Shop'}
        </h2>
        {preview && (
          <button
            onClick={() => navigate('/redemption')}
            className="text-green-600 hover:text-green-700 font-medium flex items-center"
          >
            View All Rewards
            <svg 
              className="w-5 h-5 ml-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </button>
        )}
      </div>

      {!preview && (
        <div className="mb-6">
          <div className="flex space-x-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg ${
                  selectedCategory === category.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {previewItems.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                    onClick={() => handleRedeem(item)}
                    disabled={userPoints < item.points_required || item.stock <= 0}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      userPoints >= item.points_required && item.stock > 0
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {item.stock <= 0 ? 'Out of Stock' : 'Redeem'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showRedemptionModal && selectedItem && (
        <ShippingAddressModal
          itemName={selectedItem.name}
          pointsRequired={selectedItem.points_required}
          onSubmit={handleRedemptionSubmit}
          onClose={() => setShowRedemptionModal(false)}
        />
      )}
    </div>
  );
};

export default RedemptionPortal; 