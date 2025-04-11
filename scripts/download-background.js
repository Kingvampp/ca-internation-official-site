const fs = require('fs');
const https = require('https');
const path = require('path');

// URL of a free-to-use car workshop image (you can replace with any suitable image)
const imageUrl = 'https://images.unsplash.com/photo-1567415048283-314873035fd0?q=80&w=1600&auto=format&fit=crop';
const outputPath = path.join(__dirname, '..', 'public', 'images', 'backgrounds', 'car-workshop-bg.jpg');

console.log('Downloading background image...');

// Create directory if it doesn't exist
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// Download the image
https.get(imageUrl, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Failed to download image: ${response.statusCode} ${response.statusMessage}`);
    return;
  }

  const fileStream = fs.createWriteStream(outputPath);
  response.pipe(fileStream);

  fileStream.on('finish', () => {
    fileStream.close();
    console.log(`Image downloaded successfully to: ${outputPath}`);
  });
}).on('error', (err) => {
  console.error(`Error downloading image: ${err.message}`);
  fs.unlink(outputPath, () => {}); // Clean up partial file
}); 