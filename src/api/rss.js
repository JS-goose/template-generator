import NodeCache from "node-cache";

// ! 1 hour cache
const cache = new NodeCache({ stdTTL: 3600 }); 

export default async function handler(req, res) {
  try {
    // * Defaults to Programmable Media feed
    const feed = req.query.feed || "pm"; 
    const feedUrls = {
      pm: "https://cloudinary.com/documentation/rss/cloudinary-pm-release-notes.xml",
      dam: "https://cloudinary.com/documentation/rss/cloudinary-dam-release-notes.xml",
      int: "https://cloudinary.com/documentation/rss/cloudinary-int-release-notes.xml",
    };

    const rssUrl = feedUrls[feed];
    if (!rssUrl) {
      return res.status(400).json({ error: "Invalid feed type" });
    }

    // * Check cache for data before pulling new data
    const cachedData = cache.get(feed);
    if (cachedData) {
      console.log("Serving from cache:", feed);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/xml");
      return res.status(200).send(cachedData);
    }

    console.log("Fetching fresh RSS...", feed);
    const response = await fetch(rssUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS Feed: ${response.statusText}`);
    }

    // * Store in cache
    const xmlData = await response.text();
    cache.set(feed, xmlData); 

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(xmlData);
  } catch (error) {
    console.error("Error fetching RSS:", error);
    res.status(500).json({ error: "Failed to fetch RSS feed" });
  }
}
