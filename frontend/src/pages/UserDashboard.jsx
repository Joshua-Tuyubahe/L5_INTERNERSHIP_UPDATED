import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';

function UserDashboard() {
  const [foodItems, setFoodItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [message, setMessage] = useState('');
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);
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

  function startEditOrder(order) {
    setEditingOrderId(order._id);
    setEditQuantity(order.quantity || 1);
  }

  return (
    <div>
      <Navbar role="user" />
      <div className="page-content">
        <section className="hero-card">
          <h2>Welcome back, {name}</h2>
          <p>Choose a food item and place your order.</p>
        </section>

        <section className="card">
          <h3>Food Menu</h3>
          <form onSubmit={handleOrder} className="form-inline">
            <select value={selectedFoodId} onChange={(e) => setSelectedFoodId(e.target.value)}>
              {foodItems.map((food) => (
                <option key={food._id} value={food._id}>
                  {food.name} - ${food.price.toFixed(2)}
                </option>
              ))}
            </select>
            <button type="submit">Place Order</button>
          </form>
          {message && <div className="message">{message}</div>}
        </section>

        <section className="card">
          <h3>My Orders</h3>
          {orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Food</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>{order.foodName}</td>
                      <td>{order.quantity || 1}</td>
                      <td>${(order.totalPrice || order.price).toFixed(2)}</td>
                      <td>{order.status}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="btn-edit" 
                          onClick={() => startEditOrder(order)}
                          style={{ marginRight: '8px' }}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-delete" 
                          onClick={() => handleDeleteOrder(order._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {editingOrderId && (
                <div className="edit-form" style={{ marginTop: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
                  <h4>Update Order Quantity</h4>
                  <label>
                    Quantity:
                    <input
                      type="number"
                      min="1"
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                      style={{ marginLeft: '10px', padding: '5px' }}
                    />
                  </label>
                  <br />
                  <button 
                    onClick={() => handleUpdateOrder(editingOrderId)}
                    style={{ marginTop: '15px', marginRight: '10px', backgroundColor: '#4CAF50', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={() => setEditingOrderId(null)}
                    style={{ marginTop: '15px', backgroundColor: '#f44336', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default UserDashboard;
