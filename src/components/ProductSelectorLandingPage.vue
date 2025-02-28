<template>
  <section id="all-feeds-wrapper">
    <div id="all-feeds-control-container">
      <button @click="pullAllRSSFeeds()" class="all-feeds-buttons">
        Pull All RSS Feeds
      </button>
      <button @click="fetchTemplateData" class="all-feeds-buttons">
        Generate Template
      </button>
      <label for="all-rss-feeds-tag-search">
        Search
        <input
          type="text"
          name="all-rss-feeds-tag-search"
          id="all-rss-feeds-tag-search"
          placeholder="Comma separated tags, keywords, or date"
          title="Format = yyyy-mm-dd/mm-dd-yyyy/dd-mm-yyyy"
          v-model="searchInputValue"
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
    <FeedSelector :searchInputValue="searchInputValue" ref="feedSelectorRef" />
    <EmailTemplate
      v-show="emailTemplates.length > 0"
      :emailTemplates="emailTemplates"
    />
  </section>
</template>

<script>
  import FeedSelector from "./FeedSelector.vue";
  import EmailTemplate from "./EmailTemplate.vue";

  export default {
    name: "ProductSelectorLandingPage",
    components: {
      FeedSelector,
      EmailTemplate,
    },

    data() {
      return {
        searchInputValue: "",
        displayClearBtn: false,
        rssDataFromFeedSelector: [],
        emailTemplates: [],
      };
    },
    methods: {
      // * Emit events to child component
      pullAllRSSFeeds() {
        this.$refs.feedSelectorRef.fetchRSSFeed("pm");
        this.$refs.feedSelectorRef.fetchRSSFeed("dam");
        this.$refs.feedSelectorRef.fetchRSSFeed("int");
        this.displayClearBtn = true;
      },
      // * Emit events to feedSelectorRef component
      clearAllFeedsData() {
        this.$refs.feedSelectorRef.clearRSSFeedData("pm");
        this.$refs.feedSelectorRef.clearRSSFeedData("dam");
        this.$refs.feedSelectorRef.clearRSSFeedData("int");
        this.searchInputValue = "";
        this.emailTemplates = [];
        this.displayClearBtn = false;
      },
      fetchTemplateData() {
        // * Pull data from child component
        if (this.$refs.feedSelectorRef) {
          this.rssDataFromFeedSelector = this.$refs.feedSelectorRef.getRssData();
          console.warn("Fetched Data:", this.rssDataFromFeedSelector);
          // TODO Needs better error handling
          if (this.rssDataFromFeedSelector.length === 0) {
            console.error("No data received from FeedSelector!");
            return;
          }
          this.generateEmailTemplate();
        }
      },
      generateEmailTemplate() {
        if (!this.rssDataFromFeedSelector.length) {
          console.warn("No RSS items to generate template.");
          return;
        }

        this.emailTemplates = this.rssDataFromFeedSelector.map((item) => ({
          title: item.title || "Untitled",
          desc: item.desc
            ? item.desc.replace(/\n/g, "<br>")
            : "No description available.",
          link: item.link || "#",
          pubDate: item.pubDate || "Unknown date",
        }));

        console.log("Generated Templates:", this.emailTemplates);
      },
    },
  };
</script>

<style scoped>
  #all-feeds-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }

  .all-feeds-buttons {
    margin: 5px;
  }

  #all-rss-feeds-tag-search {
    width: 300px;
    margin: 10px 0;
  }

  button {
    max-width: 20em;
  }
</style>
