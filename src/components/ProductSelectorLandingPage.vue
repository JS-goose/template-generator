<template>
  <section>
    <label for="all-rss-feeds-selection">
      Pull all RSS feeds
      <input type="checkbox" name="all-rss-feeds-selection" id="all-rss-feeds-selection" />
    </label>
    <FeedSelector />
  </section>
</template>

<script>
import FeedSelector from './FeedSelector.vue';
// import axios from 'axios';
// import { parseString } from 'xml2js';

export default {
  name: 'ProductSelectorLandingPage',
  components: {
    FeedSelector,
  },

  data() {
    return {};
  },
  methods: {},
};
</script>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: space-evenly;
}
</style>
