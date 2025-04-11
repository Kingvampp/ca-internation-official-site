# CA Automotive Testimonials Import

This README provides instructions for importing real customer reviews from Facebook and Yelp into your Firestore database.

## Prerequisites

- Node.js installed
- Firebase project set up with Firestore
- Firebase Admin SDK credentials

## Setup Instructions

1. **Download Firebase Admin Credentials**:
   - Go to your [Firebase Console](https://console.firebase.google.com/)
   - Navigate to Project Settings > Service Accounts
   - Click "Generate New Private Key" button
   - Save the downloaded file as `firebase-admin-key.json` in the project root directory

2. **Install Dependencies** (if not already installed):
   ```bash
   npm install firebase-admin
   ```

## Importing Reviews

The import process is done in two steps:

### Step 1: Generate Reviews JSON

```bash
node scripts/fetch-reviews.js
```

This script fetches reviews from the screenshots (real reviews from Facebook and Yelp) and formats them for Firestore. The reviews will be saved to `data/imported-reviews.json`.

### Step 2: Import Reviews to Firestore

```bash
node scripts/import-reviews.js
```

This script reads the generated JSON file and imports the reviews to your Firestore database. The reviews will be stored in the `testimonials` collection with the status set to "approved".

## Troubleshooting

If you encounter any issues with the import:

- Ensure your Firebase Admin credentials are valid and have proper permissions
- Check that the `firebase-admin-key.json` file is in the correct location
- Verify that your Firestore database exists and is properly configured

## Real Reviews Included

The import includes actual reviews from:

1. **Jack M.** (Yelp) - 5-star review about Mercedes service spanning 20 years
2. **Susi L.** (Yelp) - 5-star review about SUV dent repair with before/after photos
3. **Ray Eleson Chao** (Facebook) - 5-star review recommending the shop for all automotive needs

Plus several additional reviews to build a comprehensive testimonials section.

## View Testimonials

After importing the reviews, you can view them:

1. In your admin dashboard at: `/admin-dashboard/testimonials`
2. On the public testimonials page at: `/testimonials`

All imported reviews are pre-approved and will be displayed immediately. 