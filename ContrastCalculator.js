const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin, output: process.stdout,
});

function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

function calculateContrastRatio(color1, color2) {
  const luminance1 = calculateLuminance(color1);
  const luminance2 = calculateLuminance(color2);

  const ratio = (Math.max(luminance1, luminance2) + 0.05) / (Math.min(luminance1, luminance2) + 0.05);
  return ratio.toFixed(2);
}

function calculateLuminance(color) {
  const rgb = hexToRgb(color);
  const { r, g, b } = rgb;

  const srgb = [r, g, b].map(value => {
    value /= 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function generateColorPalette(color1, color2, steps) {
  const palette = [];
  const startRGB = hexToRgb(color1);
  const endRGB = hexToRgb(color2);

  for (let i = 0; i < steps; i++) {
    const currentColor = {
      r: Math.round(startRGB.r + (endRGB.r - startRGB.r) * (i / (steps - 1))),
      g: Math.round(startRGB.g + (endRGB.g - startRGB.g) * (i / (steps - 1))),
      b: Math.round(startRGB.b + (endRGB.b - startRGB.b) * (i / (steps - 1))),
    };
    palette.push(`#${(1 << 24 | currentColor.r << 16 | currentColor.g << 8 | currentColor.b).toString(16).slice(1)}`);
  }

  return palette;
}

function analyzeColorContrast(color1, color2, steps) {
  const colorPalette = generateColorPalette(color1, color2, steps);
  let hasRatioBelow7 = false;

  for (let i = 0; i < colorPalette.length; i++) {
    const contrastRatio = calculateContrastRatio(colorPalette[i], '#000000');
    console.log(`Color ${i + 1}: ${colorPalette[i]} - Contrast Ratio: ${contrastRatio}:1`);

    if (parseFloat(contrastRatio) < 7) {
      hasRatioBelow7 = true;
    }
  }

  if (hasRatioBelow7) {
    console.log('There is at least one contrast ratio below 7:1.');
  } else {
    console.log('All contrast ratios are 7:1 or higher.');
  }
}

// Read colors and steps from the console
rl.question('Enter the first color (e.g., #ff0000): ', (color1) => {
  rl.question('Enter the second color (e.g., #0000ff): ', (color2) => {
    rl.question('Enter the number of steps: ', (steps) => {
      analyzeColorContrast(color1, color2, parseInt(steps));
      rl.close();
    });
  });
});
