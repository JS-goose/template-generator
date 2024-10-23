<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <button @click="fetchRSSFeed">Fetch RSS Feed</button>
    <pre v-if="jsonResults">{{ jsonResults }}</pre>
    <p v-if="fetchError">{{ fetchError }}</p>
  </div>
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
    async fetchRSSFeed() {
      // Proxy isn't working - needs replacement
      const proxy = 'https://cors-anywhere.herokuapp.com/';
      this.jsonResults = null;
      this.fetchError = null;
      try {
        // This proxy needs to be looked at because it's returning a 403 forbidden
        const response = await axios.get(proxy + this.pmBaseURL);
        console.log('request sent');
        this.convertRssToJson(response.data);
      } catch (error) {
        this.error = `Error fetching the ${this.pmBaseURL} feed - check URL for accuracy`;
      }
    },
    convertRssToJson(xml) {
      parseString(xml, { explicitArray: false }, (error, result) => {
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
</style>
