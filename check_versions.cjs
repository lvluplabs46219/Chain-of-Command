const fs = require('fs');
const { execSync } = require('child_process');
const files = execSync('find . -name "package.json" -not -path "*/node_modules/*"').toString().split('\n').filter(Boolean);
for (const file of files) {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (data.version !== undefined) {
      if (typeof data.version !== 'string' || data.version.trim() === '') {
        console.log(`${file}: "version" is invalid: ${JSON.stringify(data.version)}`);
      }
    }
  } catch(e) {}
}
