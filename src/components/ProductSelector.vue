<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
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
      this.jsonResults = null;
      this.fetchError = null;
      try {
        const response = await axios.get(this.pmBaseURL);
        this.convertRssToJson(response.data);
      } catch (error) {

      }
    },
    convertRssToJson(xml) {
      parseString
    }
  }
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
