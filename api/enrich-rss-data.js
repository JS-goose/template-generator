import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  console.log('*********** ENRICH API ROUTE HIT ***********');
  const { url } = req.query;
  if (!url || !url.startsWith('https://cloudinary.com/documentation/')) {
    return res.status(400).json({ error: 'Missing or invalid `url` query param' });
  }

  try {
    // Always use Puppeteer to fully render the page
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
    await page.waitForSelector('li.collapsibe > a[href="#new_features"], h2[id]', { timeout: 10000 });
    const html = await page.content();
    await browser.close();
    console.log('Fetched dynamic HTML length:', html.length);
    const $ = cheerio.load(html);

    // Unified release-notes extraction: grab all h2 and h3 under the main "Assets release notes" header
    const releaseH1 = $('h1').filter((i, el) =>
      $(el).text().trim().toLowerCase().endsWith('release notes')
    );
    if (!releaseH1.length) {
      return res.status(404).json({ error: 'Release notes header not found.' });
    }
    const headings = releaseH1.nextAll().filter('h2[id], h3[id]');
    console.log('Found release-note headings count:', headings.length);

    const newFeatures = [];
    headings.each((i, el) => {
      const $el = $(el);
      const title = $el.text().trim();
      const anchor = `#${$el.attr('id')}`;
      const fullUrl = `${url}${anchor}`;
      const tag = el.tagName.toLowerCase();
      // preview is content until next same-level or higher heading
      const preview = $el.nextUntil('h2, h3').text().trim().slice(0, 300);
      // collect any links in this section
      const links = [];
      $el.nextUntil('h2, h3').find('a').each((j, a) => {
        const $a = $(a);
        const text = $a.text().trim();
        const href = $a.attr('href');
        if (text && href) links.push({ text, href });
      });
      const feature = { title, anchor, url: fullUrl, preview, links };
      console.log('Extracted feature:', feature);
      newFeatures.push(feature);
    });
    if (!newFeatures.length) {
      return res.status(404).json({ error: 'No headings found in release notes.' });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ features: newFeatures });

  } catch (error) {
    console.error('Error in enrich-features with Puppeteer:', error);
    return res.status(500).json({ error: 'Failed to enrich features', details: error.message });
  }
}