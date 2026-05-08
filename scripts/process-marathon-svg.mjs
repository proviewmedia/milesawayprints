#!/usr/bin/env node
// Extract the embedded base64 PNG from a marathon SVG template and rewrite
// the SVG to reference the PNG as an external file. Run once per source
// asset. The resulting SVG is small enough to inline in the customizer page
// while the PNG (the route map) is served as a regular image.
//
// Usage:
//   node scripts/process-marathon-svg.mjs <input.svg> <output-prefix>
//
// Example:
//   node scripts/process-marathon-svg.mjs \
//     "/Users/apollo/Documents/las vegas marathon.svg" \
//     public/marathons/las-vegas-full
//
// Produces:
//   <output-prefix>.svg  — lightweight template (~10 KB)
//   <output-prefix>.png  — extracted route image (1–2 MB)

import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { basename } from 'node:path';

const [, , inputPath, outputPrefix] = process.argv;

if (!inputPath || !outputPrefix) {
  console.error('Usage: process-marathon-svg.mjs <input.svg> <output-prefix>');
  process.exit(1);
}

const svg = readFileSync(inputPath, 'utf8');
console.log(`Read ${inputPath} (${(statSync(inputPath).size / 1024 / 1024).toFixed(2)} MB)`);

// Find every embedded PNG data URL in an xlink:href (or href). Some SVG
// templates have a single map image; others (Chicago) embed two — the city
// map and a secondary illustration/overlay. We extract them all and replace
// each with an absolute /public path. The first PNG keeps the bare prefix
// (`<prefix>.png`) so existing `marathons.full_svg_path` rows still resolve;
// subsequent PNGs get -2, -3, ... suffixes.
const dataUrlRe = /(xlink:href|href)="data:image\/png;base64,([^"]+)"/g;

const svgOut = `${outputPrefix}.svg`;
let lightSvg = svg;
let imageIndex = 0;
const written = [];

// Walk matches against the *original* svg string so all replacements are
// computed independently, then apply them.
const matches = Array.from(svg.matchAll(dataUrlRe));
if (matches.length === 0) {
  console.error('No embedded PNG data URL found in SVG.');
  process.exit(2);
}

for (const match of matches) {
  imageIndex += 1;
  const [whole, attr, b64] = match;
  const cleaned = b64.replace(/\s+/g, '');
  const pngBuf = Buffer.from(cleaned, 'base64');
  const suffix = imageIndex === 1 ? '' : `-${imageIndex}`;
  const pngOut = `${outputPrefix}${suffix}.png`;
  const pngBasename = basename(pngOut);
  writeFileSync(pngOut, pngBuf);
  const publicHref = `/marathons/${pngBasename}`;
  lightSvg = lightSvg.replace(whole, `${attr}="${publicHref}"`);
  written.push({ path: pngOut, bytes: pngBuf.length });
  console.log(`Extracted embedded PNG #${imageIndex}: ${(pngBuf.length / 1024 / 1024).toFixed(2)} MB → ${pngBasename}`);
}

writeFileSync(svgOut, lightSvg);

console.log(`Wrote ${svgOut} (${(statSync(svgOut).size / 1024).toFixed(1)} KB)`);
for (const w of written) {
  console.log(`Wrote ${w.path} (${(w.bytes / 1024 / 1024).toFixed(2)} MB)`);
}
