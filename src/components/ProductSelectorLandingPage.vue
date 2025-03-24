<template>
  <section id="all-feeds-wrapper">
    <FeedSelector
      ref="feedSelectorRef"
      @templateObjsUpdated="handleTemplateUpdate"
      @generateTemplate="fetchTemplateData"
    />
    <EmailTemplate
      v-if="showTemplateModal"
      :emailTemplates="emailTemplates"
      :closeTemplateModal="toggleTemplateModal"
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
        // displayClearBtn: false,
        rssDataFromFeedSelector: [],
        emailTemplates: [],
        showTemplateModal: false,
        templateObjsUpdated: false,
        templateObjsLength: 0,
      };
    },
    computed: {
      templateUpdated() {
        return this.templateObjsUpdated && this.templateObjsLength;
      },
    },
    methods: {
      handleTemplateUpdate(count) {
        this.templateObjsUpdated = true;
        this.templateObjsLength = count;
      },
      // * Emit events to child component
      pullAllRSSFeeds() {
        this.$refs.feedSelectorRef.fetchRSSFeed("pm");
        this.$refs.feedSelectorRef.fetchRSSFeed("dam");
        this.$refs.feedSelectorRef.fetchRSSFeed("int");
        // this.displayClearBtn = true;
      },
      // * Emit events to feedSelectorRef component
      clearAllFeedsData() {
        // this.$refs.feedSelectorRef.clearRSSFeedData("pm");
        // this.$refs.feedSelectorRef.clearRSSFeedData("dam");
        // this.$refs.feedSelectorRef.clearRSSFeedData("int");
        // this.searchInputValue = "";
        this.emailTemplates = [];
        // this.displayClearBtn = false;
        this.showTemplateModal = false;
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
        // TODO Needs better error handling
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
        this.showTemplateModal = true;
        console.log("Generated Templates:", this.emailTemplates);
      },
      toggleTemplateModal() {
        this.showTemplateModal = !this.showTemplateModal;
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
