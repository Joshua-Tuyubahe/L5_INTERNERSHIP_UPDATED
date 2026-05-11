import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Toast from '../components/Toast.jsx';
import StarRating from '../components/StarRating.jsx';

function UserDashboard() {
  console.log('UserDashboard component is being rendered');
  const [foodItems, setFoodItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedFoodIds, setSelectedFoodIds] = useState([]);
  const [foodQuantities, setFoodQuantities] = useState({});
  const [message, setMessage] = useState('');
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [feedbackType, setFeedbackType] = useState('delay');
  const [feedbackRating, setFeedbackRating] = useState(3);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const name = localStorage.getItem('name') || 'User';
  const navigate = useNavigate();

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    notificationsRef.current = notifications;
    const unreadCount = notifications.filter((item) => !item.read).length;
    setNotificationCount(unreadCount);
    localStorage.setItem('fdms_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    const saved = localStorage.getItem('fdms_notifications');
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        setNotifications(parsed.map((notification) => ({
          ...notification,
          read: notification.read ?? false,
          time: notification.time || (notification.createdAt ? new Date(notification.createdAt).toLocaleString() : new Date().toLocaleString())
        })));
      }
    } catch (error) {
      console.error('Failed to parse saved notifications:', error);
    }
  }, []);

  function addLocalNotification(notification) {
    setNotifications((prev) => {
      const exists = prev.some((item) => item._id === notification._id || item.id === notification.id || item.message === notification.message && item.details === notification.details);
      if (exists) return prev;
      return [
        {
          _id: notification._id || `local-${Date.now()}-${Math.random()}`,
          message: notification.message,
          details: notification.details,
          type: notification.type || 'info',
          read: false,
          time: notification.time || new Date().toLocaleString()
        },
        ...prev
      ];
    });
  }

  async function markAllNotificationsRead() {
    const unreadNotifications = notifications.filter((notification) => !notification.read);
    if (unreadNotifications.length === 0) return;

    await Promise.all(
      unreadNotifications.map((notification) =>
        fetch(`/api/notifications/${notification._id}/read`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
      )
    );

    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  }

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
      // No default selection for multiple items
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

  async function fetchNotifications() {
    try {
      const response = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) {
        console.error('Error loading notifications');
        return;
      }
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Fetch notifications error:', error);
    }
  }

  async function handleNotificationClick() {
    setIsNotificationsOpen((open) => !open);
    await markAllNotificationsRead();
  }

  useEffect(() => {
    fetchFood();
    fetchOrders();
    fetchNotifications();

    const refreshInterval = setInterval(() => {
      fetchOrders();
      fetchNotifications();
    }, 5000);

    function handleFocus() {
      fetchOrders();
      fetchNotifications();
    }

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  async function handleOrder(event) {
    event.preventDefault();
    setMessage('');
    if (selectedFoodIds.length === 0) {
      setMessage('Please select at least one food item');
      return;
    }

    try {
      const orderPromises = selectedFoodIds.map(async (foodId) => {
        const chosenFood = foodItems.find((item) => item._id === foodId);
        const quantity = foodQuantities[foodId] || 1;
        if (!chosenFood) return;

        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ foodName: chosenFood.name, price: chosenFood.price, quantity })
        });
        return response.json();
      });

      const results = await Promise.all(orderPromises);
      const successes = results.filter(result => result && !result.error);
      const failures = results.filter(result => result && result.error);

      if (successes.length > 0) {
        setMessage(`${successes.length} order(s) placed successfully`);
        setSelectedFoodIds([]);
        setFoodQuantities({});
        fetchOrders();
        setTimeout(() => setMessage(''), 3000);
      }
      if (failures.length > 0) {
        setMessage(`Some orders failed: ${failures.map(f => f.message).join(', ')}`);
      }
    } catch (error) {
      setMessage('Network error while placing orders.');
      console.error('Place orders error:', error);
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
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.message || 'Unable to update order');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Network error while updating order.');
      setTimeout(() => setMessage(''), 3000);
      console.error('Update order error:', error);
    }
  }

  async function handleDeleteOrder(orderId) {
    setOrderToCancel(orderId);
    setShowCancelModal(true);
  }

  async function confirmCancelOrder() {
    if (!orderToCancel) return;
    
    try {
      const response = await fetch(`/api/orders/${orderToCancel}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        showToast('Order cancelled successfully', 'success');
        fetchOrders();
      } else {
        const data = await response.json();
        showToast(data.message || 'Unable to cancel order', 'error');
      }
    } catch (error) {
      showToast('Network error while cancelling order.', 'error');
      console.error('Delete order error:', error);
    } finally {
      setShowCancelModal(false);
      setOrderToCancel(null);
    }
  }

  function cancelCancelOrder() {
    setShowCancelModal(false);
    setOrderToCancel(null);
  }

  function showToast(message, type = 'success') {
    setToast({ message, type, visible: true });
  }

  function hideToast() {
    setToast((prev) => ({ ...prev, visible: false }));
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
        setTimeout(() => setMessage(''), 3000);
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
      <Navbar
        showNotification={true}
        notificationCount={notificationCount}
        isNotificationsOpen={isNotificationsOpen}
        onNotificationClick={handleNotificationClick}
        notifications={notifications}
      />

      <Toast message={toast.message} type={toast.type} visible={toast.visible} onClose={hideToast} />

      <div className="page-content">
        <div className="hero-card fade-in">
          <h1>Welcome, {name}</h1>
          <p>Manage your orders, explore new menu items, and track your notifications from one place.</p>
        </div>

        {message && (
          <div style={{ padding: '15px 20px', margin: '20px', backgroundColor: '#d4edda', color: '#155724', border: '1px solid #c3e6cb', borderRadius: '4px' }}>
            {message}
          </div>
        )}

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Food Menu Section */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#333' }}>Food Menu</h2>
          <form onSubmit={handleOrder}>
            <div className="food-grid">
              {foodItems.map((food) => (
                <article key={food._id} className="food-card">
                  <div className="food-image-container">
                    {food.image || food.imageUrl ? (
                      <img 
                        src={food.image || food.imageUrl} 
                        alt={food.name} 
                        className="food-image"
                      />
                    ) : (
                      <div className="food-image-placeholder">No Image</div>
                    )}
                  </div>
                  <div className="food-details">
                    <h3 className="food-name">{food.name}</h3>
                    <p className="food-price">${food.price.toFixed(2)}</p>
                    <div style={{ marginTop: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
                        <input
                          type="checkbox"
                          checked={selectedFoodIds.includes(food._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFoodIds([...selectedFoodIds, food._id]);
                              setFoodQuantities({ ...foodQuantities, [food._id]: 1 });
                            } else {
                              setSelectedFoodIds(selectedFoodIds.filter((id) => id !== food._id));
                              const { [food._id]: removed, ...rest } = foodQuantities;
                              setFoodQuantities(rest);
                            }
                          }}
                        />
                        <span style={{ fontSize: '14px' }}>Select</span>
                      </label>
                      {selectedFoodIds.includes(food._id) && (
                        <input
                          type="number"
                          min="1"
                          value={foodQuantities[food._id] || 1}
                          onChange={(e) =>
                            setFoodQuantities({ ...foodQuantities, [food._id]: parseInt(e.target.value) || 1 })
                          }
                          style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
                          placeholder="Qty"
                        />
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <button 
              type="submit" 
              style={{ marginTop: '20px', padding: '12px 30px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
            >
              Place Order ({selectedFoodIds.length} items)
            </button>
          </form>
        </div>

        {/* Orders Section */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', margin: 0, color: '#333' }}>My Orders</h2>
            <Link 
              to="/reports" 
              style={{ padding: '10px 20px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold' }}
            >
              📊 View Reports
            </Link>
          </div>
          {orders.length === 0 ? (
            <p style={{ color: '#666', padding: '20px', backgroundColor: 'white', borderRadius: '4px', textAlign: 'center' }}>No orders yet. Select items from the menu above.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {orders.map((order) => (
                <div key={order._id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>{order.foodName}</h3>
                    <span style={{ padding: '5px 15px', backgroundColor: '#e8f5e9', color: '#27ae60', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                  <div style={{ marginBottom: '15px', color: '#666' }}>
                    <p style={{ margin: '5px 0' }}><strong>Quantity:</strong> {order.quantity}</p>
                    <p style={{ margin: '5px 0' }}><strong>Price:</strong> ${(order.price * order.quantity).toFixed(2)}</p>
                    <p style={{ margin: '5px 0' }}><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  {editingOrderId === order._id ? (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="1"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                        style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                      />
                      <button 
                        onClick={() => handleUpdateOrder(order._id)} 
                        style={{ padding: '8px 15px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setEditingOrderId(null)} 
                        style={{ padding: '8px 15px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => startEditOrder(order)} 
                        style={{ flex: 1, padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteOrder(order._id)} 
                        style={{ flex: 1, padding: '10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback Section */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#333' }}>Send Feedback</h2>
          <form onSubmit={handleSubmitFeedback} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Feedback Type</label>
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
              >
                <option value="delay">Delay</option>
                <option value="quality">Quality</option>
                <option value="service">Service</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Rating</label>
              <StarRating rating={feedbackRating} onRatingChange={setFeedbackRating} size="32px" />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Message</label>
              <textarea
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                placeholder="Share your feedback..."
                rows="4"
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px', fontFamily: 'Arial, sans-serif' }}
              />
            </div>

            <button 
              type="submit" 
              style={{ padding: '12px 30px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
            >
              Submit Feedback
            </button>
          </form>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowCancelModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              textAlign: 'center',
              maxWidth: '400px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, color: '#333' }}>Cancel Order</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>Are you sure you want to cancel this order?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={confirmCancelOrder}
                style={{ padding: '10px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Yes, Cancel Order
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{ padding: '10px 20px', backgroundColor: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                No, Keep Order
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default UserDashboard;
