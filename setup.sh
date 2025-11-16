#!/bin/bash

echo "---------------------------------------"
echo " Installing backend dependencies..."
echo "---------------------------------------"
cd backend

# Core backend deps
npm install

# Auth/session dependencies
npm install express-session passport passport-google-oauth20

echo "---------------------------------------"
echo " Installing frontend dependencies..."
echo "---------------------------------------"
cd ../frontend
npm install

echo "---------------------------------------"
echo " Setup complete!"
echo " You can now run:"
echo "   cd backend && npm run dev"
echo "---------------------------------------"
