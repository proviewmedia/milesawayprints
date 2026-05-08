import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/** Read an SVG template out of the /public folder. Used by the marathon
 *  customizer page to inline the template server-side so the customer's
 *  live preview can mutate text nodes without a separate fetch. */
export function loadSvgFromPublic(publicPath: string): Promise<string> {
  const safe = publicPath.startsWith('/') ? publicPath.slice(1) : publicPath;
  return readFile(join(process.cwd(), 'public', safe), 'utf8');
}
