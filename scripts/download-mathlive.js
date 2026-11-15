/**
 * Helper script to download local MathLive distribution files
 * for 100% offline bundling into Android and iOS React Native assets.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const ASSET_DIRS = [
  path.join(__dirname, '..', 'src', 'assets', 'mathlive'),
  path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'mathlive'),
];

ASSET_DIRS.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const FILES_TO_DOWNLOAD = [
  {
    url: 'https://unpkg.com/mathlive/dist/mathlive.min.js',
    filename: 'mathlive.min.js'
  },
  {
    url: 'https://unpkg.com/mathlive/dist/mathlive-static.css',
    filename: 'mathlive-static.css'
  }
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        const redirectUrl = new URL(response.headers.location, url).toString();
        return downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: HTTP ${response.statusCode}`));
      }
      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Downloading MathLive offline assets...');
  for (const item of FILES_TO_DOWNLOAD) {
    for (const dir of ASSET_DIRS) {
      const dest = path.join(dir, item.filename);
      console.log(`Fetching ${item.filename} -> ${dest}`);
      try {
        await downloadFile(item.url, dest);
        console.log(`✔ Saved ${dest}`);
      } catch (err) {
        console.warn(`Could not fetch ${item.filename}: ${err.message}`);
      }
    }
  }
  console.log('MathLive offline asset bundle ready.');
}

run();
