<template>
  <section>
    <div>
      <h1>PM Generator</h1>
      <button @click="fetchRSSFeed(this.pmBaseURL)">Fetch PM RSS Feed</button>
      <!-- <pre v-if="jsonResults">{{ jsonResults }}</pre> -->
      <pre v-for="key in jsonResults" :key="key.title">
        key:{{ key }}: desc:{{  }}
       </pre
      >
      <p v-if="fetchError">{{ fetchError }}</p>
    </div>
    <!-- <div>
      <h1>DAM Generator</h1>
      <button @click="fetchRSSFeed(this.damBaseURL)">Fetch DAM RSS Feed</button>
      <pre v-if="jsonResults">{{ jsonResults }}</pre>
      <p v-if="fetchError">{{ fetchError }}</p>
    </div>
    <div>
      <h1>CLD Integrations Generator</h1>
      <button @click="fetchRSSFeed(this.cldIntURL)">Fetch Integrations RSS Feed</button>
      <pre v-if="jsonResults">{{ jsonResults }}</pre>
      <p v-if="fetchError">{{ fetchError }}</p>
    </div> -->
  </section>
</template>

<script>
import axios from 'axios';
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
    };
  },
  methods: {
    async fetchRSSFeed(productTypeURL) {
      console.log(productTypeURL);
      // Proxy isn't working - needs replacement
      const proxy = 'https://thingproxy.freeboard.io/fetch/';
      this.jsonResults = null;
      this.fetchError = null;
      try {
        const response = await axios.get(proxy + productTypeURL);
        console.log('request sent');
        this.convertRssToJson(response.data);
        console.log(response.data)
      } catch (error) {
        //
        this.error = `Error fetching the ${productTypeURL} feed - check URL for accuracy`;
      }
    },
    convertRssToJson(xml) {
      parseString(xml, { explicitArray: true }, (error, result) => {
        if (error) {
          this.error = 'Problem parsing the XML';
          return;
        }
        this.jsonResults = JSON.stringify(result, null, 2);
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
  flex-direction: row;
  width: 100vw;
  justify-content: space-evenly;
}
</style>
