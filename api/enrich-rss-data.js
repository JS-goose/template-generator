import chromium from 'chrome-aws-lambda';
import puppeteerCore from 'puppeteer-core';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  console.log('*********** ENRICH API ROUTE HIT ***********');
  const { url } = req.query;
  if (!url || !url.startsWith('https://cloudinary.com/documentation/')) {
    return res.status(400).json({ error: 'Missing or invalid `url` query param' });
  }

  const isDev = !process.env.AWS_REGION;
  let browser = null;

  try {
    const executablePath = isDev
      ? (await import('puppeteer')).executablePath()
      : await chromium.executablePath;

    const launchOptions = isDev
      ? {
          headless: true,
          executablePath,
        }
      : {
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath,
          headless: chromium.headless,
        };

    const puppeteerLib = isDev ? await import('puppeteer') : puppeteerCore;
    browser = await puppeteerLib.launch(launchOptions);

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
    await page.waitForSelector('a.anchor', { timeout: 10000 });
    const html = await page.content();
    console.log('Fetched dynamic HTML length:', html.length);

    const $ = cheerio.load(html);
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
      nextHeading.nextUntil('h2, h3').find('a[href]').each((j, linkEl) => {
        const $link = $(linkEl);
        const text = $link.text().trim();
        const href = $link.attr('href');
        if (text && href && href !== 'https://support.cloudinary.com/hc/en-us/requests/new') {
          links.push({ text, href });
        }
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
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
}