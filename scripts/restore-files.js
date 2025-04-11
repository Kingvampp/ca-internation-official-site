
const fs = require('fs');
const path = require('path');

const backupDir = path.join(process.cwd(), '.file-backups');
const problematicFiles = [
  "app/admin-dashboard/gallery/edit/[id]/page.tsx",
  "app/admin-dashboard/gallery/new/page.tsx",
  "app/admin/login/page.tsx",
  "app/api/translations/route.ts",
  "app/admin/gallery/add/page.tsx",
  "app/admin-dashboard/gallery/layout.tsx",
  "app/api/appointments/route.ts",
  "app/api/auth/route.ts",
  "app/api/booking/route.ts",
  "app/api/chat/route.ts",
  "app/api/gallery/route.ts",
  "app/api/testimonials/route.ts",
  "app/api/auth/[...nextauth]/route.js",
  "app/api/gallery/[id]/route.ts",
  "app/gallery/[id]/page.tsx"
];

// Restore files from backups
let restoredCount = 0;
problematicFiles.forEach(filePath => {
  const fullPath = path.join(process.cwd(), filePath);
  const backupFile = path.join(backupDir, filePath.replace(/\//g, '_'));
  
  if (fs.existsSync(backupFile)) {
    try {
      console.log(`Restoring ${filePath} from backup`);
      fs.copyFileSync(backupFile, fullPath);
      restoredCount++;
    } catch (err) {
      console.warn(`Warning: Could not restore ${filePath}: ${err.message}`);
    }
  } else {
    // If no backup exists but we created a placeholder, we should clean it up
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`Removed placeholder for ${filePath}`);
      } catch (err) {
        console.warn(`Warning: Could not remove placeholder ${filePath}: ${err.message}`);
      }
    }
  }
});

console.log(`Restored ${restoredCount} files from backups`);
