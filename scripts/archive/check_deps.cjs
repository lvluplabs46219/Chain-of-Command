const fs = require('fs');
const { execSync } = require('child_process');
const files = execSync('find . -name "package.json" -not -path "*/node_modules/*"').toString().split('\n').filter(Boolean);
for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const type of ['dependencies', 'devDependencies', 'peerDependencies']) {
      if (data[type]) {
        for (const [k, v] of Object.entries(data[type])) {
           if (v.trim() === '' || v === '*' || v.includes('github:') || v.includes('file:')) {
             console.log(`Suspicious: ${file} ${type} ${k}: ${v}`);
           }
        }
      }
    }
  } catch(e) {}
}
