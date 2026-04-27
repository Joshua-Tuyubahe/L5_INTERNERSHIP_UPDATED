import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';

function Reports() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');

  async function fetchOrders() {
    try {
      const response = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.message || 'Error loading report data');
        return;
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      setMessage('Network error while loading report data.');
      console.error('Fetch reports error:', error);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.price, 0);
  const mostOrdered = orders.reduce((result, order) => {
    result[order.foodName] = (result[order.foodName] || 0) + 1;
    return result;
  }, {});

  const mostOrderedItem = Object.keys(mostOrdered).reduce((best, item) => {
    return mostOrdered[item] > (mostOrdered[best] || 0) ? item : best;
  }, 'No orders yet');

  return (
    <div>
      <Navbar role="admin" />
      <div className="page-content">
        <section className="card">
          <h2>Reports</h2>
          <div className="report-grid">
            <div className="report-card">
              <h4>Total Orders</h4>
              <p>{totalOrders}</p>
            </div>
            <div className="report-card">
              <h4>Total Revenue</h4>
              <p>${totalRevenue.toFixed(2)}</p>
            </div>
            <div className="report-card">
              <h4>Most Ordered Item</h4>
              <p>{mostOrderedItem}</p>
            </div>
          </div>
        </section>

        <section className="card">
          <h3>Order List</h3>
          {message && <div className="message error">{message}</div>}
          {orders.length === 0 ? (
            <p>No order data available.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Food</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.foodName}</td>
                    <td>${order.price.toFixed(2)}</td>
                    <td>{order.status}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
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

export default Reports;
