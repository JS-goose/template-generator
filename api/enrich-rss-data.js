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

    // Locate TOC section if present
    const tocSection = $('li.collapsibe > a[href="#new_features"]').closest('li.collapsibe');
    const allHeadings = $('h2[id]');

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
      // allHeadings already set above
      console.log('Total h2[id] on page:', allHeadings.length);

      const mainSections = allHeadings.filter((i, el) => {
        const id = $(el).attr('id');
        return !id.startsWith('ot-');
      });
      console.log('Release-note sections identified:', mainSections.length);

      if (mainSections.length > 0) {
        // Iterate each main release-note section
        mainSections.each((i, h2el) => {
          const $h2 = $(h2el);
          const title = $h2.text().trim();
          const anchor = `#${$h2.attr('id')}`;
          const fullUrl = `${url}${anchor}`;
          const sectionContent = $h2.nextUntil('h2');
          const preview = sectionContent.text().trim().slice(0, 300);
          // Gather links in this section
          const links = [];
          sectionContent.find('a').each((j, alink) => {
            const $a = $(alink);
            const linkText = $a.text().trim();
            const href = $a.attr('href');
            if (linkText && href) {
              links.push({ text: linkText, href });
            }
          });
          const feature = { title, anchor, url: fullUrl, preview, links };
          console.log('Extracted features:', feature);
          newFeatures.push(feature);

          // Extract subheadings (h3) within this section
          sectionContent.find('h3[id]').each((j, h3el) => {
            const $h3 = $(h3el);
            const subTitle = $h3.text().trim();
            const subAnchor = `#${$h3.attr('id')}`;
            const subFullUrl = `${url}${subAnchor}`;
            const subContent = $h3.nextUntil('h2, h3');
            const subPreview = subContent.text().trim().slice(0, 300);
            const subLinks = [];
            subContent.find('a').each((k, link) => {
              const $a = $(link);
              const linkText = $a.text().trim();
              const href = $a.attr('href');
              if (linkText && href) {
                subLinks.push({ text: linkText, href });
              }
            });
            const subFeature = { title: subTitle, anchor: subAnchor, url: subFullUrl, preview: subPreview, links: subLinks };
            console.log('Extracted features:', subFeature);
            newFeatures.push(subFeature);
          });
        });
      } else {
        // No top-level H2 sections; fallback to H3-only extraction
        console.log('No H2 sections found, falling back to scanning H3 headings');
        const allH3 = $('h3[id]');
        console.log('Total h3[id] found:', allH3.length);
        allH3.each((i, h3el) => {
          const $h3 = $(h3el);
          const title = $h3.text().trim();
          const anchor = `#${$h3.attr('id')}`;
          const fullUrl = `${url}${anchor}`;
          const content = $h3.nextUntil('h2, h3');
          const preview = content.text().trim().slice(0, 300);
          const links = [];
          content.find('a').each((j, link) => {
            const $a = $(link);
            const linkText = $a.text().trim();
            const href = $a.attr('href');
            if (linkText && href) {
              links.push({ text: linkText, href });
            }
          });
          const feature = { title, anchor, url: fullUrl, preview, links };
          console.log('Extracted features (h3 fallback):', feature);
          newFeatures.push(feature);
        });
      }
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