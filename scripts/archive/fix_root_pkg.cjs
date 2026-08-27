const fs = require('fs');

const rootPkgPath = 'package.json';
let pkgStr = fs.readFileSync(rootPkgPath, 'utf8');
let pkg = JSON.parse(pkgStr);

// Fix invalid dependencies
const fixDeps = {
  "express": "^4.19.2",
  "express-rate-limit": "^7.3.1",
  "helmet": "^7.1.0",
  "cors": "^2.8.5",
  "@upstash/redis": "^1.38.0"
};

for (const [dep, ver] of Object.entries(fixDeps)) {
  if (pkg.dependencies && pkg.dependencies[dep]) {
    pkg.dependencies[dep] = ver;
  }
}

fs.writeFileSync(rootPkgPath, JSON.stringify(pkg, null, 2));
console.log('Fixed root package.json');
