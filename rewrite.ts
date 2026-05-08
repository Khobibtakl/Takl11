import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace standard colors to dark mode with vibrant purple
code = code.replace(/bg-gray-50\/50/g, 'bg-[#15151e]');
code = code.replace(/border-gray-50/g, 'border-gray-800');
code = code.replace(/bg-gray-50/g, 'bg-[#0f0f13]');
code = code.replace(/bg-white\/80/g, 'bg-[#1a1a24]/80');
code = code.replace(/bg-white\/95/g, 'bg-[#1a1a24]/95');
code = code.replace(/bg-white\/60/g, 'bg-[#1a1a24]/60');
code = code.replace(/bg-white\/20/g, 'bg-[#1a1a24]/20');
code = code.replace(/bg-white/g, 'bg-[#1a1a24]');

code = code.replace(/border-gray-200\/80/g, 'border-gray-800/80');
code = code.replace(/border-gray-200/g, 'border-gray-800');
code = code.replace(/border-gray-100/g, 'border-gray-800/60');

code = code.replace(/ring-gray-100/g, 'ring-gray-800/80');
code = code.replace(/ring-gray-200\/80/g, 'ring-gray-800/80');
code = code.replace(/ring-gray-200/g, 'ring-gray-800');
code = code.replace(/ring-gray-900\/5/g, 'ring-white/5');

code = code.replace(/text-gray-900/g, 'text-gray-100');
code = code.replace(/text-gray-800/g, 'text-gray-200');
code = code.replace(/text-gray-700/g, 'text-gray-300');
code = code.replace(/text-gray-600/g, 'text-gray-400');

code = code.replace(/bg-indigo-600/g, 'bg-purple-600');
code = code.replace(/text-indigo-600/g, 'text-purple-400');
code = code.replace(/bg-indigo-50/g, 'bg-purple-500/10');
code = code.replace(/text-indigo-500/g, 'text-purple-400');
code = code.replace(/text-indigo-700/g, 'text-purple-300');
code = code.replace(/text-indigo-200/g, 'text-purple-200');

code = code.replace(/ring-indigo-100/g, 'ring-purple-500/20');
code = code.replace(/ring-indigo-200/g, 'ring-purple-500/30');
code = code.replace(/ring-indigo-300/g, 'ring-purple-500/40');
code = code.replace(/ring-indigo-500\/20/g, 'ring-purple-500/20');
code = code.replace(/ring-indigo-500/g, 'ring-purple-500');

code = code.replace(/hover:bg-indigo-700/g, 'hover:bg-purple-500');
code = code.replace(/hover:bg-indigo-600/g, 'hover:bg-purple-500');
code = code.replace(/hover:text-indigo-600/g, 'hover:text-purple-400');
code = code.replace(/hover:ring-indigo-300/g, 'hover:ring-purple-500/40');

code = code.replace(/bg-emerald-50/g, 'bg-emerald-500/10');
code = code.replace(/text-emerald-600/g, 'text-emerald-400');
code = code.replace(/text-emerald-500/g, 'text-emerald-400');
code = code.replace(/bg-emerald-500/g, 'bg-emerald-600');
code = code.replace(/hover:bg-emerald-600/g, 'hover:bg-emerald-500');

code = code.replace(/bg-red-100/g, 'bg-red-500/20');
code = code.replace(/bg-red-50/g, 'bg-red-500/10');
code = code.replace(/text-red-600/g, 'text-red-400');
code = code.replace(/text-red-500/g, 'text-red-400');
code = code.replace(/hover:bg-red-100/g, 'hover:bg-red-500/30');

code = code.replace(/bg-gray-100/g, 'bg-gray-800');
code = code.replace(/hover:bg-gray-100/g, 'hover:bg-gray-700');
code = code.replace(/hover:bg-gray-50/g, 'hover:bg-gray-800');
code = code.replace(/hover:bg-gray-200/g, 'hover:bg-gray-700');
code = code.replace(/bg-gray-900\/40/g, 'bg-black/60');
code = code.replace(/bg-gray-200/g, 'bg-gray-700');

// Fix specific gradient and dynamic styles
code = code.replace(/bg-gradient-to-br from-purple-500\/10 to-white/g, 'bg-gray-800'); // Note: indigo-50 was replaced to purple-500/10
code = code.replace(/bg-\[url\('https:\/\/www\.transparenttextures\.com\/patterns\/cubes\.png'\)\] bg-fixed/g, "bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-90");
code = code.replace(/style={{ backgroundColor: '#ffffff', backgroundImage: 'radial-gradient\(#f3f4f6 1px, transparent 1px\)', backgroundSize: '24px 24px' }}/g, "style={{ backgroundColor: '#0f0f13', backgroundImage: 'radial-gradient(#ffffff0a 1px, transparent 1px)', backgroundSize: '24px 24px' }}");

code = code.replace(/bg-indigo-400/g, 'bg-purple-500');

// Additional adjustments for specific elements to match dark theme better
code = code.replace(/text-gray-500/g, 'text-gray-400');

fs.writeFileSync('src/App.tsx', code);
console.log("Colors successfully rewritten to dark mode.");
