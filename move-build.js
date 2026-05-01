const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, 'frontend', 'dist');
const dest = path.join(__dirname, 'backend', 'public');

if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
}

function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }
        fs.readdirSync(src).forEach(function(childItemName) {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

console.log('Copying build files...');
copyRecursiveSync(src, dest);
console.log('Build files moved successfully to backend/public!');
