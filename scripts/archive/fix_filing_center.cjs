const fs = require('fs');
const p = 'artifacts/mockup-sandbox/src/components/mockups/acquit-case-workspace/FilingCenter.tsx';
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/return \(\) => \{\n        document\.body\.style\.overflow = 'unset';\n        window\.removeEventListener\('keydown', handleKeyDown\);\n      \};\n    \} else \{\n      document\.body\.style\.overflow = 'unset';\n    \}/g, 
`    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      if (typeof handleKeyDown !== 'undefined') window.removeEventListener('keydown', handleKeyDown);
    };`);
fs.writeFileSync(p, c);
