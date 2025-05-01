import fetch from 'node-fetch';
import cheerio from 'cheerio';

export default async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url || !url.startsWith('https://cloudinary.com/documentation/')) {
      return res.status(400).json({ error: 'Missing or invalid `url` query param' });
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch HTML content from: ${url}`);
    }
    
    console.log('Fetching this url:', url)
    const html = await response.text();
    const $ = cheerio.load(html);
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      const text = $(el).text();
      console.log(`Anchor [${i}]: href=${href}, text=${text}`);
    });
    const newFeatures = [];

    // * Find "New Features" TOC block
    const tocSection = $('li.collapsibe a[href="#new_features"]').closest('li.collapsibe');

    if (!tocSection.length) {
      console.error("No matching TOC section for #new_features");
      return res.status(404).json({ error: 'No "New Features" section found on this page.' });
    }

    tocSection.find('ul.sub-toc li.level-H3 a').each((i, el) => {
      const title = $(el).text().trim();
      const anchor = $(el).attr('href'); // * example -> #video_player_profiles
      const fullUrl = `${url}${anchor}`; // * example -> https://...#video_player_profiles
      const sectionId = anchor.replace('#', '');
      const sectionEl = $(`#${sectionId}`);

      // * Gets next sibling content until the next header
      const preview = sectionEl.nextUntil('h2, h3').text().trim().slice(0, 300);

      newFeatures.push({
        title,
        anchor,
        url: fullUrl,
        preview
      });
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ features: newFeatures });

  } catch (error) {
    console.error('Error in enrich-features:', error);
    res.status(500).json({ error: 'Failed to enrich features', details: error.message });
  }
}