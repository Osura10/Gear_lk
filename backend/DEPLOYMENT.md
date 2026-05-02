# GearLK Backend - Deployment Guide

This backend is ready to be deployed on Render or any Node.js hosting platform.

## Environment Variables
Create a `.env` file in the root of your hosted environment with the following keys:

- `PORT`: The port number (Render sets this automatically, default 5000)
- `MONGO_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: A long random string for token encryption
- `NODE_ENV`: Set to `production`

## Deployment Steps (Render.com)

1. **Push to GitHub**: Ensure your code is pushed to a GitHub repository.
2. **Create New Web Service**:
   - Log in to [Render](https://render.com).
   - Click **New +** -> **Web Service**.
   - Connect your GearLK repository.
3. **Configure Service**:
   - **Name**: `gearlk-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Environment Variables**:
   - Go to the **Environment** tab.
   - Add the `MONGO_URI`, `JWT_SECRET`, and `NODE_ENV` variables.
5. **Disk for Uploads (Optional but Recommended)**:
   - Since Render's filesystem is ephemeral, uploaded images will be lost on restart.
   - Go to **Disk** -> **Add Disk**.
   - **Mount Path**: `/uploads`
   - **Size**: 1GB (Free tier)
6. **Deploy**: Render will automatically build and deploy your app.

## API Base URL
Once deployed, Render will provide a URL (e.g., `https://gearlk-backend.onrender.com`). 
**Update your mobile app's `utils/api.js` with this new URL.**
