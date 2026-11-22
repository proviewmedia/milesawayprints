/**
 * Archivo 900 (the site's display face) for next/og ImageResponse.
 * Satori's built-in font has no heavy weight, so share images and icons that
 * mimic the INQ PRESS logo load the real face. Requesting only the glyphs in
 * `text` keeps the download tiny; with no browser UA Google serves TTF, which
 * Satori can read (it can't read woff2).
 */
export async function loadArchivoBlack(text: string): Promise<ArrayBuffer> {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=Archivo:wght@900&text=${encodeURIComponent(text)}`,
  ).then((r) => r.text());
  const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error('Archivo font URL not found in Google Fonts CSS');
  return fetch(url).then((r) => r.arrayBuffer());
}
