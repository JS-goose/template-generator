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
      v-if="emailTemplates.length"
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
          this.generateEmailTemplate();
        }
      },
      generateEmailTemplate() {
        this.emailTemplates = this.rssDataFromFeedSelector.map((item) => ({
          title: item.title,
          desc: item.desc.replace(/\n/g, "<br>"),
          link: item.link,
          pubDate: item.pubDate,
        }));
      },
      // openNewWindowForTemplateDisplay() {
      //   const newWindow = window.open("", "_blank", "width=1280,height=720");

      //   if (newWindow) {
      //     newWindow.document.write(`
      //                   <html>
      //                   <head>
      //                     <title>Email Templates</title>
      //                     <style>
      //                       body { font-family: Arial, sans-serif; padding: 20px; }
      //                       .email-container { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; }
      //                       h3 { color: #2d2d2d; }
      //                       a { color: #007bff; text-decoration: none; }
      //                     </style>
      //                   </head>
      //                   <body>
      //                     <h2>Generated Email Templates</h2>
      //                     ${this.emailTemplates.join("")}
      //                   </body>
      //                   </html>
      //                 `);
      //     newWindow.document.close(); // Close document to finish writing
      //   } else {
      //     alert("Popup blocked! Please allow popups for this site.");
      //   }
      // },
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
