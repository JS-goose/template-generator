<template>
  <section>
    <label for="all-rss-feeds-selection">
      Pull all RSS feeds
      <input type="checkbox" name="all-rss-feeds-selection" id="all-rss-feeds-selection" />
    </label>
    <div>
      <h1>PM Generator</h1>
      <button @click="fetchRSSFeed(this.pmBaseURL)">Fetch PM RSS Feed</button>
      <pre v-for="key in this.pmGroupedItemsArray" :key="key.title">
        {{ key }}
       </pre
      >
      <p v-if="fetchError">{{ fetchError }}</p>
    </div>
    <div>
      <h1>DAM Generator</h1>
      <button @click="fetchRSSFeed(this.damBaseURL)">Fetch PM RSS Feed</button>
      <pre v-for="key in this.damGroupedItemsArray" :key="key.title">
        {{ key }}
       </pre
      >
      <p v-if="fetchError">{{ fetchError }}</p>
    </div>
    <div>
      <h1>CLD Integrations Generator</h1>
      <button @click="fetchRSSFeed(this.cldIntURL)">Fetch PM RSS Feed</button>
      <pre v-for="key in this.intGroupedItemsArray" :key="key.title">
        {{ key }}
       </pre
      >
      <p v-if="fetchError">{{ fetchError }}</p>
    </div>
  </section>
</template>

<script>
import axios from 'axios';
import { title } from 'process';
import { parseString } from 'xml2js';

export default {
  name: 'ProductSelector',
  props: {
    msg: String,
  },
  data() {
    return {
      pmBaseURL: 'https://cloudinary.com/documentation/rss/cloudinary-pm-release-notes.xml',
      damBaseURL: 'https://cloudinary.com/documentation/rss/cloudinary-dam-release-notes.xml',
      cldIntURL: 'https://cloudinary.com/documentation/rss/cloudinary-int-release-notes.xml',
      jsonResults: null,
      fetchError: null,
      pmGroupedItemsArray: [],
      damGroupedItemsArray: [],
      intGroupedItemsArray: [],
    };
  },
  methods: {
    async fetchRSSFeed(productTypeURL = this.pmBaseURL) {
      console.log(productTypeURL);
      const productString = productTypeURL.includes('cloudinary-pm-release-notes.xml')
        ? 'pm'
        : productTypeURL.includes('cloudinary-dam-release-notes.xml')
        ? 'dam'
        : productTypeURL.includes('cloudinary-int-release-notes.xml')
        ? 'int'
        : '';
      const proxy = 'https://thingproxy.freeboard.io/fetch/';
      this.jsonResults = null;
      this.fetchError = null;
      try {
        const response = await axios.get(proxy + productTypeURL);
        console.log('request sent');
        await this.convertRssToJson(response.data, productString);
        // console.log(response.data, typeof response.data);
      } catch (error) {
        //
        this.error = `Error fetching the ${productTypeURL} feed - check URL for accuracy`;
      }
    },
    convertRssToJson(xml, productString) {
      return new Promise((resolve, reject) => {
        parseString(xml, { explicitArray: true }, (error, result) => {
          if (error) {
            this.error = 'Problem parsing the XML';
            reject('Problem parsing the XML');
            return;
          }
          // this.jsonResults = JSON.stringify(result, null, 2);
          const items = result.rss.channel[0].item;
          const grouped = {};
          let rssNum = 0;

          items.forEach((rssItem) => {
            // rssItem.push({key:key++})
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
          //! Need to clear the array each time before adding new items
          // Not reliably updating with new results - will need a watch and then update when new information has arrived as the array is reactive
          if (productString == 'pm') {
            this.pmGroupedItemsArray = Object.keys(grouped).map((key) => ({
              pubDate: grouped[key][0].pubDate,
              desc: grouped[key][0].desc,
              link: grouped[key][0].link,
              title: grouped[key][0].title,
              rssKey: key,
            }));
          } else if (productString == 'dam') {
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
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

section {
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: space-evenly;
}

section > div {
  width: 300px;
}
</style>
