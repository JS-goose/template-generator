<template>
  <article>
    <!-- TODO Add "Up to date at: 1843" or "Last Updated at 1843" component to show user when the last time data was pulled from RSS feed -->
    <div v-for="name in products" :key="name">
      <h1>{{ name }} Generator</h1>
      <!-- TODO This needs attention as it's not rendering properly.  The data is being updated and is accurage -->
      <p v-if="timesUpdated.pm != ''">Last updated: {{ timesUpdated.pm }}</p>
      <button @click="fetchRSSFeed(name)">Fetch {{ name }} Feed</button>
      <button @click="clearRSSFeedData(name)">Clear {{ name }} Feed Data</button>
      <ul>
        <li v-for="key in arrayToLoop(name)" :key="key.title" class="feed-selector-rss-list-item">
          <div>
            <label for="rss-list-item-include-checkbox">
              Include
              <input
                type="checkbox"
                name="rss-list-item-include-checkbox"
                id="rss-list-item-include-checkbox"
                @click="includeInTemplate(key)"
            /></label>
          </div>
          <div class="rss-list-item-title-container">
            <p>{{ key.title.toUpperCase() }}</p>
          </div>
          <div>
            {{ key.pubDate }}
          </div>
          <div>
            {{ key.desc }}
          </div>
          <div>
            {{ key.link }}
          </div>
        </li>
      </ul>
      <p v-if="fetchError">{{ fetchError }}</p>
    </div>
  </article>
</template>
<script>
import axios from 'axios';
import { parseString } from 'xml2js';

export default {
  data() {
    return {
      products: ['pm', 'dam', 'int'],
      fetchError: '',
      pmGroupedItemsArray: [],
      damGroupedItemsArray: [],
      intGroupedItemsArray: [],
      pmBaseURL: 'https://cloudinary.com/documentation/rss/cloudinary-pm-release-notes.xml',
      damBaseURL: 'https://cloudinary.com/documentation/rss/cloudinary-dam-release-notes.xml',
      intBaseURL: 'https://cloudinary.com/documentation/rss/cloudinary-int-release-notes.xml',
      jsonResults: null,
      fetchError: null,
      timesUpdated: { pm: '', dam: '', int: '' },
    };
  },
  methods: {
    async fetchRSSFeed(productType = 'pm') {
      console.log(productType);
      const productString = productType.includes('pm')
        ? this.pmBaseURL
        : productType.includes('dam')
        ? this.damBaseURL
        : productType.includes('int')
        ? this.intBaseURL
        : '';
      const proxy = 'https://thingproxy.freeboard.io/fetch/';
      this.jsonResults = null;
      this.fetchError = null;
      try {
        const response = await axios.get(proxy + productString);
        console.log('request sent', proxy + productString);
        await this.convertRssToJson(response.data, productString);
      } catch (error) {
        this.error = `Error fetching the ${productString} feed - check URL for accuracy`;
      }
    },
    convertRssToJson(xml, productString) {
      console.log('productString', productString);
      const now = new Date().toLocaleTimeString();
      return new Promise((resolve, reject) => {
        parseString(xml, { explicitArray: true }, (error, result) => {
          if (error) {
            this.error = 'Problem parsing the XML';
            reject('Problem parsing the XML');
            return;
          }
          const items = result.rss.channel[0].item;
          const grouped = {};
          let rssNum = 0;

          items.forEach((rssItem) => {
            rssItem.rssKey = rssNum++;
            console.log('RSSITEM', rssItem);
            const rssObj = rssItem.rssKey;

            if (!grouped[rssObj]) {
              grouped[rssObj] = [];
            }

            grouped[rssObj].push({
              pubDate: rssItem?.pubDate[0],
              desc: rssItem?.description[0],
              link: rssItem?.link[0],
              title: rssItem?.title[0],
              rssKey: rssItem?.key,
            });
          });
          // TODO validate changes and commit if accurate
          if (productString.includes('pm')) {
            this.timesUpdated.pm = now;
            this.pmGroupedItemsArray = Object.keys(grouped).map((key) => ({
              pubDate: grouped[key][0].pubDate,
              desc: grouped[key][0].desc,
              link: grouped[key][0].link,
              title: grouped[key][0].title,
              rssKey: key,
            }));
          } else if (productString.includes('dam')) {
            this.timesUpdated.dam = now;
            this.damGroupedItemsArray = Object.keys(grouped).map((key) => ({
              pubDate: grouped[key][0].pubDate,
              desc: grouped[key][0].desc,
              link: grouped[key][0].link,
              title: grouped[key][0].title,
              rssKey: key,
            }));
          } else {
            this.timesUpdated.int = now;
            this.intGroupedItemsArray = Object.keys(grouped).map((key) => ({
              pubDate: grouped[key][0].pubDate,
              desc: grouped[key][0].desc,
              link: grouped[key][0].link,
              title: grouped[key][0].title,
              rssKey: key,
            }));
          }
          resolve();
        });
      });
    },
    arrayToLoop(name) {
      if (name == 'pm') return this.pmGroupedItemsArray;
      if (name == 'dam') return this.damGroupedItemsArray;
      if (name == 'int') return this.intGroupedItemsArray;
    },
    clearRSSFeedData(productName) {
      if (productName == 'pm') return (this.pmGroupedItemsArray = []);
      if (productName == 'dam') return (this.damGroupedItemsArray = []);
      if (productName == 'int') return (this.intGroupedItemsArray = []);
    },
    includeInTemplate(rssItem) {
      // TODO Logic to include this/these items in the template to download
      console.log(rssItem);
    },
  },
  computed: {},
  watch: {
    message(newValue, oldValue) {
      console.log(newValue, oldValue);
    },
  },
};
</script>
<style lang="css" scoped>
.feed-selector-rss-list-item {
  max-width: 45%;
  text-align: left;
  display: inline-block;
  margin: 0.75em;
  padding: 0.35em;
  border: 1px solid gray;
  border-radius: 3px;
}

.rss-list-item-title-container > p {
  text-align: center;
}

ul {
  list-style-type: none;
  padding: 0;
}
</style>
