<template>
  <section>
    <h1>RSS Feed to Email Template Generator</h1>
    <div>
      <button>Pull All RSS Feeds</button>
      <!-- TODO Build logic for tag search -->
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
    </div>
    <FeedSelector :tagSearchInputValue="tagSearchInputValue" />
  </section>
</template>

<script>
  import FeedSelector from "./FeedSelector.vue";

  export default {
    name: "ProductSelectorLandingPage",
    components: {
      FeedSelector,
    },

    data() {
      return {
        tagSearchInputValue: "",
      };
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
