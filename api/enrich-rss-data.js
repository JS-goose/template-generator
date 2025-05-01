import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  console.log('API ROUTE HIT!!!!!!!!!!!!!!');
  const { url } = req.query;
/* !This is working and I'm pulling in the TOC section with extracted features like
   !Extracted features:  {
   !title: 'Video Player profiles',
   !anchor: '#video_player_profiles',
   !preview: '' }
   !But the URL passed from the FeedSelector is not dynamic so all of the features pulled in 
   !are from the same release notes page (the most recent one)
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

    if (!tocSection.length) {
      return res.status(404).json({ error: 'No "New Features" section found on this page.' });
    }

    const newFeatures = [];
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
        console.log('Extracted features: ',{title, anchor, preview})
        newFeatures.push({ title, anchor, url: fullUrl, preview });
      }
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ features: newFeatures });

  } catch (error) {
    console.error('Error in enrich-features with Puppeteer:', error);
    return res.status(500).json({ error: 'Failed to enrich features', details: error.message });
  }
}