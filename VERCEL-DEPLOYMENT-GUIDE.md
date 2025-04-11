# Deploying CA International Automotive to Vercel

This guide provides instructions for deploying the CA International Automotive website to Vercel with GitHub integration for automatic deployments.

## Prerequisites

1. A GitHub account
2. A Vercel account (https://vercel.com) linked to your GitHub account
3. The repository cloned to your local machine

## Deployment Options

### Option 1: Automatic GitHub Deployment (Recommended)

1. Make sure your repository is pushed to GitHub by running the included script:

```bash
npm run push-to-github
```

This script will:
- Prepare the code for Vercel deployment
- Ask for a commit message
- Push changes to GitHub

2. Go to Vercel and create a new project:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Configure the project settings:
     - Framework preset: Next.js
     - Root directory: ./
     - Build command: npm run vercel-build
     - Output directory: .next

3. Add Environment Variables in Vercel:
   - Go to your project settings > Environment Variables
   - Add all the environment variables from `.env.production` with your actual values
   - Important: Make sure to add all API keys and secrets

4. Deploy the project:
   - Click "Deploy" and wait for the build to complete

5. Your site is now live! Vercel will provide you with a URL like `https://your-project.vercel.app`

6. For future updates, simply push to the main branch and Vercel will automatically deploy your changes.

### Option 2: Manual Deployment with Vercel CLI

1. Install the Vercel CLI if you haven't already:

```bash
npm install -g vercel
```

2. Run the deployment script:

```bash
npm run deploy-to-vercel
```

This script will:
- Prepare your code for Vercel deployment
- Fix TypeScript and syntax errors
- Deploy directly to Vercel

## Maintenance and Troubleshooting

### Fixing Build Errors

If you encounter build errors during deployment, you can:

1. Try the automated fix script:

```bash
npm run build-safe
```

2. Check the problematic files identified in `scripts/build-vercel-bypass.js` and fix any issues manually.

### Environment Variables

Make sure all environment variables are properly set in Vercel:

- OPENAI_API_KEY - For the AI chat assistant
- FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY - For Firebase integration
- ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET - For admin authentication
- Other API keys as needed

## Optimizing Your Deployment

- Enable automatic GitHub deployments for streamlined workflows
- Set up preview deployments for pull requests
- Consider setting up custom domains under Vercel project settings
- Implement a CI/CD pipeline with GitHub Actions using `.github/workflows/vercel-deploy.yml`

## Getting Help

If you encounter any issues with deployment, refer to:

- Vercel documentation: https://vercel.com/docs
- Next.js deployment docs: https://nextjs.org/docs/deployment
- File an issue in the GitHub repository 