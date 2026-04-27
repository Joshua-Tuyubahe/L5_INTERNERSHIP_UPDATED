import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';

function Reports() {
  const [reportType, setReportType] = useState('daily');
  const [reportData, setReportData] = useState(null);
  const [message, setMessage] = useState('');

  const mostOrderedFood = reportData?.foodStats?.reduce((best, item) => {
    return item.totalQuantity > (best.totalQuantity || 0) ? item : best;
  }, { name: 'No orders yet', totalQuantity: 0 });

  async function fetchReports(type = reportType) {
    try {
      const response = await fetch(`/api/reports?type=${type}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.message || 'Error loading report');
        return;
      }
      const data = await response.json();
      setReportData(data);
      setMessage('');
    } catch (error) {
      setMessage('Network error while loading report.');
      console.error('Fetch reports error:', error);
    }
  }

  useEffect(() => {
    fetchReports();
  }, []);

  async function handleReportTypeChange(event) {
    const newType = event.target.value;
    setReportType(newType);
    await fetchReports(newType);
  }

  return (
    <div>
      <Navbar role="admin" />
      <div className="page-content">
        <section className="card">
          <h2>Reports</h2>
          <div className="report-header">
            <div>
              <label htmlFor="reportType" style={{ marginRight: '10px', fontWeight: 'bold' }}>Report Type:</label>
              <select
                id="reportType"
                value={reportType}
                onChange={handleReportTypeChange}
              >
                <option value="daily">Daily Report</option>
                <option value="weekly">Weekly Report</option>
                <option value="annual">Annual Report</option>
              </select>
            </div>
          </div>

          {message && <div className="message error" style={{ marginBottom: '20px' }}>{message}</div>}

          {reportData ? (
            <div>
              <div className="report-grid" style={{ marginBottom: '30px' }}>
                <div className="stat-card highlight">
                  <h4>Most Ordered Food</h4>
                  <p className="stat-number">{mostOrderedFood.name}</p>
                  <p className="stat-meta">{mostOrderedFood.totalQuantity} orders</p>
                </div>
                <div className="stat-card">
                  <h4>Total Orders</h4>
                  <p className="stat-number">{reportData.summary.totalOrders}</p>
                </div>
                <div className="stat-card">
                  <h4>Total Revenue</h4>
                  <p className="stat-number">${reportData.summary.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="stat-card">
                  <h4>Delivered Orders</h4>
                  <p className="stat-number">{reportData.summary.deliveredOrders}</p>
                </div>
                <div className="stat-card">
                  <h4>Pending Orders</h4>
                  <p className="stat-number">{reportData.summary.pendingOrders}</p>
                </div>
                <div className="stat-card">
                  <h4>Total Feedbacks</h4>
                  <p className="stat-number">{reportData.summary.totalFeedbacks}</p>
                </div>
                <div className="stat-card">
                  <h4>Average Rating</h4>
                  <p className="stat-number">{reportData.summary.averageRating}/5</p>
                </div>
              </div>

              {reportData.foodStats.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                  <h3>Food Item Statistics</h3>
                  <table className="styled-table">
                    <thead>
                      <tr>
                        <th>Food Item</th>
                        <th>Total Quantity</th>
                        <th>Total Revenue</th>
                        <th>Order Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.foodStats.map((food, index) => (
                        <tr key={index}>
                          <td>{food.name}</td>
                          <td>{food.totalQuantity}</td>
                          <td>${food.totalRevenue.toFixed(2)}</td>
                          <td>{food.orderCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {reportData.feedbackStats.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                  <h3>Feedback Statistics</h3>
                  <table className="styled-table">
                    <thead>
                      <tr>
                        <th>Feedback Type</th>
                        <th>Count</th>
                        <th>Average Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.feedbackStats.map((feedback, index) => (
                        <tr key={index}>
                          <td style={{ textTransform: 'capitalize' }}>{feedback.type}</td>
                          <td>{feedback.count}</td>
                          <td>{feedback.averageRating.toFixed(1)}/5</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {reportData.recentOrders.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                  <h3>Recent Orders ({reportData.period.type})</h3>
                  <table className="styled-table">
                    <thead>
                      <tr>
                        <th>Food</th>
                        <th>Quantity</th>
                        <th>Total Price</th>
                        <th>User</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td>{order.foodName}</td>
                          <td>{order.quantity || 1}</td>
                          <td>${(order.totalPrice || order.price).toFixed(2)}</td>
                          <td>{order.userId?.name || 'Unknown'}</td>
                          <td>{order.status}</td>
                          <td>{new Date(order.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {reportData.recentFeedbacks.length > 0 && (
                <div>
                  <h3>Recent Feedbacks ({reportData.period.type})</h3>
                  <table className="styled-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Type</th>
                        <th>Rating</th>
                        <th>Message</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.recentFeedbacks.map((feedback) => (
                        <tr key={feedback._id}>
                          <td>{feedback.userId?.name || 'Unknown'}</td>
                          <td style={{ textTransform: 'capitalize' }}>{feedback.type}</td>
                          <td>{feedback.rating}/5</td>
                          <td style={{ maxWidth: '300px', wordWrap: 'break-word' }}>{feedback.message}</td>
                          <td>{new Date(feedback.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <p>Loading report data...</p>
          )}
        </section>
      </div>
    </div>
  );
}

export default Reports;
