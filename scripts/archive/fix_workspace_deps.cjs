const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('find . -name "package.json" -not -path "*/node_modules/*"').toString().split('\n').filter(Boolean);

for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    let changed = false;
    
    for (const type of ['dependencies', 'devDependencies', 'peerDependencies']) {
      if (data[type]) {
        for (const [k, v] of Object.entries(data[type])) {
           if (v === '*' && (k.startsWith('@workspace/') || k.startsWith('@acquit/') || k === 'psql')) {
             data[type][k] = '0.0.0'; // Or whatever version matches the workspace
             changed = true;
           } else if (v.trim() === '') {
             data[type][k] = 'latest'; // Fallback for empty versions
             changed = true;
           }
        }
      }
    }
    
    // Check main version field
    if (data.version === '' || data.version === undefined) {
      data.version = '0.0.0';
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
      console.log(`Fixed workspace deps in ${file}`);
    }
  } catch(e) {}
}
