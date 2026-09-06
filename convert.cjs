const fs = require('fs');

function convertHtmlToJsx(html) {
  return html
    .replace(/class=/g, 'className=')
    .replace(/for=/g, 'htmlFor=')
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/stroke-linecap=/g, 'strokeLinecap=')
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/fill-rule=/g, 'fillRule=')
    .replace(/clip-rule=/g, 'clipRule=')
    .replace(/tabindex=/g, 'tabIndex=')
    .replace(/autocomplete=/g, 'autoComplete=')
    .replace(/autofocus=/g, 'autoFocus=')
    .replace(/style="([^"]*)"/g, (match, p1) => {
      // Very naive inline style conversion for font-variation-settings
      if (p1.includes("font-variation-settings")) {
        return `style={{ fontVariationSettings: "'FILL' 1" }}`;
      }
      if (p1.includes("background-color: #D4AF37; color: #141313; border-color: #D4AF37;")) {
        return `style={{ backgroundColor: "#D4AF37", color: "#141313", borderColor: "#D4AF37" }}`;
      }
      if (p1.includes("color: #D4AF37;")) {
        return `style={{ color: "#D4AF37" }}`;
      }
      if (p1.includes("border-color: #D4AF37;")) {
        return `style={{ borderColor: "#D4AF37" }}`;
      }
      return match;
    })
    // fix unclosed inputs and imgs
    .replace(/<input([^>]*[^/])>/g, '<input$1 />')
    .replace(/<img([^>]*[^/])>/g, '<img$1 />')
    // Extract the body content (ignore scripts/meta)
    .match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];
}

const commandCenterHtml = fs.readFileSync('commandCenter.html', 'utf8');
const counselDirHtml = fs.readFileSync('counselDir.html', 'utf8');

const ccJsx = `import React from 'react';

export default function CaseWorkspace() {
  return (
    <div className="flex flex-col h-screen overflow-hidden text-body-md font-body-md antialiased selection:bg-secondary selection:text-on-secondary bg-surface text-on-surface">
      ${convertHtmlToJsx(commandCenterHtml)}
    </div>
  );
}
`;

const cdJsx = `import React from 'react';

export default function AttorneyDirectory() {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      ${convertHtmlToJsx(counselDirHtml)}
    </div>
  );
}
`;

fs.writeFileSync('apps/web/src/components/mockups/acquit-case-workspace/CaseWorkspace.tsx', ccJsx);
fs.writeFileSync('apps/web/src/components/mockups/acquit-case-workspace/AttorneyDirectory.tsx', cdJsx);

console.log("Converted.");
