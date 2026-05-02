const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Store = require('./models/Store');
const Listing = require('./models/Listing');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // 1. Find or Create the User's Test Seller Account
    const email = 'seller@test.com';
    let seller = await User.findOne({ email });
    if (!seller) {
      seller = await User.create({
        name: 'Test Seller',
        email: email,
        password: 'password123',
        phone: '0771234567',
        role: 'seller',
        address: '123 Main St, Colombo',
        district: 'Colombo'
      });
      console.log('Test Seller created');
    }

    // 2. Find or Create Store for this Seller
    let store = await Store.findOne({ seller: seller._id });
    if (!store) {
      store = await Store.create({
        seller: seller._id,
        name: 'My Test Music Store',
        businessName: 'Test Music Gear',
        description: 'Previously added items from my testing session.',
        location: 'Colombo',
        category: 'Musical Instruments',
        status: 'active'
      });
      console.log('Test Store created');
    }

    // 3. Clear ALL existing listings to ensure only the user's data remains
    await Listing.deleteMany({});
    console.log('All existing listings cleared');

    // 4. Add the User's Previously Entered Data
    const userListings = [
      {
        seller: seller._id,
        store: store._id,
        title: 'Samick Greg Bennett Electric Guitar',
        brand: 'Samick',
        category: 'Guitars',
        model: 'Greg Bennett',
        condition: 'Used',
        price: 45000,
        description: 'Excellent condition electric guitar. Great for beginners and intermediate players.',
        location: 'Kotte',
        district: 'Colombo',
        status: 'active',
        photos: ['uploads/listings/photos-1777722981934.jpg', 'uploads/listings/photos-1777722981952.jpg']
      },
      {
        seller: seller._id,
        store: store._id,
        title: 'Yamaha F310 Acoustic Guitar',
        brand: 'Yamaha',
        category: 'Guitars',
        model: 'F310',
        condition: 'Like New',
        price: 32000,
        description: 'The perfect acoustic guitar for anyone looking for quality and affordability.',
        location: 'Mount Lavinia',
        district: 'Colombo',
        status: 'active',
        photos: ['uploads/listings/photos-1777722981965.jpg']
      },
      {
        seller: seller._id,
        store: store._id,
        title: 'Pearl Export Series Drum Set',
        brand: 'Pearl',
        category: 'Drums',
        model: 'Export',
        condition: 'Used',
        price: 125000,
        description: 'The legendary Export series. Great sound and durability.',
        location: 'Dehiwala',
        district: 'Colombo',
        status: 'active',
        photos: ['uploads/listings/photos-1777731208689.jpg', 'uploads/listings/photos-1777731208717.jpg']
      }
    ];

    await Listing.insertMany(userListings);
    console.log(`${userListings.length} User Listings added to seller@test.com successfully!`);
    
    // Optional: Clean up the old official user if desired
    // await User.deleteOne({ email: 'official@gearlk.com' });

    process.exit();
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
};

seedData();
