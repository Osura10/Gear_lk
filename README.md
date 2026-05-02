# GearLK - The Ultimate Music Marketplace 🎸

GearLK is a full-stack marketplace application designed specifically for musicians and audio enthusiasts to buy and sell musical instruments and professional audio gear.

## 🚀 Features

### For Sellers
- **Professional Storefront**: Create and manage your own music shop with custom logos, banners, and descriptions.
- **Listing Management**: Easily post, edit, and manage your gear listings with multi-photo support.
- **Store Gallery**: Showcase your physical store or previous work through a dedicated photo gallery.
- **Policy Management**: Set your own shipping, return, and warranty policies.

### For Buyers
- **Intuitive Search**: Browse instruments by category, brand, condition, and location.
- **Detailed Listings**: View high-quality photos, specifications, and seller information.
- **Review System**: Share your experience by leaving ratings and reviews with photos for both items and stores.
- **Store Interaction**: Follow and visit favorite stores to see their latest arrivals.

### Platform Features
- **Real-time Messaging**: Chat directly with sellers/buyers within the app.
- **Favorites**: Save the gear you love to your personal wishlist.
- **Environment Driven**: Fully configurable via `.env` files for easy deployment and local testing.

---

## 🛠 Tech Stack

- **Mobile**: React Native, Expo, Axios, React Navigation
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Storage**: Local filesystem storage with Multer (Backend)
- **Authentication**: JWT (JSON Web Tokens)

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Expo Go app on your mobile device (for testing)

### 1. Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secret_key
   NODE_ENV=development
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 2. Mobile Setup
1. Navigate to the `mobile` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `mobile` folder:
   ```env
   EXPO_PUBLIC_API_URL=http://your_local_ip:5000
   EXPO_PUBLIC_DEFAULT_IMAGE_URL=https://via.placeholder.com/150
   EXPO_PUBLIC_DEFAULT_BANNER_URL=https://images.unsplash.com/photo-1514525253344-f814d074358a
   EXPO_PUBLIC_HOME_BANNER_URL=https://images.unsplash.com/photo-1511379938547-c1f69419868d
   ```
4. Start the Expo server:
   ```bash
   npx expo start -c
   ```
5. Scan the QR code with your Expo Go app.

---

## 📁 Project Structure

```text
GearLK/
├── backend/             # Node.js Express server
│   ├── config/          # Database configuration
│   ├── controllers/     # API logic
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   └── uploads/         # Local media storage
└── mobile/              # React Native Expo app
    ├── assets/          # Static images
    └── src/
        ├── components/  # Reusable UI components
        ├── context/     # Auth & State management
        ├── navigation/  # App routing
        ├── screens/     # Page views
        └── utils/       # API & Constant helpers
```

---

## 📝 License
This project is licensed under the MIT License - see the LICENSE file for details.
