export function darken(hex, amt) {
  const { r, g, b } = parseHex(hex);
  const f = 1 - amt;
  return rgbToHex(Math.round(r * f), Math.round(g * f), Math.round(b * f));
}

export function toSoft(hex) {
  const { r, g, b } = parseHex(hex);
  // mix toward white
  const mix = (c) => Math.round(c + (255 - c) * 0.92);
  return rgbToHex(mix(r), mix(g), mix(b));
}

export function parseHex(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c+c).join('') : h, 16);
  return { r: (n>>16)&255, g: (n>>8)&255, b: n&255 };
}

export function rgbToHex(r, g, b) {
  return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
}
