import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [foodName, setFoodName] = useState('');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editQuantity, setEditQuantity] = useState('');

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
      setOrders(data);
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

  useEffect(() => {
    fetchUsers();
    fetchOrders();
    fetchFoodItems();
  }, []);

  async function handleAddFood(event) {
    event.preventDefault();
    setMessage('');
    try {
      const response = await fetch('/api/food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: foodName, price: Number(price) })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Food item added');
        setFoodName('');
        setPrice('');
      } else {
        setMessage(data.message || 'Could not add food');
      }
    } catch (error) {
      setMessage('Network error while adding food.');
      console.error('Add food error:', error);
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        fetchOrders();
      } else {
        const data = await response.json();
        setMessage(data.message || 'Unable to update status');
      }
    } catch (error) {
      setMessage('Network error while updating order status.');
      console.error('Update order status error:', error);
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
    setMessage('');
  }

  function handleCancelEdit() {
    setEditingFoodId(null);
    setEditName('');
    setEditPrice('');
    setEditQuantity('');
    setMessage('');
  }

  async function handleUpdateFood(event) {
    event.preventDefault();
    setMessage('');
    try {
      const response = await fetch(`/api/food/${editingFoodId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: editName,
          price: Number(editPrice),
          quantity: Number(editQuantity)
        })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Food item updated successfully');
        setEditingFoodId(null);
        setEditName('');
        setEditPrice('');
        setEditQuantity('');
        fetchFoodItems();
      } else {
        setMessage(data.message || 'Could not update food');
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
        <section className="summary-grid">
          <div className="summary-card">
            <h4>Total Users</h4>
            <p>{users.length}</p>
          </div>
          <div className="summary-card">
            <h4>Total Orders</h4>
            <p>{orders.length}</p>
          </div>
          <div className="summary-card">
            <h4>Total Revenue</h4>
            <p>${totalRevenue.toFixed(2)}</p>
          </div>
        </section>

        <section className="card">
          <h3>Add Food Item</h3>
          <form onSubmit={handleAddFood} className="form-grid">
            <label>
              Name
              <input value={foodName} onChange={(e) => setFoodName(e.target.value)} required />
            </label>
            <label>
              Price
              <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" required />
            </label>
            <button type="submit">Add Food</button>
          </form>
          {message && <div className="message">{message}</div>}
        </section>

        <section className="card">
          <h3>Food Stock Management</h3>
          {editingFoodId ? (
            <div className="edit-form-container">
              <h4>Edit Food Item</h4>
              <form onSubmit={handleUpdateFood} className="form-grid">
                <label>
                  Name
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} required />
                </label>
                <label>
                  Price
                  <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} type="number" step="0.01" required />
                </label>
                <label>
                  Quantity
                  <input value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} type="number" required />
                </label>
                <div className="form-inline">
                  <button type="submit">Update Food</button>
                  <button type="button" className="button-secondary" onClick={handleCancelEdit}>Cancel</button>
                </div>
              </form>
              {message && <div className="message">{message}</div>}
            </div>
          ) : (
            <>
              {foodItems.length === 0 ? (
                <p>No food items added yet.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foodItems.map((food) => (
                      <tr key={food._id}>
                        <td>{food.name}</td>
                        <td>${food.price.toFixed(2)}</td>
                        <td>{food.quantity || 0}</td>
                        <td>
                          <button className="btn-edit" onClick={() => handleEditFood(food)}>
                            Edit
                          </button>
                          <button className="btn-delete" onClick={() => handleDeleteFood(food._id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {message && <div className="message">{message}</div>}
            </>
          )}
        </section>

        <section className="card">
          <h3>Users</h3>
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card">
          <h3>Orders</h3>
          {orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Food</th>
                  <th>Quantity</th>
                  <th>Total Price</th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.foodName}</td>
                    <td>{order.quantity || 1}</td>
                    <td>${(order.totalPrice || order.price).toFixed(2)}</td>
                    <td>{order.userId?.name || 'Unknown'}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        <option>Pending</option>
                        <option>Preparing</option>
                        <option>Delivered</option>
                      </select>
                    </td>
                    <td>
                      <button className="button-secondary" onClick={() => handleDeleteOrder(order._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
