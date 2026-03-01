const sharp = require('sharp');
const path = require('path');
const dir = path.join(__dirname, 'slides');

async function createGradient(filename, color1, color2, angle = '180') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="810">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="${angle === '135' ? '100%' : '0%'}" y2="100%">
      <stop offset="0%" style="stop-color:${color1}"/>
      <stop offset="100%" style="stop-color:${color2}"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(dir, filename));
}

async function createAccentBar(filename, color, w, h) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="100%" height="100%" fill="${color}" rx="4"/>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(dir, filename));
}

(async () => {
  await createGradient('bg-dark.png', '#1C2833', '#0B1622', '135');
  await createGradient('bg-section.png', '#0E2A3B', '#1C2833', '135');
  await createGradient('bg-highlight.png', '#17A2B8', '#138496', '135');
  await createAccentBar('accent-teal.png', '#17A2B8', 120, 6);
  await createAccentBar('accent-red.png', '#E74C3C', 120, 6);
  await createAccentBar('accent-amber.png', '#F39C12', 120, 6);
  console.log('Assets created');
})();
