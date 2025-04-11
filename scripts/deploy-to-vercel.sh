#!/bin/bash

# Exit on error
set -e

echo "Preparing to deploy to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Run the prepare-vercel script to fix code issues
echo "Preparing code for deployment..."
npm run prepare-vercel

# Create the Vercel production environment file if it doesn't exist
if [ ! -f .env.production ]; then
    echo "Creating .env.production file..."
    cp .env.local.example .env.production
    echo "WARNING: You should update .env.production with your actual production values."
fi

# Confirm deployment
echo ""
echo "About to deploy to Vercel. This will:"
echo "1. Run the prepare script to fix TypeScript issues"
echo "2. Deploy the application to Vercel"
echo ""
read -p "Continue with deployment? (y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo "Deployment cancelled."
    exit 0
fi

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo ""
echo "Deployment completed successfully!"
echo ""
echo "Don't forget to set your environment variables in the Vercel dashboard:"
echo "https://vercel.com/dashboard"
echo "" 