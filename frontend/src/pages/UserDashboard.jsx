import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';

function UserDashboard() {
  const [foodItems, setFoodItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [message, setMessage] = useState('');
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [feedbackType, setFeedbackType] = useState('delay');
  const [feedbackRating, setFeedbackRating] = useState(3);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const name = localStorage.getItem('name') || 'User';

  async function fetchFood() {
    try {
      const response = await fetch('/api/food');
      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.message || 'Error loading food menu');
        return;
      }
      const data = await response.json();
      setFoodItems(data);
      if (data.length > 0 && !selectedFoodId) {
        setSelectedFoodId(data[0]._id);
      }
    } catch (error) {
      setMessage('Network error while loading food menu.');
      console.error('Fetch food error:', error);
    }
  }

  async function fetchOrders() {
    try {
      const response = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.message || 'Error loading orders');
        return;
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      setMessage('Network error while loading orders.');
      console.error('Fetch orders error:', error);
    }
  }

  useEffect(() => {
    fetchFood();
    fetchOrders();
  }, []);

  async function handleOrder(event) {
    event.preventDefault();
    setMessage('');
    const chosenFood = foodItems.find((item) => item._id === selectedFoodId);
    if (!chosenFood) {
      setMessage('Please choose a food item');
      return;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ foodName: chosenFood.name, price: chosenFood.price })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Order placed successfully');
        fetchOrders();
      } else {
        setMessage(data.message || 'Unable to place order');
      }
    } catch (error) {
      setMessage('Network error while placing order.');
      console.error('Place order error:', error);
    }
  }

  async function handleUpdateOrder(orderId) {
    setMessage('');
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ quantity: editQuantity })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Order updated successfully');
        setEditingOrderId(null);
        fetchOrders();
      } else {
        setMessage(data.message || 'Unable to update order');
      }
    } catch (error) {
      setMessage('Network error while updating order.');
      console.error('Update order error:', error);
    }
  }

  async function handleDeleteOrder(orderId) {
    setMessage('');
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setMessage('Order cancelled successfully');
        fetchOrders();
      } else {
        const data = await response.json();
        setMessage(data.message || 'Unable to cancel order');
      }
    } catch (error) {
      setMessage('Network error while cancelling order.');
      console.error('Delete order error:', error);
    }
  }

  async function handleSubmitFeedback(event) {
    event.preventDefault();
    setMessage('');
    
    if (!feedbackMessage.trim()) {
      setMessage('Please enter a feedback message');
      return;
    }

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type: feedbackType,
          rating: feedbackRating,
          message: feedbackMessage
        })
      });
      let data = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (parseError) {
          console.error('Failed to parse feedback response JSON:', parseError);
        }
      }

      if (response.ok) {
        setMessage('Feedback submitted successfully');
        setFeedbackMessage('');
        setFeedbackRating(3);
      } else if (response.status === 404) {
        setMessage('Feedback endpoint not found. Check that POST /api/feedback exists on the backend.');
      } else {
        setMessage(
          data?.message ||
            `Unable to submit feedback. Server responded with status ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      setMessage('Network error while submitting feedback.');
      console.error('Submit feedback error:', error);
    }
  }

  function startEditOrder(order) {
    setEditingOrderId(order._id);
    setEditQuantity(order.quantity || 1);
  }

  return (
    <div>
      <Navbar role="user" />
      <div className="page-content">
        <div className="hero-card fade-in">
          <h1>Welcome back, {name}</h1>
          <p>Discover delicious food options and place your order with ease</p>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🍽️ Food Menu</h2>
            <p className="card-subtitle">Choose from our delicious selection</p>
          </div>
          {foodItems.length === 0 ? (
            <p className="text-secondary text-center">No food items available yet.</p>
          ) : (
            <div className="food-grid">
              {foodItems.map((food) => (
                <div key={food._id} className={`food-card ${selectedFoodId === food._id ? 'selected' : ''}`} onClick={() => setSelectedFoodId(food._id)}>
                  <div className="food-image">
                    {food.image ? (
                      <img src={food.image} alt={food.name} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>
                  <div className="food-info">
                    <h3 className="food-name">{food.name}</h3>
                    <p className="food-price">${food.price.toFixed(2)}</p>
                    {selectedFoodId === food._id && (
                      <div className="selected-indicator">Selected</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {selectedFoodId && (
            <div className="form-actions" style={{ marginTop: 'var(--space-4)' }}>
              <button type="button" className="btn btn-primary" onClick={handleOrder}>
                Place Order for {foodItems.find(f => f._id === selectedFoodId)?.name}
              </button>
            </div>
          )}
          {message && message.includes('Order placed') && (
            <div className="message success fade-in">{message}</div>
          )}
          {message && !message.includes('Order placed') && !message.includes('updated') && !message.includes('cancelled') && !message.includes('Feedback') && (
            <div className="message error fade-in">{message}</div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📋 My Orders</h2>
            <p className="card-subtitle">Track and manage your food orders</p>
          </div>
          {orders.length === 0 ? (
            <p className="text-secondary text-center">No orders yet. Place your first order above!</p>
          ) : (
            <>
              <div className="table-container">
                <table className="styled-table">
                  <thead>
                    <tr>
                      <th>Food Item</th>
                      <th>Quantity</th>
                      <th>Total Price</th>
                      <th>Status</th>
                      <th>Order Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td className="font-medium">{order.foodName}</td>
                        <td>{order.quantity || 1}</td>
                        <td className="font-semibold">${(order.totalPrice || order.price).toFixed(2)}</td>
                        <td>
                          <span className={`status-badge ${
                            order.status === 'pending' ? 'status-pending' :
                            order.status === 'preparing' ? 'status-preparing' :
                            order.status === 'delivered' ? 'status-delivered' : ''
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="text-secondary">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => startEditOrder(order)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-accent"
                              onClick={() => handleDeleteOrder(order._id)}
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {editingOrderId && (
                <div className="card" style={{ marginTop: 'var(--space-6)' }}>
                  <div className="card-header">
                    <h3 className="card-title">Update Order Quantity</h3>
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Quantity</label>
                    <input
                      className="form-control"
                      type="number"
                      min="1"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="form-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleUpdateOrder(editingOrderId)}
                    >
                      Save Changes
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setEditingOrderId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          {(message.includes('updated') || message.includes('cancelled')) && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'} fade-in`}>
              {message}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">💬 Send Feedback</h2>
            <p className="card-subtitle">Help us improve by sharing your experience</p>
          </div>
          <form onSubmit={handleSubmitFeedback} className="form-grid">
            <div className="form-group">
              <label className="form-label">Feedback Type</label>
              <select
                className="form-select"
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
              >
                <option value="delay">Order Delay</option>
                <option value="quality">Food Quality</option>
                <option value="service">Service</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="text-2xl hover:scale-110 transition-transform"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: star <= feedbackRating ? '#ffd700' : '#e2e8f0'
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <span className="text-secondary font-medium">{feedbackRating}/5 stars</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Your Message</label>
              <textarea
                className="form-control"
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Please share your detailed feedback..."
                rows="4"
                required
                style={{ resize: 'vertical' }}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-accent">Submit Feedback</button>
            </div>
          </form>
          {message && message.includes('Feedback') && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'} fade-in`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
