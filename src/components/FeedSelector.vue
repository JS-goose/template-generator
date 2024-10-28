<template>
  <article>
    <!-- TODO Add "Up to date at: 1843" or "Last Updated at 1843" component to show user when the last time data was pulled from RSS feed -->
    <div v-for="name in products" :key="name">
      <h1>{{ name }} Generator</h1>
      <button @click="fetchRSSFeed(name)">Fetch {{ name }} Feed</button>
      <ul>
        <li v-for="key in computedExample(name)" :key="key.title">
          <div>
            {{ key.title }}
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
      fetchError: String,
      pmGroupedItemsArray: [],
      damGroupedItemsArray: [],
      intGroupedItemsArray: [],
      pmBaseURL: 'https://cloudinary.com/documentation/rss/cloudinary-pm-release-notes.xml',
      damBaseURL: 'https://cloudinary.com/documentation/rss/cloudinary-dam-release-notes.xml',
      intBaseURL: 'https://cloudinary.com/documentation/rss/cloudinary-int-release-notes.xml',
      jsonResults: null,
      fetchError: null,
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
          if (productString.includes('pm')) {
            this.pmGroupedItemsArray = Object.keys(grouped).map((key) => ({
              pubDate: grouped[key][0].pubDate,
              desc: grouped[key][0].desc,
              link: grouped[key][0].link,
              title: grouped[key][0].title,
              rssKey: key,
            }));
          } else if (productString.includes('dam')) {
            this.damGroupedItemsArray = Object.keys(grouped).map((key) => ({
              pubDate: grouped[key][0].pubDate,
              desc: grouped[key][0].desc,
              link: grouped[key][0].link,
              title: grouped[key][0].title,
              rssKey: key,
            }));
          } else {
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
    computedExample(name) {
      if (name == 'pm') return this.pmGroupedItemsArray;
      if (name == 'dam') return this.damGroupedItemsArray;
      if (name == 'int') return this.intGroupedItemsArray;
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
@import '';
</style>
