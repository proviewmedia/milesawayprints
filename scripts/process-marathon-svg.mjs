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

// Find the first embedded PNG data URL in an xlink:href (or href).
// Pattern is robust against arbitrary whitespace inside the base64 payload.
const dataUrlRe = /(xlink:href|href)="data:image\/png;base64,([^"]+)"/;
const m = svg.match(dataUrlRe);
if (!m) {
  console.error('No embedded PNG data URL found in SVG.');
  process.exit(2);
}

const [, attr, b64] = m;
const cleaned = b64.replace(/\s+/g, '');
const pngBuf = Buffer.from(cleaned, 'base64');
console.log(`Extracted embedded PNG: ${(pngBuf.length / 1024 / 1024).toFixed(2)} MB`);

const pngOut = `${outputPrefix}.png`;
const svgOut = `${outputPrefix}.svg`;
const pngBasename = basename(pngOut);

writeFileSync(pngOut, pngBuf);

// Replace the data URL with an absolute path under /public so the SVG can
// be inlined into any HTML page and still locate the route image.
const publicHref = `/marathons/${pngBasename}`;
const lightSvg = svg.replace(dataUrlRe, `${attr}="${publicHref}"`);
writeFileSync(svgOut, lightSvg);

console.log(`Wrote ${svgOut} (${(statSync(svgOut).size / 1024).toFixed(1)} KB)`);
console.log(`Wrote ${pngOut} (${(statSync(pngOut).size / 1024 / 1024).toFixed(2)} MB)`);
