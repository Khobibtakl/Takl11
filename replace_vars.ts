import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/bg-\[\#0f0f13\]/g, 'bg-[var(--bg-canvas)]');
code = code.replace(/bg-\[\#1a1a24\](?!\/)/g, 'bg-[var(--bg-surface)]');
code = code.replace(/bg-\[\#1a1a24\]\/80/g, 'bg-[var(--bg-surface)]\/80');
code = code.replace(/bg-\[\#1a1a24\]\/95/g, 'bg-[var(--bg-surface)]\/95');
code = code.replace(/bg-\[\#1a1a24\]\/20/g, 'bg-[var(--bg-surface)]\/20');
code = code.replace(/bg-\[\#1a1a24\]\/60/g, 'bg-[var(--bg-surface)]\/60');
code = code.replace(/bg-\[\#15151e\](?!\/)/g, 'bg-[var(--bg-header)]');
code = code.replace(/bg-\[\#15151e\]\/50/g, 'bg-[var(--bg-header)]\/50');

code = code.replace(/text-gray-100/g, 'text-[var(--text-strong)]');
code = code.replace(/text-gray-200/g, 'text-[var(--text-main)]');
code = code.replace(/text-gray-300/g, 'text-[var(--text-main)]');
code = code.replace(/text-gray-400/g, 'text-[var(--text-subtle)]');

code = code.replace(/border-gray-800\/60/g, 'border-[var(--line-color)]\/60');
code = code.replace(/border-gray-800/g, 'border-[var(--line-color)]');
code = code.replace(/ring-gray-800\/80/g, 'ring-[var(--line-color)]\/80');
code = code.replace(/ring-gray-800/g, 'ring-[var(--line-color)]');

code = code.replace(/bg-gray-800\/50/g, 'bg-[var(--surface-hover)]\/50');
code = code.replace(/bg-gray-800/g, 'bg-[var(--surface-hover)]');
code = code.replace(/hover:bg-gray-800/g, 'hover:bg-[var(--surface-hover)]');

// Update style prop in App.tsx: style={{ backgroundColor: '#0f0f13', backgroundImage: 'radial-gradient(#ffffff0a 1px, transparent 1px)' }}
code = code.replace(
  /style={{ backgroundColor: '#0f0f13', backgroundImage: 'radial-gradient\(#ffffff0a 1px, transparent 1px\)', backgroundSize: '24px 24px' }}/g,
  "style={{ backgroundColor: 'var(--bg-canvas)', backgroundImage: 'radial-gradient(var(--dot-color) 1px, transparent 1px)', backgroundSize: '24px 24px' }}"
);
code = code.replace(
  /ring-white\/5/g,
  "ring-[var(--ring-shine)]"
);

fs.writeFileSync('src/App.tsx', code);
console.log("Replaced colors with CSS vars.");
