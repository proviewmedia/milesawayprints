#!/usr/bin/env node
// Render a marathon route map PNG by stitching OSM tiles and overlaying
// the course as a red polyline. Output is a square image that drops
// into the Las Vegas SVG frame in place of the embedded route raster.
//
// Usage:
//   node scripts/generate-marathon-route.mjs <slug>
//
// Slugs are defined inline below alongside their waypoint lists. The
// waypoints don't have to be GPS-accurate to the meter — they just need
// to trace the recognizable shape of the course at marathon-poster scale.

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import StaticMaps from 'staticmaps';

// Coords are [longitude, latitude] (staticmaps convention).
const ROUTES = {
  boston: {
    name: 'Boston',
    // Hopkinton → Ashland → Framingham → Natick → Wellesley → Newton →
    // Brookline → Kenmore → Boylston St finish. Approximate tracking
    // points along the actual course; not the full GPX trace but close
    // enough for a poster's worth of detail.
    waypoints: [
      [-71.5226, 42.2287],
      [-71.4626, 42.2620],
      [-71.4162, 42.2793],
      [-71.3496, 42.2845],
      [-71.2924, 42.2968],
      [-71.2470, 42.3170],
      [-71.2089, 42.3370],
      [-71.1668, 42.3338],
      [-71.1212, 42.3318],
      [-71.0958, 42.3489],
      [-71.0780, 42.3492],
    ],
  },
};

const slug = process.argv[2];
if (!slug || !ROUTES[slug]) {
  console.error(`Usage: generate-marathon-route.mjs <slug>\nKnown slugs: ${Object.keys(ROUTES).join(', ')}`);
  process.exit(1);
}

const route = ROUTES[slug];

const map = new StaticMaps({
  width: 1600,
  height: 1600,
  // OSM tile policy requires identifying user-agent and limits volume.
  tileLayer: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    headers: { 'User-Agent': 'milesawayprints-marathon-test/0.1' },
  },
  paddingX: 80,
  paddingY: 80,
});

// Red course line — same hue as the LV poster's route.
map.addLine({
  coords: route.waypoints,
  color: '#dc2626',
  width: 8,
});

// Start + finish markers as small filled circles drawn directly onto the
// canvas via the `addCircle` helper (no external icon files needed).
map.addCircle({
  coord: route.waypoints[0],
  radius: 200, // metres
  fill: '#dc2626',
  color: '#dc2626',
  width: 0,
});
map.addCircle({
  coord: route.waypoints[route.waypoints.length - 1],
  radius: 200,
  fill: '#1a1a2e',
  color: '#1a1a2e',
  width: 0,
});

const outDir = join(process.cwd(), 'public', 'marathons');
await mkdir(outDir, { recursive: true });
const outPng = join(outDir, `${slug}-full.png`);

await map.render();
await map.image.save(outPng);

console.log(`Wrote ${outPng}`);
