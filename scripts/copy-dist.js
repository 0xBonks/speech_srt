const fs = require('fs-extra');
const path = require('path');

// Kopiere dist nach static
fs.removeSync(path.join(__dirname, '../static'));
fs.copySync(
  path.join(__dirname, '../dist'),
  path.join(__dirname, '../static')
); 