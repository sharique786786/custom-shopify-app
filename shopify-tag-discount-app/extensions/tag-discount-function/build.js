import fs from 'fs';
import path from 'path';

const source = path.resolve('src/run.js');
const destinationDir = path.resolve('dist');
const destination = path.resolve(destinationDir, 'run.js');

if (!fs.existsSync(destinationDir)) {
  fs.mkdirSync(destinationDir);
}

fs.copyFileSync(source, destination);
console.log(`✅ File copied from ${source} to ${destination}`);
