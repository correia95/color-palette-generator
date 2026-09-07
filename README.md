# color-palette-generator

Pick a colour, choose a harmony (analogous / complementary / triadic / tetradic /
monochrome / tints & shades), get a five-colour palette. Click a swatch to copy
its hex; "Copy all" grabs the lot. Base colour and scheme in the URL, so a
palette is a shareable link.

**Live:** https://color-palette-generator.correia95.workers.dev/

## Stack

- React 18 + TypeScript + Vite, no runtime deps beyond React
- Static-assets Cloudflare Worker

## Engine

[`src/color.ts`](src/color.ts): hex <-> RGB <-> HSL, `palette(baseHex, scheme)`
(hue rotations + lightness/saturation nudges, clamped to L 6-96), `bestTextOn`
(WCAG luminance -> black or white label), `randomHex`, `normalizeHex`.

Verified in Node: #3b82f6 round-trips through HSL; 3-digit and no-hash hex parse;
each scheme returns five valid hex codes; label on #fde047 is dark, on #111 is white.

## Develop / deploy

```bash
npm install
npm run dev
npm run deploy
```
