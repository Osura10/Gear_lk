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

    // 1. Create or Find Official Seller
    let seller = await User.findOne({ email: 'official@gearlk.com' });
    if (!seller) {
      seller = await User.create({
        name: 'GearLK Official Store',
        email: 'official@gearlk.com',
        password: 'password123',
        phone: '0112345678',
        role: 'seller',
        address: 'Main Street, Colombo',
        district: 'Colombo'
      });
      console.log('Official Seller created');
    }

    // 2. Create or Find Store
    let store = await Store.findOne({ seller: seller._id });
    if (!store) {
      store = await Store.create({
        seller: seller._id,
        name: 'GearLK Premium Gear',
        businessName: 'GearLK Official Store',
        description: 'The official marketplace for high-end musical instruments in Sri Lanka.',
        location: 'Colombo',
        category: 'Musical Instruments',
        status: 'active'
      });
      console.log('Official Store created');
    }

    // 3. Clear existing listings to ensure a clean default data set
    await Listing.deleteMany({});
    console.log('Existing listings cleared');

    // 4. Create Default Listings (including official and user's previous data)
    const defaultListings = [
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
        title: 'Fender Stratocaster American Professional II',
        brand: 'Fender',
        category: 'Guitars',
        model: 'Stratocaster',
        condition: 'Brand New',
        price: 450000,
        description: 'The American Professional II Stratocaster draws from more than sixty years of innovation, inspiration and evolution to meet the demands of today’s player.',
        location: 'Colombo 07',
        district: 'Colombo',
        status: 'active',
        photos: ['https://images.unsplash.com/photo-1550291652-6ea9114a47b1?q=80&w=1000&auto=format&fit=crop']
      },
      {
        seller: seller._id,
        store: store._id,
        title: 'Gibson Les Paul Standard 60s',
        brand: 'Gibson',
        category: 'Guitars',
        model: 'Les Paul',
        condition: 'Brand New',
        price: 580000,
        description: 'The new Les Paul Standard returns to the classic design that made it relevant, played and loved -- shaping sound across generations and genres of music.',
        location: 'Kandy City',
        district: 'Kandy',
        status: 'active',
        photos: ['https://images.unsplash.com/photo-1516924911020-74882bb41108?q=80&w=1000&auto=format&fit=crop']
      },
      {
        seller: seller._id,
        store: store._id,
        title: 'Yamaha Stage Custom Birch 5-Piece Drum Set',
        brand: 'Yamaha',
        category: 'Drums',
        model: 'Stage Custom',
        condition: 'Brand New',
        price: 220000,
        description: 'With the introduction of the Stage Custom in 1995, Yamaha once again set the standards of value and sound.',
        location: 'Galle Fort',
        district: 'Galle',
        status: 'active',
        photos: ['https://images.unsplash.com/photo-1543443374-b6fe10a6ab7b?q=80&w=1000&auto=format&fit=crop']
      },
      {
        seller: seller._id,
        store: store._id,
        title: 'Roland Phantom-06 Synthesizer',
        brand: 'Roland',
        category: 'Keyboards',
        model: 'Phantom-06',
        condition: 'Like New',
        price: 340000,
        description: 'Equipped with a newly developed core, the FANTOM-0 series provides everything you need to create and perform at the highest level.',
        location: 'Negombo',
        district: 'Gampaha',
        status: 'active',
        photos: ['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1000&auto=format&fit=crop']
      },
      {
        seller: seller._id,
        store: store._id,
        title: 'Marshall JVM410H 100-Watt Tube Head',
        brand: 'Marshall',
        category: 'Amplifiers',
        model: 'JVM410H',
        condition: 'Used',
        price: 185000,
        description: 'British-built, the 100 Watt all-valve JVM410H head redefines versatility. Four channels, each with three modes.',
        location: 'Nugegoda',
        district: 'Colombo',
        status: 'active',
        photos: ['https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1000&auto=format&fit=crop']
      }
    ];

    await Listing.insertMany(defaultListings);
    console.log(`${defaultListings.length} Default Listings added successfully!`);
    
    process.exit();
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
};

seedData();
