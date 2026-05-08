import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/purple-600/g, 'primary');
code = code.replace(/purple-500\/10/g, 'primary-light');
code = code.replace(/purple-500\/20/g, 'primary-border');
code = code.replace(/purple-500\/30/g, 'primary-border');
code = code.replace(/purple-500\/40/g, 'primary-border');
code = code.replace(/purple-500/g, 'primary-hover');
code = code.replace(/purple-400/g, 'primary-hover');
code = code.replace(/purple-300/g, 'primary-hover');
code = code.replace(/purple-200/g, 'primary-hover');

fs.writeFileSync('src/App.tsx', code);
console.log("Rewrote classes to primary");
