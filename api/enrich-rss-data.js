import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  console.log('API ROUTE HIT!!!!!!!!!!!!!!');
  const { url } = req.query;
/* !Extracted features are working correctly for pages with TOC sections.  However, for pages that do not
   !have TOC sections, I'm pulling in headings just not the correct headings.  This logic will need adjustment.
} */
  if (!url || !url.startsWith('https://cloudinary.com/documentation/')) {
    return res.status(400).json({ error: 'Missing or invalid `url` query param' });
  }

  try {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 0 });
    await new Promise(resolve => setTimeout(resolve, 3000));

    const html = await page.content();
    await browser.close();

    console.log('Fetched HTML via Puppeteer:', html.substring(0, 500));
    const $ = cheerio.load(html);

    const tocSection = $('li.collapsibe > a[href="#new_features"]').closest('li.collapsibe');
    console.log("Matched TOC section count:", tocSection.length);

    // Aggregate new features from TOC or fallback to scanning headings
    let newFeatures = [];
    if (tocSection.length) {
      // Extract from TOC when available
      const subTocLinks = tocSection.find('ul.sub-toc li.level-H3 a');
      subTocLinks.each((i, el) => {
        const title = $(el).text().trim();
        const anchor = $(el).attr('href');
        const fullUrl = `${url}${anchor}`;
        const sectionId = anchor.replace('#', '');
        const sectionEl = $(`#${sectionId}`);
        let preview = '';
        if (sectionEl.length) {
          preview = sectionEl.nextUntil('h2, h3').text().trim().slice(0, 300);
        }

        if (title && anchor) {
          console.log('Extracted features: ', {title, anchor, preview});
        }

        newFeatures.push({ title, anchor, url: fullUrl, preview });
      });
    } else {
      console.warn('No TOC section found, falling back to scanning headings');
      // Fallback: find all headings with id attributes and treat as sections
      $('h2[id], h3[id]').each((i, el) => {
        const $el = $(el);
        const title = $el.text().trim();
        const anchor = `#${$el.attr('id')}`;
        const fullUrl = `${url}${anchor}`;
        const sectionEl = $el;
        let preview = '';
        if (sectionEl.length) {
          preview = sectionEl.nextUntil('h2, h3').text().trim().slice(0, 300);
        }

        if (title && anchor) {
          console.log('Extracted features: ', {title, anchor, preview, fullUrl});
        }

        newFeatures.push({ title, anchor, url: fullUrl, preview });
      });
      if (!newFeatures.length) {
        return res.status(404).json({ error: 'No "New Features" section or headings found on this page.' });
      }
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ features: newFeatures });

  } catch (error) {
    console.error('Error in enrich-features with Puppeteer:', error);
    return res.status(500).json({ error: 'Failed to enrich features', details: error.message });
  }
}