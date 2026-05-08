import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import { put } from '@vercel/blob';
import {
  applyMarathonValues,
  loadSvgFromPublic,
  svgPathForVariant,
} from '@/lib/marathon-svg';
import type { MarathonCustomization, MarathonRow } from '@/data/marathons';

/** Render a personalized marathon poster to a print-resolution PNG and
 *  upload it to Vercel Blob. Returns the public Blob URL ready to be
 *  attached to a Printful order's `files` field. */
export async function renderAndUploadMarathonPng(
  marathon: MarathonRow,
  customization: MarathonCustomization,
  options: { orderToken: string; widthPx?: number },
): Promise<{ url: string; bytes: number }> {
  const widthPx = options.widthPx ?? 2400; // ~200 DPI on a 12" wide print

  const svgPath = svgPathForVariant(marathon, customization.variant);
  if (!svgPath) {
    throw new Error(`No SVG template for ${marathon.slug} ${customization.variant}`);
  }

  const rawSvg = await loadSvgFromPublic(svgPath);

  // resvg cannot fetch external images via http on its own — re-embed the
  // referenced PNG as a base64 data URL so the rasterizer has everything
  // it needs locally.
  const inlinedSvg = await inlineExternalPngs(rawSvg);

  // Apply customer values via string replacement.
  const personalized = applyMarathonValues(inlinedSvg, customization);

  const resvg = new Resvg(Buffer.from(personalized), {
    fitTo: { mode: 'width', value: widthPx },
    font: {
      loadSystemFonts: true,
      defaultFontFamily: 'Josefin Sans',
    },
    background: 'transparent',
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  const filename = `marathons/${options.orderToken}-${marathon.slug}-${customization.variant}.png`;
  const { url } = await put(filename, pngBuffer, {
    access: 'public',
    contentType: 'image/png',
  });

  return { url, bytes: pngBuffer.length };
}

/** Walk the SVG for any <image> element pointing at a same-origin path
 *  under /public and rewrite it to an inline `data:image/png;base64,…`
 *  URL. Only public-folder paths are inlined; remote URLs are left alone. */
async function inlineExternalPngs(svg: string): Promise<string> {
  const re = /(xlink:href|href)="(\/[^"]+\.png)"/g;
  const replacements: Array<{ from: string; to: string }> = [];
  const matches = Array.from(svg.matchAll(re));
  for (const match of matches) {
    const [whole, attr, path] = match;
    try {
      const buf = await readFile(join(process.cwd(), 'public', path.slice(1)));
      const dataUrl = `data:image/png;base64,${buf.toString('base64')}`;
      replacements.push({ from: whole, to: `${attr}="${dataUrl}"` });
    } catch {
      // file not found — leave as-is, resvg will skip it
    }
  }
  let out = svg;
  for (const r of replacements) {
    out = out.replace(r.from, r.to);
  }
  return out;
}
