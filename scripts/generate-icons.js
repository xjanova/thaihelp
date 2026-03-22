// Generate simple SVG-based PWA icons
// Run: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

function generateSVG(size) {
  const p = size / 192;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f97316"/>
      <stop offset="100%" style="stop-color:#ea580c"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${32*p}" fill="url(#bg)"/>
  <g transform="translate(${size/2}, ${size/2 - 5*p})">
    <!-- Shield -->
    <path d="M0,${-36*p} L${30*p},${-18*p} L${30*p},${10*p} Q${30*p},${30*p} 0,${36*p} Q${-30*p},${30*p} ${-30*p},${10*p} L${-30*p},${-18*p} Z"
      fill="none" stroke="white" stroke-width="${4*p}" stroke-linejoin="round"/>
    <!-- Checkmark -->
    <polyline points="${-15*p},${2*p} ${-3*p},${14*p} ${18*p},${-10*p}"
      fill="none" stroke="white" stroke-width="${5*p}" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <!-- TH text -->
  <text x="${size/2}" y="${size/2 + 55*p}" text-anchor="middle" fill="rgba(255,255,255,0.9)"
    font-family="Arial,sans-serif" font-weight="bold" font-size="${18*p}px">TH</text>
</svg>`;
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG files (can be used directly or converted to PNG)
[192, 512].forEach(size => {
  const svg = generateSVG(size);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}.svg`), svg);
  console.log(`Generated icon-${size}.svg`);
});

// Also create a favicon.svg
const favicon = generateSVG(32);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), favicon);
console.log('Generated favicon.svg');

console.log('\\nDone! SVG icons created in public/icons/');
console.log('For PNG conversion, open the SVGs in a browser and export, or use a tool like sharp/canvas.');
