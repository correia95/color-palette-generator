// Colour maths: hex <-> HSL <-> RGB, harmony schemes, contrast.

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}
export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB | null {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

export function rgbToHex({ r, g, b }: RGB): string {
  const to = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 };
}

export function hexToHsl(hex: string): HSL | null {
  const rgb = hexToRgb(hex);
  return rgb ? rgbToHsl(rgb) : null;
}
export function hslToHex(hsl: HSL): string {
  return rgbToHex(hslToRgb(hsl));
}

export type Scheme = 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'monochrome' | 'shades';

export const SCHEMES: { id: Scheme; name: string; note: string }[] = [
  { id: 'analogous', name: 'Analogous', note: 'neighbours on the wheel — calm, cohesive' },
  { id: 'complementary', name: 'Complementary', note: 'opposite hues — high contrast' },
  { id: 'triadic', name: 'Triadic', note: 'three evenly spaced hues — balanced, vivid' },
  { id: 'tetradic', name: 'Tetradic', note: 'two complementary pairs — rich, needs care' },
  { id: 'monochrome', name: 'Monochrome', note: 'one hue, varied lightness and saturation' },
  { id: 'shades', name: 'Tints & shades', note: 'one colour from near-white to near-black' },
];

const clampL = (l: number) => Math.max(6, Math.min(96, l));

export function palette(baseHex: string, scheme: Scheme): string[] {
  const hsl = hexToHsl(baseHex);
  if (!hsl) return [];
  const { h, s, l } = hsl;
  const mk = (dh: number, ds = 0, dl = 0): string =>
    hslToHex({ h: h + dh, s: Math.max(0, Math.min(100, s + ds)), l: clampL(l + dl) });

  switch (scheme) {
    case 'analogous':
      return [mk(-30, 0, 8), mk(-15), baseHex, mk(15), mk(30, 0, -8)];
    case 'complementary':
      return [mk(0, 0, 16), baseHex, mk(0, -20, -10), mk(180), mk(180, 0, -16)];
    case 'triadic':
      return [baseHex, mk(120), mk(240), mk(120, 0, 18), mk(240, 0, -18)];
    case 'tetradic':
      return [baseHex, mk(90), mk(180), mk(270), mk(0, -30, 20)];
    case 'monochrome':
      return [mk(0, -30, 22), mk(0, -10, 11), baseHex, mk(0, 6, -12), mk(0, 10, -24)];
    case 'shades':
      return [
        hslToHex({ h, s: Math.max(8, s - 30), l: 94 }),
        hslToHex({ h, s: Math.max(15, s - 12), l: 76 }),
        baseHex,
        hslToHex({ h, s: Math.min(100, s + 6), l: clampL(l - 22) }),
        hslToHex({ h, s: Math.min(100, s + 10), l: 12 }),
      ];
  }
}

export function randomHex(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 45 + Math.floor(Math.random() * 45);
  const l = 40 + Math.floor(Math.random() * 25);
  return hslToHex({ h, s, l });
}

// relative luminance + contrast ratio (WCAG)
function lum({ r, g, b }: RGB): number {
  const f = (c: number) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
export function bestTextOn(hex: string): '#ffffff' | '#111111' {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#111111';
  const L = lum(rgb);
  const white = 1.05 / (L + 0.05);
  const black = (L + 0.05) / 0.05;
  return white >= black ? '#ffffff' : '#111111';
}

export function normalizeHex(input: string): string | null {
  const rgb = hexToRgb(input);
  return rgb ? rgbToHex(rgb) : null;
}
