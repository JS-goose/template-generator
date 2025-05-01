import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  console.log('API ROUTE HIT!!!!!!!!!!!!!!')
  try {
    const { url } = req.query;

    if (!url || !url.startsWith('https://cloudinary.com/documentation/')) {
      return res.status(400).json({ error: 'Missing or invalid `url` query param' });
    }

    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      console.error("Fetch failed. Status:", response.status, "Body:", text);
      throw new Error(`Failed to fetch HTML content from: ${url}`);
    }

    console.log('Fetching this url:', url)
    const html = await response.text();
    const $ = cheerio.load(html);

    // Debug: print a snippet of the fetched HTML
    console.log("Fetched HTML preview:", html.substring(0, 500));

    const newFeatures = [];

    // Find New Features TOC section
    const tocSection = $('li.collapsibe > a[href="#new_features"]').closest('li.collapsibe');
    console.log("Matched TOC section count:", tocSection.length);

    if (!tocSection.length) {
      console.error("No matching TOC section for #new_features");
      // Fallback: log the HTML snippet for debugging
      console.log("Fallback HTML snippet:", html.substring(0, 500));
      return res.status(404).json({ error: 'No "New Features" section found on this page.' });
    }

    try {
      const subTocLinks = tocSection.find('ul.sub-toc li.level-H3 a');
      console.log("Sub-TOC links found:", subTocLinks.length);

      subTocLinks.each((i, el) => {
        const title = $(el).text().trim();
        const anchor = $(el).attr('href');
        const fullUrl = `${url}${anchor}`;
        const sectionId = anchor.replace('#', '');
        const sectionEl = $(`#${sectionId}`);

        let preview = '';
        if (sectionEl.length) {
          preview = sectionEl.nextUntil('h2, h3').text().trim().slice(0, 300);
        } else {
          console.warn(`Section element with id ${sectionId} not found`);
        }

        if (title && anchor) {
          newFeatures.push({ title, anchor, url: fullUrl, preview });
        } else {
          console.warn('SKIPPED WEIRD TOC ENTRY:', { title, anchor });
        }
      });
    } catch (scrapeErr) {
      console.error("Error during TOC scraping:", scrapeErr);
      // Fallback: log the HTML snippet for debugging
      console.log("Fallback HTML snippet:", html.substring(0, 500));
      return res.status(500).json({ error: "Scraping error", details: scrapeErr.message });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ features: newFeatures });

  } catch (error) {
    console.error('Error in enrich-features:', error);
    res.status(500).json({ error: 'Failed to enrich features', details: error.message });
  }
}