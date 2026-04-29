import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';

function Home() {
  const navigate = useNavigate();
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedQuantities, setSelectedQuantities] = useState({});

  useEffect(() => {
    fetchFoodItems();
  }, []);

  async function fetchFoodItems() {
    try {
      const response = await fetch('/api/food');
      if (!response.ok) {
        throw new Error('Failed to load food items');
      }
      const data = await response.json();
      setFoodItems(data);
      // Initialize quantities
      const quantities = {};
      data.forEach(food => {
        quantities[food._id] = 1;
      });
      setSelectedQuantities(quantities);
    } catch (error) {
      setMessage('Error loading food items');
      console.error('Fetch food error:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleQuantityChange(foodId, value) {
    setSelectedQuantities({
      ...selectedQuantities,
      [foodId]: Math.max(1, parseInt(value) || 1)
    });
  }

  function handleOrder(foodId) {
    console.log('Order button clicked for food:', foodId);
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);

    if (!token) {
      console.log('No token, redirecting to register');
      navigate('/register');
      return;
    }

    submitOrder(foodId);
  }

  async function submitOrder(foodId) {
    const foodItem = foodItems.find((item) => item._id === foodId);
    if (!foodItem) {
      console.error('Food item not found for order:', foodId);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          foodName: foodItem.name,
          price: foodItem.price,
          quantity: selectedQuantities[foodId] || 1
        })
      });

      if (response.ok) {
        setMessage('Order placed successfully! View your orders in dashboard.');
        setSelectedQuantities({ ...selectedQuantities, [foodId]: 1 });
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        console.error('Order error response:', errorData);
      }
    } catch (error) {
      console.error('Order error:', error);
    }
  }

  return (
    <div className="home-page">
      <Navbar />

      <main className="home-hero-section" id="home">
        <div className="container hero-grid">
          <section className="hero-copy-box">
            <span className="hero-badge">Delicious Food, Delivered to You</span>
            <h1 className="hero-title">Good Food<br></br> Good Mood</h1>
            <p className="hero-copy">
              FD Management System is your all-in-one solution to manage foods, orders, users, and feedbacks with effortless control and premium restaurant performance.
            </p>
            <div className="hero-actions">
              <Link to="/login" className="btn btn-orange btn-xl">Explore Foods</Link>
              <a href="#orders" className="btn btn-outline btn-xl">View Orders</a>
            </div>
          </section>

          <section className="hero-visual" aria-label="Premium food showcase">
            <div className="hero-visual-card">
              <img
                className="hero-main-image"
                src="https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1200&q=80"
                alt="Premium food plate"
              />
              <div className="hero-floating-card">
                <div className="hero-floating-icon">🚚</div>
                <div>
                  <p className="hero-floating-title">Fast Delivery</p>
                  <p className="hero-floating-text">Fresh & Hot At Your Doorstep</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {message && (
          <div className="notification-banner" style={{
            background: message.includes('Error') ? '#e53e3e' : '#38a169',
            color: 'white',
            padding: '1rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <section className="food-menu-section" id="menu">
          <div className="container">
            <div className="section-heading">
              <p className="section-label">Our Menu</p>
              <h2>Browse Our Delicious Foods</h2>
            </div>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#ffffff' }}>
                <p>Loading food items...</p>
              </div>
            ) : foodItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#ffffff' }}>
                <p>No food items available yet. Check back soon!</p>
              </div>
            ) : (
              <div className="food-grid">
                {foodItems.map(food => (
                  <article key={food._id} className="food-card">
                    <div className="food-image-container">
                      {(food.image || food.imageUrl) ? (
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
                      <p className="food-price">${food.price}</p>
                      <div className="order-controls">
                        <input
                          type="number"
                          min="1"
                          value={selectedQuantities[food._id] || 1}
                          onChange={(e) => handleQuantityChange(food._id, e.target.value)}
                          className="quantity-input"
                          aria-label="Quantity"
                        />
                        <button
                          onClick={() => handleOrder(food._id)}
                          className="btn btn-order"
                        >
                          Order
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="home-stats-card" id="foods">
          <div className="stats-grid">
            <article className="stat-card">
              <strong>50+</strong>
              <span>Delicious Foods</span>
            </article>
            <article className="stat-card">
              <strong>200+</strong>
              <span>Orders Managed</span>
            </article>
            <article className="stat-card">
              <strong>100+</strong>
              <span>Happy Users</span>
            </article>
            <article className="stat-card">
              <strong>98%</strong>
              <span>Positive Feedback</span>
            </article>
          </div>
        </div>
      </main>

      <section className="feature-section" id="about">
        <div className="section-heading">
          <p className="section-label">Our Features</p>
          <h2>Everything You Need, All in One Place</h2>
        </div>
        <div className="container feature-grid">
          <article className="feature-card">
            <div className="feature-icon">🍽️</div>
            <h3>Manage Foods</h3>
            <p>Update menu items and keep inventory fresh with real-time control.</p>
          </article>
          <article className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>Track Orders</h3>
            <p>Monitor all orders from kitchen to delivery with live status updates.</p>
          </article>
          <article className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>User Management</h3>
            <p>Manage users, roles, and keep your restaurant operating smoothly.</p>
          </article>
          <article className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Feedback System</h3>
            <p>Collect customer reviews and improve service with actionable insights.</p>
          </article>
        </div>
      </section>

      <section className="banner-cta" id="orders">
        <div className="banner-left">
          <img
            className="banner-image"
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80"
            alt="Signature burger dish"
          />
          <div className="banner-copy">
            <p className="banner-label">Hungry? Let’s Get Started!</p>
            <p>Explore our delicious menu and enjoy your favorite meals today.</p>
          </div>
        </div>
        <div className="banner-center">
          <Link to="/login" className="btn btn-orange btn-xl">Explore Foods →</Link>
        </div>
        <div className="banner-right">
          <p className="banner-small-label">Today's Special</p>
          <p className="banner-special">Hot & Spicy Chicken Pizza</p>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="section-heading">
          <p className="section-label">Contact Us</p>
          <h2>Get in Touch</h2>
        </div>
        <div className="container contact-grid">
          <div className="contact-card">
            <h3>Customer Support</h3>
            <p>If you need help placing an order or tracking delivery, our team is here for you.</p>
            <p className="contact-info">support@fdmanagement.com</p>
            <p className="contact-info">+250 (795) 490-444</p>
          </div>
          <div className="contact-card">
            <h3>Business Inquiries</h3>
            <p>Interested in partnership or bulk orders? Reach out and we’ll get back to you quickly.</p>
            <p className="contact-info">tuyubahejosue@outlook.com</p>
            <p className="contact-info">+250 (783) 973-378</p>
          </div>
        </div>
      </section>

      <section className="footer-social-section">
        <div className="container">
          <div className="social-wrapper">
            <h3>Follow Us</h3>
            <p>Connect with us on social media for updates and exclusive offers</p>
            <div className="social-links">
              <a href="https://www.youtube.com/@Eduempire-z9p" target="_blank" rel="noopener noreferrer" className="social-link youtube" aria-label="YouTube">
                <span className="social-icon">▶</span>
                <span>YouTube</span>
              </a>
              <a href="https://www.instagram.com/really_josue2007/" target="_blank" rel="noopener noreferrer" className="social-link instagram" aria-label="Instagram">
                <span className="social-icon">📷</span>
                <span>Instagram</span>
              </a>
              <a href="https://www.facebook.com/JoshvibesVid" target="_blank" rel="noopener noreferrer" className="social-link facebook" aria-label="Facebook">
                <span className="social-icon">f</span>
                <span> Facebook</span>
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 FD Management System. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
