/**
 * Free printing guides at /resources. Written for anyone getting something
 * printed, not only our customers, so the copy stays general: no prices,
 * turnaround promises, or named competitors. Each guide is a list of
 * blocks rendered by /resources/[slug].
 */

export type GuideBlock =
  | { type: 'h2'; text: string }
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'callout'; title: string; text: string };

export interface Guide {
  slug: string;
  title: string;
  /** One line shown on the hub card and as the meta description. */
  summary: string;
  category: 'Basics' | 'Apparel' | 'Paper' | 'Reference';
  readMinutes: number;
  blocks: GuideBlock[];
}

export const GUIDES: Guide[] = [
  {
    slug: 'print-methods',
    title: 'Print methods, compared',
    summary: 'Screen printing, DTG, DTF, embroidery, and sublimation: what each one is and when to use it.',
    category: 'Basics',
    readMinutes: 6,
    blocks: [
      {
        type: 'p',
        text: 'The right method depends on three things: what you are printing on, how many you need, and how many colors are in the design. Here is how the common methods compare.',
      },
      {
        type: 'table',
        head: ['Method', 'Best for', 'Works on', 'Feel'],
        rows: [
          ['Screen printing', 'Larger runs, bold designs with few colors', 'Cotton, blends, totes, paper', 'Ink sits on the fabric, slightly raised'],
          ['DTG', 'Small runs, full-color and photo designs', 'Cotton and high-cotton blends', 'Soft, ink soaks into the fabric'],
          ['DTF', 'Full color on almost any fabric', 'Cotton, polyester, blends, nylon', 'Smooth, thin film on the surface'],
          ['Embroidery', 'Logos on hats, polos, jackets', 'Most fabrics, thicker is better', 'Stitched and textured'],
          ['Sublimation', 'All-over prints, mugs, hard goods', 'White or light polyester, coated items', 'No feel at all, dye is in the fibers'],
        ],
      },
      { type: 'h2', text: 'Screen printing' },
      {
        type: 'p',
        text: 'Ink is pushed through a fine mesh screen onto the item. Each color needs its own screen, so setup takes time, but once the screens are made every extra piece is quick. That is why screen printing gets cheaper per piece as quantities go up, and why it is the usual choice for team shirts, events, and merch runs.',
      },
      {
        type: 'list',
        items: [
          'Strongest, most vivid color, especially on dark garments.',
          'Fewer colors in the design means fewer screens and a lower price.',
          'Many shops have a minimum order, often around a dozen pieces. It varies by shop.',
          'Photos and gradients are possible with halftones, but full-color art is often easier with DTG or DTF.',
        ],
      },
      { type: 'h2', text: 'Direct to garment (DTG)' },
      {
        type: 'p',
        text: 'A specialized inkjet printer prints the design straight onto the shirt. There are no screens, so one shirt costs about the same to set up as fifty. It handles unlimited colors and fine detail well.',
      },
      {
        type: 'list',
        items: [
          'Best on 100% cotton or high-cotton blends.',
          'Dark garments need a pretreatment and a white base layer, which adds cost.',
          'Colors can look a little softer than screen printing.',
        ],
      },
      { type: 'h2', text: 'DTF (direct to film) transfers' },
      {
        type: 'p',
        text: 'The design is printed onto a special film, coated with an adhesive powder, then heat-pressed onto the item. It is newer than the other methods and very flexible.',
      },
      {
        type: 'list',
        items: [
          'Works on cotton, polyester, blends, and many materials DTG cannot handle.',
          'Full color with no per-color setup.',
          'Large solid areas can feel less breathable than ink that soaks in.',
        ],
      },
      { type: 'h2', text: 'Embroidery' },
      {
        type: 'p',
        text: 'Thread is stitched directly into the item by machine. Your artwork is first converted into a stitch file, a step called digitizing. Embroidery looks premium and lasts a long time.',
      },
      {
        type: 'list',
        items: [
          'Ideal for hats, polos, jackets, and bags.',
          'Very small text and thin lines can blur, so simple shapes work best.',
          'Price is driven by stitch count, which grows with size and detail.',
        ],
      },
      { type: 'h2', text: 'Sublimation' },
      {
        type: 'p',
        text: 'Heat turns special ink into a gas that bonds with polyester fibers or a polymer coating. The design becomes part of the material, so it will not crack or peel.',
      },
      {
        type: 'list',
        items: [
          'Only works on polyester fabric or items with a sublimation coating, like many mugs and tumblers.',
          'Needs white or light-colored items, because the ink is see-through.',
          'Great for edge-to-edge, all-over designs.',
        ],
      },
      {
        type: 'callout',
        title: 'Quick rule of thumb',
        text: 'Many shirts with a simple design: screen printing. A few shirts with a colorful design: DTG or DTF. A logo on a hat: embroidery. A full-color mug: sublimation.',
      },
    ],
  },
  {
    slug: 'where-to-print',
    title: 'Where to get something printed',
    summary: 'Local shop, online printer, print-on-demand, or a full-service studio. How to pick the right one.',
    category: 'Basics',
    readMinutes: 5,
    blocks: [
      {
        type: 'p',
        text: 'There is no single best place to print. Each option trades off price, speed, control, and how much help you get. Here are the four main routes.',
      },
      {
        type: 'table',
        head: ['Option', 'Good for', 'Watch out for'],
        rows: [
          ['Local print shop', 'Seeing samples in person, quick local pickup', 'Limited to the methods that shop owns'],
          ['Online printer', 'Standard items when you already have finished artwork', 'Little design help, proofs can be automated'],
          ['Print-on-demand', 'Selling designs online with no inventory', 'Higher price per piece, limited control over blanks'],
          ['Full-service studio', 'Help from idea to finished product across many item types', 'Usually quote-based instead of instant pricing'],
        ],
      },
      { type: 'h2', text: 'Local print shop' },
      {
        type: 'p',
        text: 'A shop in your area, often specializing in one or two methods like screen printing or signs. You can see and feel samples before you commit, and talk to the person running the press.',
      },
      { type: 'h2', text: 'Online printers' },
      {
        type: 'p',
        text: 'Websites where you upload a file, pick options, and pay. They work well for standard products like business cards, stickers, or basic shirts when your file is already print-ready.',
      },
      { type: 'h2', text: 'Print-on-demand' },
      {
        type: 'p',
        text: 'Each item is printed only after someone orders it, often connected to an online store. It is a low-risk way to start selling merch because you never hold stock, but the cost per piece is higher than ordering in bulk.',
      },
      { type: 'h2', text: 'Full-service studio' },
      {
        type: 'p',
        text: 'A studio handles the whole project: helping with the design, choosing the right product and method, sending a proof, and managing production. This is the best fit when you need several kinds of items, are not sure what you need yet, or do not have print-ready artwork. The Inq Press works this way.',
      },
      { type: 'h2', text: 'Questions to ask any printer' },
      {
        type: 'list',
        items: [
          'Is there a minimum order quantity?',
          'Will I see a proof before anything is printed?',
          'What print method will you use, and why?',
          'Which brand and style of blank do you use? Can I see a sample?',
          'Are setup, screen, or digitizing fees included in the price?',
          'What happens if something arrives misprinted or damaged?',
          'How long does production take, and does shipping add to that?',
        ],
      },
      {
        type: 'callout',
        title: 'Always ask for a proof',
        text: 'A proof shows exactly what will be printed: placement, size, and colors. Approving one is the easiest way to avoid surprises.',
      },
    ],
  },
  {
    slug: 'preparing-artwork',
    title: 'How to prepare artwork for print',
    summary: 'File types, resolution, color, and sizing, explained without the jargon.',
    category: 'Basics',
    readMinutes: 6,
    blocks: [
      {
        type: 'p',
        text: 'Good artwork is the biggest factor in a good print. You do not need to be a designer, but knowing a few basics saves time and avoids blurry results.',
      },
      { type: 'h2', text: 'Vector vs. raster' },
      {
        type: 'p',
        text: 'Vector files are made of shapes and lines, so they can scale to any size without getting blurry. Raster files are made of pixels, like photos, and lose quality when enlarged.',
      },
      {
        type: 'table',
        head: ['Type', 'Common files', 'Best for'],
        rows: [
          ['Vector', 'AI, EPS, SVG, PDF (from a design app)', 'Logos, text, screen printing, embroidery, signs'],
          ['Raster', 'PNG, JPG, PSD, TIFF', 'Photos, painted or textured artwork'],
        ],
      },
      {
        type: 'callout',
        title: 'Saving as PDF does not make it vector',
        text: 'A photo placed into a PDF is still pixels. A file is only vector if it was drawn as shapes in a program like Illustrator, Affinity, Inkscape, or Figma.',
      },
      { type: 'h2', text: 'Resolution' },
      {
        type: 'p',
        text: 'For raster files, resolution is measured in DPI (dots per inch) at the size it will print. 300 DPI is the standard for anything viewed up close. Large posters and signs viewed from a distance can look fine at 150 DPI or lower.',
      },
      {
        type: 'list',
        items: [
          'To find the largest sharp print size, divide the pixel dimensions by 300.',
          'Example: a 3000 x 3600 pixel image prints sharp up to 10 x 12 inches.',
          'Raising the DPI number in an app without adding pixels does not add detail.',
          'Images saved from websites and social media are usually too small to print well.',
        ],
      },
      { type: 'h2', text: 'Color' },
      {
        type: 'list',
        items: [
          'Screens show color in RGB. Most printers print in CMYK, so very bright screen colors, like neon greens and electric blues, can print a little duller.',
          'For exact brand colors, share Pantone (PMS) codes if you have them. Screen printers mix ink to match them.',
          'Screen printing prices often depend on the number of colors, so simplifying the palette can lower the cost.',
        ],
      },
      { type: 'h2', text: 'Before you send your file' },
      {
        type: 'list',
        items: [
          'Use a transparent background for logos and designs on apparel, unless the background is part of the design.',
          'Convert text to outlines, or include the font files, so nothing gets swapped out.',
          'For paper, stickers, and signs, extend the background past the edge (called bleed), usually 1/8 inch on each side.',
          'Keep important text and logos at least 1/8 inch inside the edge, called the safe zone.',
          'Include the final size you want, or the measurements of the area you are printing on.',
        ],
      },
      {
        type: 'callout',
        title: 'No file yet?',
        text: 'A sketch, a photo of an old shirt, or a written description is enough to start a conversation with most studios.',
      },
    ],
  },
  {
    slug: 'choosing-blanks',
    title: 'Choosing shirts and blanks',
    summary: 'Fabric, weight, and fit, and which print methods work on each.',
    category: 'Apparel',
    readMinutes: 4,
    blocks: [
      {
        type: 'p',
        text: 'The blank is the item before it is printed. The same design can look and feel very different depending on the fabric and weight you choose.',
      },
      { type: 'h2', text: 'Fabric' },
      {
        type: 'table',
        head: ['Fabric', 'Feel', 'Prints well with'],
        rows: [
          ['100% cotton', 'Classic, breathable', 'Screen printing, DTG, DTF, embroidery'],
          ['Ring-spun cotton', 'Softer and smoother than standard cotton', 'Screen printing, DTG, DTF'],
          ['Cotton and poly blend', 'Soft, less shrinking and wrinkling', 'Screen printing, DTF'],
          ['Tri-blend', 'Very soft and drapey, slightly vintage look', 'Screen printing, DTF'],
          ['100% polyester', 'Light, stretchy, moisture-wicking', 'Sublimation (light colors), DTF'],
        ],
      },
      { type: 'h2', text: 'Weight' },
      {
        type: 'p',
        text: 'Fabric weight is listed in ounces per square yard (oz) or grams per square meter (GSM). One ounce is about 34 GSM. Heavier fabric feels thicker and more structured.',
      },
      {
        type: 'list',
        items: [
          'Lightweight, about 4.5 oz or less: soft and airy, good for hot weather and events.',
          'Midweight, about 5 to 6 oz: the everyday tee.',
          'Heavyweight, about 6 oz and up: thick, boxy, premium streetwear feel.',
        ],
      },
      { type: 'h2', text: 'Fit and sizing' },
      {
        type: 'list',
        items: [
          'Fits vary by brand, so check the size chart for the exact style.',
          'For groups, collect sizes before ordering. A common spread leans toward medium and large.',
          '100% cotton can shrink slightly after the first wash, especially in a hot dryer.',
        ],
      },
      {
        type: 'callout',
        title: 'Color matters too',
        text: 'Printing on dark garments usually needs a white base layer, which can add cost for DTG and screen printing. Sublimation does not work on dark fabric at all.',
      },
    ],
  },
  {
    slug: 'paper-and-posters',
    title: 'Paper, posters, and print sizes',
    summary: 'Paper types, standard sizes, and how to match your image to a frame.',
    category: 'Paper',
    readMinutes: 4,
    blocks: [
      { type: 'h2', text: 'Paper finishes' },
      {
        type: 'table',
        head: ['Finish', 'Look', 'Good for'],
        rows: [
          ['Matte', 'No shine, no glare', 'Art prints, maps, text-heavy designs'],
          ['Satin or luster', 'Soft sheen', 'Photos, posters'],
          ['Glossy', 'High shine, punchy color', 'Photos, promo posters (shows glare and fingerprints)'],
          ['Fine-art cotton rag', 'Textured, museum quality', 'Gallery prints and gifts'],
        ],
      },
      {
        type: 'p',
        text: 'Giclee refers to high-quality inkjet printing with archival pigment inks, usually on fine-art paper. It is the standard for art prints meant to last.',
      },
      { type: 'h2', text: 'Standard sizes and their shapes' },
      {
        type: 'p',
        text: 'Print sizes come in different proportions, called aspect ratios. If your image does not match the ratio of the size you pick, part of it will be cropped or you will get white space.',
      },
      {
        type: 'table',
        head: ['Size', 'Ratio', 'Notes'],
        rows: [
          ['8 x 10 in', '4:5', 'Common small frame'],
          ['11 x 14 in', 'about 4:5', 'Popular desk and shelf size'],
          ['16 x 20 in', '4:5', 'Same shape as 8 x 10, scaled up'],
          ['18 x 24 in', '3:4', 'Standard poster'],
          ['24 x 36 in', '2:3', 'Large poster, same shape as most camera photos'],
          ['A4, A3, A2, A1', '1:1.41', 'International sizes, each one double the last'],
        ],
      },
      {
        type: 'list',
        items: [
          'Phone photos are usually 4:3, so they fit 18 x 24 well.',
          'Most camera photos are 3:2, which fits 24 x 36 and 12 x 18.',
          'Square images need a square frame or a mat to avoid cropping.',
        ],
      },
      {
        type: 'callout',
        title: 'Framing tip',
        text: 'A mat adds a border inside the frame. If you want one, buy a frame one size up from the print, like a 16 x 20 frame with a mat opening for an 11 x 14 print.',
      },
    ],
  },
  {
    slug: 'glossary',
    title: 'Print glossary',
    summary: 'Plain-language definitions of the terms printers use.',
    category: 'Reference',
    readMinutes: 5,
    blocks: [
      {
        type: 'table',
        head: ['Term', 'Meaning'],
        rows: [
          ['Bleed', 'Extra background past the cut line so no white edge shows after trimming.'],
          ['Blank', 'The item before it is printed, like a plain shirt or mug.'],
          ['CMYK', 'Cyan, magenta, yellow, and black: the four ink colors most printers mix to make full color.'],
          ['Die-cut', 'A sticker cut through both the sticker and its backing in the shape of the design.'],
          ['Digitizing', 'Converting artwork into a stitch file for an embroidery machine.'],
          ['Discharge ink', 'A screen printing ink that removes the shirt dye and replaces it, leaving almost no feel.'],
          ['DPI', 'Dots per inch. How much detail an image has at the size it prints.'],
          ['Halftone', 'Tiny dots of one color that create the look of shading or gradients.'],
          ['Kiss-cut', 'A sticker cut through the sticker only, leaving the backing as a rectangle.'],
          ['Mockup', 'A picture showing your design on the product, used to preview placement.'],
          ['Pantone (PMS)', 'A standard color matching system so a color prints the same everywhere.'],
          ['Plastisol', 'The most common screen printing ink. Durable and vivid, sits on top of the fabric.'],
          ['Proof', 'The final preview you approve before production starts.'],
          ['Raster', 'An image made of pixels, like a photo.'],
          ['Safe zone', 'The area inside the edge where important text and logos should stay.'],
          ['Spot color', 'A single premixed ink color, used in screen printing instead of mixing CMYK.'],
          ['Stitch count', 'The number of stitches in an embroidery design. More stitches usually means a higher price.'],
          ['Underbase', 'A white layer printed first so colors stay bright on dark fabric.'],
          ['Vector', 'Artwork made of shapes and lines that can scale to any size without blurring.'],
          ['Water-based ink', 'A screen printing ink that soaks into the fabric for a soft feel.'],
        ],
      },
    ],
  },
];

export const RESOURCE_TOOLS = [
  {
    slug: 'print-size-calculator',
    title: 'Print size calculator',
    summary: 'Enter your image size and see how large it can print sharp.',
  },
];
