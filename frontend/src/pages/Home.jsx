import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

function Home() {
  return (
    <div className="home-page">
      <Navbar />

      <main className="home-hero-section" id="home">
        <div className="container hero-grid">
          <section className="hero-copy-box">
            <span className="hero-badge">Delicious Food, Delivered to You</span>
            <h1 className="hero-title">Good Food, Good Mood</h1>
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
            <p className="contact-info">+1 (555) 123-4567</p>
          </div>
          <div className="contact-card">
            <h3>Business Inquiries</h3>
            <p>Interested in partnership or bulk orders? Reach out and we’ll get back to you quickly.</p>
            <p className="contact-info">business@fdmanagement.com</p>
            <p className="contact-info">+1 (555) 987-6543</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
