import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [foodName, setFoodName] = useState('');
  const [price, setPrice] = useState('');
  const [foodImage, setFoodImage] = useState(null);
  const [message, setMessage] = useState('');
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [orderMessage, setOrderMessage] = useState('');
  const [orderMessageType, setOrderMessageType] = useState('success');

  function formatStatus(value) {
    const status = value ? value.toString().trim() : 'Pending';
    const lower = status.toLowerCase();
    if (lower === 'pending') return 'Pending';
    if (lower === 'preparing') return 'Preparing';
    if (lower === 'delivered') return 'Delivered';
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  async function fetchUsers() {
    try {
      const response = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.message || 'Error loading users');
        return;
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setMessage('Network error while loading users.');
      console.error('Fetch users error:', error);
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
      setOrders(data.map((order) => ({
        ...order,
        status: formatStatus(order.status)
      })));
    } catch (error) {
      setMessage('Network error while loading orders.');
      console.error('Fetch admin orders error:', error);
    }
  }

  async function fetchFoodItems() {
    try {
      const response = await fetch('/api/food', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.message || 'Error loading food items');
        return;
      }
      const data = await response.json();
      setFoodItems(data);
    } catch (error) {
      setMessage('Network error while loading food items.');
      console.error('Fetch food items error:', error);
    }
  }

  async function fetchFeedbacks() {
    try {
      const response = await fetch('/api/feedback', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) {
        if (response.status === 404) {
          setMessage('Feedback endpoint not found. Check that GET /api/feedback exists on the backend.');
          return;
        }
        let errorData = null;
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          try {
            errorData = await response.json();
          } catch (parseError) {
            console.error('Failed to parse feedback error response JSON:', parseError);
          }
        }
        setMessage(errorData?.message || `Error loading feedbacks (${response.status})`);
        return;
      }
      const data = await response.json();
      setFeedbacks(data);
    } catch (error) {
      setMessage('Network error while loading feedbacks.');
      console.error('Fetch feedbacks error:', error);
    }
  }

  useEffect(() => {
    fetchUsers();
    fetchOrders();
    fetchFoodItems();
    fetchFeedbacks();
  }, []);

  async function handleAddFood(event) {
    event.preventDefault();
    setMessage('');

    // Basic client-side validation
    if (!foodName.trim()) {
      setMessage('Food name is required');
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setMessage('Valid numeric price is required');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', foodName.trim());
      formData.append('price', price.toString()); // Send as string
      if (foodImage) {
        formData.append('image', foodImage);
      }

      console.log('Sending FormData:', {
        name: foodName.trim(),
        price: price.toString(),
        hasImage: !!foodImage
      });

      const response = await fetch('/api/food', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      let data;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (response.ok) {
        setMessage('Food item added successfully');
        setFoodName('');
        setPrice('');
        setFoodImage(null);
        fetchFoodItems();
      } else {
        setMessage(data.message || `Could not add food (${response.status})`);
        console.error('Add food failed:', data);
      }
    } catch (error) {
      setMessage('Network error while adding food.');
      console.error('Add food error:', error);
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    const normalizedStatus = formatStatus(newStatus);
    setUpdatingOrderId(orderId);
    setOrderMessage('');
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: normalizedStatus })
      });

      if (response.ok) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: normalizedStatus } : order
          )
        );
        await fetchOrders();
        setOrderMessageType('success');
        setOrderMessage('Order status updated successfully');
      } else {
        let data;
        try {
          data = await response.json();
        } catch (_) {
          data = { message: await response.text() };
        }
        setOrderMessageType('error');
        setOrderMessage(data.message || 'Unable to update status');
      }
    } catch (error) {
      setOrderMessageType('error');
      setOrderMessage('Network error while updating order status.');
      console.error('Update order status error:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function handleDeleteOrder(orderId) {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        fetchOrders();
      } else {
        const data = await response.json();
        setMessage(data.message || 'Unable to delete order');
      }
    } catch (error) {
      setMessage('Network error while deleting order.');
      console.error('Delete order error:', error);
    }
  }

  function handleEditFood(food) {
    setEditingFoodId(food._id);
    setEditName(food.name);
    setEditPrice(food.price);
    setEditQuantity(food.quantity || 0);
    setEditImage(null); // Reset image for new upload
    setMessage('');
  }

  function handleCancelEdit() {
    setEditingFoodId(null);
    setEditName('');
    setEditPrice('');
    setEditQuantity('');
    setEditImage(null);
    setMessage('');
  }

  async function handleUpdateFood(event) {
    event.preventDefault();
    setMessage('');

    // Basic client-side validation
    if (!editName.trim()) {
      setMessage('Food name is required');
      return;
    }
    if (!editPrice || isNaN(Number(editPrice)) || Number(editPrice) <= 0) {
      setMessage('Valid numeric price is required');
      return;
    }
    if (editQuantity < 0) {
      setMessage('Quantity cannot be negative');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', editName.trim());
      formData.append('price', editPrice.toString()); // Send as string
      formData.append('quantity', editQuantity.toString()); // Send as string
      if (editImage) {
        formData.append('image', editImage);
      }

      console.log('Sending update FormData:', {
        name: editName.trim(),
        price: editPrice.toString(),
        quantity: editQuantity.toString(),
        hasImage: !!editImage
      });

      const response = await fetch(`/api/food/${editingFoodId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      let data;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (response.ok) {
        setMessage('Food item updated successfully');
        setEditingFoodId(null);
        setEditName('');
        setEditPrice('');
        setEditQuantity('');
        setEditImage(null);
        fetchFoodItems();
      } else {
        setMessage(data.message || `Could not update food (${response.status})`);
        console.error('Update food failed:', data);
      }
    } catch (error) {
      setMessage('Network error while updating food.');
      console.error('Update food error:', error);
    }
  }

  async function handleDeleteFood(foodId) {
    if (window.confirm('Are you sure you want to delete this food item?')) {
      try {
        const response = await fetch(`/api/food/${foodId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          setMessage('Food item deleted successfully');
          fetchFoodItems();
        } else {
          const data = await response.json();
          setMessage(data.message || 'Unable to delete food');
        }
      } catch (error) {
        setMessage('Network error while deleting food.');
        console.error('Delete food error:', error);
      }
    }
  }

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || order.price), 0);

  return (
    <div>
      <Navbar role="admin" />
      <div className="page-content">
        <div className="hero-card fade-in">
          <h1>Admin Dashboard</h1>
          <p>Manage your food delivery system efficiently</p>
        </div>

        <div className="report-grid">
          <div className="stat-card">
            <h4>Total Users</h4>
            <div className="stat-number">{users.length}</div>
            <div className="stat-meta">Registered accounts</div>
          </div>
          <div className="stat-card">
            <h4>Total Orders</h4>
            <div className="stat-number">{orders.length}</div>
            <div className="stat-meta">All time orders</div>
          </div>
          <div className="stat-card highlight">
            <h4>Total Revenue</h4>
            <div className="stat-number">${totalRevenue.toFixed(2)}</div>
            <div className="stat-meta">Revenue generated</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🍽️ Add Food Item</h2>
            <p className="card-subtitle">Add new items to your menu</p>
          </div>
          <form onSubmit={handleAddFood} className="form-grid">
            <div className="form-group">
              <label className="form-label">Food Name</label>
              <input
                className="form-control"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="Enter food name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Price ($)</label>
              <input
                className="form-control"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Food Image</label>
              <input
                className="form-control"
                type="file"
                accept="image/*"
                onChange={(e) => setFoodImage(e.target.files[0])}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Add Food Item</button>
            </div>
          </form>
          {message && message.includes('Food item added') && (
            <div className="message success fade-in">{message}</div>
          )}
          {message && !message.includes('Food item added') && !message.includes('updated') && !message.includes('deleted') && (
            <div className="message error fade-in">{message}</div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📦 Food Stock Management</h2>
            <p className="card-subtitle">Manage your menu items and inventory</p>
          </div>
          {editingFoodId ? (
            <div>
              <div className="card-header">
                <h3 className="card-title">Edit Food Item</h3>
              </div>
              <form onSubmit={handleUpdateFood} className="form-grid">
                <div className="form-group">
                  <label className="form-label">Food Name</label>
                  <input
                    className="form-control"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter food name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input
                    className="form-control"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    className="form-control"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    type="number"
                    placeholder="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Update Image (optional)</label>
                  <input
                    className="form-control"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditImage(e.target.files[0])}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">Update Food</button>
                  <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {foodItems.length === 0 ? (
                <p className="text-secondary text-center">No food items added yet. Add your first item above!</p>
              ) : (
                <div className="table-container">
                  <table className="styled-table">
                    <thead>
                      <tr>
                        <th>Food Name</th>
                        <th>Price</th>
                        <th>Stock Quantity</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {foodItems.map((food) => (
                        <tr key={food._id}>
                          <td className="font-medium">{food.name}</td>
                          <td className="font-semibold">${food.price.toFixed(2)}</td>
                          <td>{food.quantity || 0}</td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleEditFood(food)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-accent"
                                onClick={() => handleDeleteFood(food._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
          {(message.includes('updated') || message.includes('deleted')) && (
            <div className={`message ${message.includes('success') ? 'success' : 'error'} fade-in`}>
              {message}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">👥 Registered Users</h2>
            <p className="card-subtitle">Overview of all user accounts</p>
          </div>
          {users.length === 0 ? (
            <p className="text-secondary text-center">No users registered yet.</p>
          ) : (
            <div className="table-container">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email Address</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="font-medium">{user.name}</td>
                      <td className="text-secondary">{user.email}</td>
                      <td>
                        <span className={`status-badge ${
                          user.role === 'admin' ? 'status-preparing' : 'status-delivered'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📋 Order Management</h2>
            <p className="card-subtitle">Track and manage all customer orders</p>
          </div>
          {orderMessage && (
            <div className={`message ${orderMessageType} fade-in`} style={{ margin: '0 1rem 1rem' }}>
              {orderMessage}
            </div>
          )}
          {orders.length === 0 ? (
            <p className="text-secondary text-center">No orders placed yet.</p>
          ) : (
            <div className="table-container">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Food Item</th>
                    <th>Quantity</th>
                    <th>Total Price</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="font-medium">{order.foodName}</td>
                      <td>{order.quantity || 1}</td>
                      <td className="font-semibold">${(order.totalPrice || order.price).toFixed(2)}</td>
                      <td className="text-secondary">{order.userId?.name || 'Unknown'}</td>
                      <td>
                        <select
                          className="form-select"
                          value={order.status || 'Pending'}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={updatingOrderId === order._id}
                          style={{ minWidth: '120px' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-accent"
                          onClick={() => handleDeleteOrder(order._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">💬 User Feedback</h2>
            <p className="card-subtitle">Customer reviews and suggestions</p>
          </div>
          {feedbacks.length === 0 ? (
            <p className="text-secondary text-center">No feedback received yet.</p>
          ) : (
            <div className="table-container">
              <table className="styled-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Rating</th>
                    <th>Message</th>
                    <th>Date</th>
                </tr>
                </thead>
                <tbody>
                  {feedbacks.map((feedback) => (
                    <tr key={feedback._id}>
                      <td className="font-medium">{feedback.userId?.name || 'Unknown'}</td>
                      <td>
                        <span className="status-badge status-preparing" style={{ textTransform: 'capitalize' }}>
                          {feedback.type}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className="text-lg"
                                style={{
                                  color: star <= feedback.rating ? '#ffd700' : '#e2e8f0'
                                }}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-secondary font-medium">{feedback.rating}/5</span>
                        </div>
                      </td>
                      <td style={{ maxWidth: '300px', wordWrap: 'break-word' }} className="text-secondary">
                        {feedback.message}
                      </td>
                      <td className="text-secondary">{new Date(feedback.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
