const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const foodRoutes = require('./routes/food');
const orderRoutes = require('./routes/orders');
const feedbackRoutes = require('./routes/feedback');
const reportRoutes = require('./routes/reports');
const User = require('./models/User');
const Food = require('./models/Food');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error('Missing MONGO_URI in .env');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET in .env');
  process.exit(1);
}

app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
  res.send('FD Management System API is running');
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Express error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

async function seedDefaultAdminAndFood() {
  try {
    const adminEmail = 'tuyubahejosue@outlook.com';
    const hashedPassword = await bcrypt.hash('Josh@123', 10);
    await User.findOneAndUpdate(
      { email: adminEmail },
      {
        name: 'Admin User',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      },
      { upsert: true, new: true }
    );
    console.log('Default admin set: tuyubahejosue@outlook.com / Josh@123');

    const foodCount = await Food.countDocuments();
    if (foodCount === 0) {
      await Food.create([
        { name: 'Cheese Sandwich', price: 4.5 },
        { name: 'Fruit Salad', price: 3.0 },
        { name: 'Veggie Pizza', price: 6.5 }
      ]);
      console.log('Sample food items seeded');
    }
  } catch (error) {
    console.error('Seeding error:', error.message);
  }
}

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    seedDefaultAdminAndFood();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
  });
