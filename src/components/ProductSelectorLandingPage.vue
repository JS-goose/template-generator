<template>
  <section id="all-feeds-wrapper">
    <div id="all-feeds-control-container">
      <button @click="pullAllRSSFeeds()" class="all-feeds-buttons">
        Pull All RSS Feeds
      </button>
      <button @click="generateTemplate" class="all-feeds-buttons">
        Generate Template
      </button>
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
      <button
        v-if="this.displayClearBtn"
        @click="clearAllFeedsData()"
        class="all-feeds-buttons"
      >
        Clear All RSS Feed Data
      </button>
    </div>
    <FeedSelector :tagSearchInputValue="tagSearchInputValue" ref="child" />
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
        displayClearBtn: false,
      };
    },
    methods: {
      // * Emit events to child component
      pullAllRSSFeeds() {
        this.$refs.child.fetchRSSFeed("pm");
        this.$refs.child.fetchRSSFeed("dam");
        this.$refs.child.fetchRSSFeed("int");
        this.displayClearBtn = true;
      },
      // * Emit events to child component
      clearAllFeedsData() {
        this.$refs.child.clearRSSFeedData("pm");
        this.$refs.child.clearRSSFeedData("dam");
        this.$refs.child.clearRSSFeedData("int");
        this.displayClearBtn = false;
      },
      generateTemplate() {
        console.log("GENERATE TEMPLATE");
      },
    },
  };
</script>

<style scoped>
  section {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    align-items: center;
  }

  .all-feeds-buttons {
    margin: 5px;
  }

  button {
    max-width: 20em;
  }
</style>
