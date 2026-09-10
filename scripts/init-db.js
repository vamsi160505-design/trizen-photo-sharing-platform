const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Initializing Trizen Photo Sharing Platform Database...');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

require('./seed.js');
