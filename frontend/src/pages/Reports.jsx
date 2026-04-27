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
        <div className="hero-card fade-in">
          <h1>📊 Analytics Dashboard</h1>
          <p>Comprehensive insights into your food delivery operations</p>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📈 Performance Reports</h2>
            <p className="card-subtitle">Track your business metrics and customer feedback</p>
          </div>

          <div className="report-header">
            <div className="flex items-center gap-4">
              <label htmlFor="reportType" className="form-label" style={{ margin: 0 }}>Report Period:</label>
              <select
                id="reportType"
                className="form-select"
                value={reportType}
                onChange={handleReportTypeChange}
                style={{ minWidth: '150px' }}
              >
                <option value="daily">Daily Report</option>
                <option value="weekly">Weekly Report</option>
                <option value="annual">Annual Report</option>
              </select>
            </div>
          </div>

          {message && <div className="message error fade-in">{message}</div>}

          {reportData ? (
            <div>
              <div className="report-grid">
                <div className="stat-card highlight">
                  <h4>🏆 Most Ordered</h4>
                  <div className="stat-number">{mostOrderedFood.name}</div>
                  <div className="stat-meta">{mostOrderedFood.totalQuantity} orders</div>
                </div>
                <div className="stat-card">
                  <h4>📦 Total Orders</h4>
                  <div className="stat-number">{reportData.summary.totalOrders}</div>
                  <div className="stat-meta">All orders</div>
                </div>
                <div className="stat-card">
                  <h4>💰 Total Revenue</h4>
                  <div className="stat-number">${reportData.summary.totalRevenue.toFixed(2)}</div>
                  <div className="stat-meta">Revenue generated</div>
                </div>
                <div className="stat-card">
                  <h4>✅ Delivered</h4>
                  <div className="stat-number">{reportData.summary.deliveredOrders}</div>
                  <div className="stat-meta">Completed orders</div>
                </div>
                <div className="stat-card">
                  <h4>⏳ Pending</h4>
                  <div className="stat-number">{reportData.summary.pendingOrders}</div>
                  <div className="stat-meta">In progress</div>
                </div>
                <div className="stat-card">
                  <h4>💬 Feedbacks</h4>
                  <div className="stat-number">{reportData.summary.totalFeedbacks}</div>
                  <div className="stat-meta">Customer reviews</div>
                </div>
                <div className="stat-card">
                  <h4>⭐ Avg Rating</h4>
                  <div className="stat-number">{reportData.summary.averageRating}/5</div>
                  <div className="stat-meta">Customer satisfaction</div>
                </div>
              </div>

              {reportData.foodStats.length > 0 && (
                <div className="card" style={{ marginTop: 'var(--space-8)' }}>
                  <div className="card-header">
                    <h3 className="card-title">🍽️ Food Performance</h3>
                    <p className="card-subtitle">Detailed statistics for each menu item</p>
                  </div>
                  <div className="table-container">
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
                            <td className="font-medium">{food.name}</td>
                            <td className="font-semibold">{food.totalQuantity}</td>
                            <td className="font-semibold text-secondary">${food.totalRevenue.toFixed(2)}</td>
                            <td>{food.orderCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {reportData.feedbackStats.length > 0 && (
                <div className="card" style={{ marginTop: 'var(--space-8)' }}>
                  <div className="card-header">
                    <h3 className="card-title">📊 Feedback Analysis</h3>
                    <p className="card-subtitle">Customer feedback breakdown by category</p>
                  </div>
                  <div className="table-container">
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
                            <td>
                              <span className="status-badge status-preparing" style={{ textTransform: 'capitalize' }}>
                                {feedback.type}
                              </span>
                            </td>
                            <td className="font-semibold">{feedback.count}</td>
                            <td>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{feedback.averageRating.toFixed(1)}/5</span>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                      key={star}
                                      className="text-sm"
                                      style={{
                                        color: star <= Math.round(feedback.averageRating) ? '#ffd700' : '#e2e8f0'
                                      }}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {reportData.recentOrders.length > 0 && (
                <div className="card" style={{ marginTop: 'var(--space-8)' }}>
                  <div className="card-header">
                    <h3 className="card-title">🕒 Recent Orders ({reportData.period.type})</h3>
                    <p className="card-subtitle">Latest order activity</p>
                  </div>
                  <div className="table-container">
                    <table className="styled-table">
                      <thead>
                        <tr>
                          <th>Food Item</th>
                          <th>Quantity</th>
                          <th>Total Price</th>
                          <th>Customer</th>
                          <th>Status</th>
                          <th>Order Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.recentOrders.map((order) => (
                          <tr key={order._id}>
                            <td className="font-medium">{order.foodName}</td>
                            <td>{order.quantity || 1}</td>
                            <td className="font-semibold">${(order.totalPrice || order.price).toFixed(2)}</td>
                            <td className="text-secondary">{order.userId?.name || 'Unknown'}</td>
                            <td>
                              <span className={`status-badge ${
                                order.status === 'pending' ? 'status-pending' :
                                order.status === 'preparing' ? 'status-preparing' :
                                order.status === 'delivered' ? 'status-delivered' : ''
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="text-secondary">{new Date(order.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {reportData.recentFeedbacks.length > 0 && (
                <div className="card" style={{ marginTop: 'var(--space-8)' }}>
                  <div className="card-header">
                    <h3 className="card-title">💬 Recent Feedback ({reportData.period.type})</h3>
                    <p className="card-subtitle">Latest customer reviews and suggestions</p>
                  </div>
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
                        {reportData.recentFeedbacks.map((feedback) => (
                          <tr key={feedback._id}>
                            <td className="font-medium">{feedback.userId?.name || 'Unknown'}</td>
                            <td>
                              <span className="status-badge status-preparing" style={{ textTransform: 'capitalize' }}>
                                {feedback.type}
                              </span>
                            </td>
                            <td>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{feedback.rating}/5</span>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                      key={star}
                                      className="text-sm"
                                      style={{
                                        color: star <= feedback.rating ? '#ffd700' : '#e2e8f0'
                                      }}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </td>
                            <td style={{ maxWidth: '300px', wordWrap: 'break-word' }} className="text-secondary">
                              {feedback.message}
                            </td>
                            <td className="text-secondary">{new Date(feedback.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-secondary">
              <div className="loading" style={{ width: '40px', height: '40px', margin: '0 auto var(--space-4) auto' }}></div>
              Loading report data...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;
