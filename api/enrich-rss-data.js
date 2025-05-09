import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  console.log('*********** ENRICH API ROUTE HIT ***********');
  const { url } = req.query;
  if (!url || !url.startsWith('https://cloudinary.com/documentation/')) {
    return res.status(400).json({ error: 'Missing or invalid `url` query param' });
  }

  try {
    // * Always use Puppeteer to fully render the page
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
    await page.waitForSelector('li.collapsibe > a[href="#new_features"], h2[id]', { timeout: 10000 });
    const html = await page.content();
    await browser.close();
    console.log('Fetched dynamic HTML length:', html.length);
    const $ = cheerio.load(html);

    const newFeatures = [];

$('a.anchor').each((i, el) => {
  const $a = $(el);
  const anchorName = $a.attr('name');

  // *Looks for the next heading (h2 or h3) in the HTML
  const nextHeading = $a.next('h2, h3');
  if (!nextHeading.length) return;

  const tag = nextHeading[0].tagName.toLowerCase();
  const title = nextHeading.text().trim();
  const anchor = `#${anchorName}`;
  const fullUrl = `${url}${anchor}`;

  // *Gets the paragraphs between current heading and next h2/h3 to be used as the preview
  const preview = nextHeading.nextUntil('h2, h3').text().trim().slice(0, 300);

  const links = [];
  nextHeading.nextUntil('h2, h3').find('a[href]').each((j, linkEl) => {
    const $link = $(linkEl);
    const text = $link.text().trim();
    const href = $link.attr('href');
    if (text && href) links.push({ text, href });
  });

  const feature = { title, anchor, url: fullUrl, preview, links };
  console.log('[EXTRACTED FEATURE]', feature);
  newFeatures.push(feature);
});

    if (!newFeatures.length) {
      return res.status(404).json({ error: 'No section headings found.' });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ features: newFeatures });

  } catch (error) {
    console.error('Error in enrich-features with Puppeteer:', error);
    return res.status(500).json({ error: 'Failed to enrich features', details: error.message });
  }
}