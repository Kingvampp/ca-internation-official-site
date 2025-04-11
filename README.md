# CA International Automotive Website

A premium automotive repair and restoration services website built with Next.js.

## Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment with Vercel

This project is set up for automated deployment with Vercel through GitHub integration.

### Prerequisites

- GitHub repository (this repository)
- Vercel account linked to your GitHub account
- Vercel project setup for this repository

### Environment Variables

The following environment variables need to be set up in your Vercel project:

| Variable | Description |
|----------|-------------|
| OPENAI_API_KEY | API key for OpenAI |
| ANTHROPIC_API_KEY | API key for Anthropic |
| ADMIN_USERNAME | Admin username for dashboard access |
| ADMIN_PASSWORD | Admin password for dashboard access |
| JWT_SECRET | Secret for JWT authentication |
| FIREBASE_PROJECT_ID | Firebase project ID |
| FIREBASE_CLIENT_EMAIL | Firebase client email |
| FIREBASE_PRIVATE_KEY | Firebase private key (with \n for line breaks) |
| NEXT_PUBLIC_FIREBASE_API_KEY | Firebase API key |
| NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN | Firebase auth domain |
| NEXT_PUBLIC_FIREBASE_PROJECT_ID | Firebase project ID |
| NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET | Firebase storage bucket |
| NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID | Firebase messaging sender ID |
| NEXT_PUBLIC_FIREBASE_APP_ID | Firebase app ID |
| GOOGLE_MAPS_API_KEY | Google Maps API key |

### GitHub Actions Setup

For GitHub Actions to automatically deploy to Vercel, add the following secrets to your GitHub repository:

- VERCEL_TOKEN: A token from Vercel (create one from your account settings)
- VERCEL_ORG_ID: Your Vercel organization ID
- VERCEL_PROJECT_ID: Your Vercel project ID

### Manual Deployment

To manually deploy your project to Vercel:

1. Install the Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`

## Features

- Multilingual support (English and Spanish)
- Admin dashboard for content management
- Gallery with before/after images
- Appointment booking system
- AI-powered chat assistant

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- i18next for translations
- Firebase for backend
- OpenAI for AI chat functionality 