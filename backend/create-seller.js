const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createSeller = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'seller@test.com';
    
    // Remove existing test seller if any
    await User.deleteMany({ email });

    const seller = await User.create({
      name: 'Test Seller',
      email: email,
      password: 'password123',
      phone: '0771234567',
      role: 'seller',
      address: '123 Main St',
      district: 'Colombo'
    });

    console.log('Seller created successfully:');
    console.log('Email:', seller.email);
    console.log('Password: password123');
    console.log('Role:', seller.role);

    process.exit();
  } catch (error) {
    console.error('Error creating seller:', error.message);
    process.exit(1);
  }
};

createSeller();
