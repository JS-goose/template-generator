<template>
  <section id="all-feeds-wrapper">
    <FeedSelector
      ref="feedSelectorRef"
      @generateTemplate="fetchTemplateData"
      @clearEmailTemplateData="onClearEmailTemplateData"
    />
    <EmailTemplate
      v-if="showTemplateModal"
      :emailTemplates="emailTemplates"
      :closeTemplateModal="toggleTemplateModal"
    />
    <div>
      <h1>Getting Started</h1>
      <ol>
        <li>
          Pull individual feeds using the action buttons on the top right or all
          feeds using the "Pull All RSS Feeds" button on the left
        </li>
        <li>
          Once feeds are pulled, you can clear individual feeds with the "Clear"
          button beside each product or use the
        </li>
      </ol>
    </div>
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
      // * Emit events to child component
      pullAllRSSFeeds() {
        // TODO this needs a check to see if the cached data exists, and if so, pull that instead of doing API calls
        this.$refs.feedSelectorRef.fetchRSSFeed("pm");
        this.$refs.feedSelectorRef.fetchRSSFeed("dam");
        this.$refs.feedSelectorRef.fetchRSSFeed("int");
      },
      // * Emit events to feedSelectorRef component
      onClearEmailTemplateData() {
        this.emailTemplates = [];
        // this.showTemplateModal = false;
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
