import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url || !url.startsWith('https://cloudinary.com/documentation/')) {
    return res.status(400).json({ error: 'Missing or invalid `url` query param' });
  }

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const newFeatures = [];

    $('a.anchor').each((i, el) => {
      const $a = $(el);
      const anchorName = $a.attr('name');
      const nextHeading = $a.next('h2, h3');
      if (!nextHeading.length) return;

      const title = nextHeading.text().trim();
      const anchor = `#${anchorName}`;
      const fullUrl = `${url}${anchor}`;
      if (title.toLowerCase().includes('register for notifications')) return;

      const preview = nextHeading.nextUntil('h2, h3').text().trim().slice(0, 350);

      const links = [];
      nextHeading.nextUntil('h2, h3').find('a[href]').each((_, linkEl) => {
        const $link = $(linkEl);
        const text = $link.text().trim();
        const href = $link.attr('href');
        if (text && href && href !== 'https://support.cloudinary.com/hc/en-us/requests/new') {
          links.push({ text, href });
        }
      });

      newFeatures.push({ title, anchor, url: fullUrl, preview, links });
    });

    if (!newFeatures.length) {
      return res.status(404).json({ error: 'No section headings found.' });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({ features: newFeatures });
  } catch (error) {
    console.error('Error enriching data:', error);
    return res.status(500).json({
      error: 'Failed to enrich features',
      message: error.message,
      stack: error.stack,
    });
  }
}