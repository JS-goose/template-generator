<template>
  <section>
    <h1>RSS Feed to Email Template Generator</h1>
    <div>
      <button @click="pullAllRSSFeeds()" class="all-feeds-buttons">Pull All RSS Feeds</button>
      <label for="all-rss-feeds-tag-search">
        Tag Search
        <input
          type="text"
          name="all-rss-feeds-tag-search"
          id="all-rss-feeds-tag-search"
          placeholder="ai, video, etc."
          v-model="tagSearchInputValue"
          maxlength="250"
      /></label>
      <button v-if="this.displayClearBtn" @click="clearAllFeedsData()" class="all-feeds-buttons">
        Clear All RSS Feed Data
      </button>
    </div>
    <FeedSelector :tagSearchInputValue="tagSearchInputValue" ref="child" />
    <button>Generate Email Copy</button>
  </section>
</template>

<script>
import FeedSelector from './FeedSelector.vue';

export default {
  name: 'ProductSelectorLandingPage',
  components: {
    FeedSelector,
  },

  data() {
    return {
      tagSearchInputValue: '',
      displayClearBtn: false,
    };
  },
  methods: {
    pullAllRSSFeeds() {
      this.$refs.child.fetchRSSFeed('pm');
      this.$refs.child.fetchRSSFeed('dam');
      this.$refs.child.fetchRSSFeed('int');
      this.displayClearBtn = true;
    },
    clearAllFeedsData() {
      this.$refs.child.clearRSSFeedData('pm');
      this.$refs.child.clearRSSFeedData('dam');
      this.$refs.child.clearRSSFeedData('int');
      this.displayClearBtn = false;
    },
  },
};
</script>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: space-evenly;
}

.all-feeds-buttons {
  margin: 5px;
}

button {
  max-width: 20em;
}
</style>
