<template>
  <section id="all-feeds-wrapper">
    <div class="email-content">
      <h2>Generated Email Templates</h2>
      <div
        v-for="(email, index) in emailTemplates"
        :key="index"
        v-html="email"
      ></div>
    </div>
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
        this.displayClearBtn = false;
      },
      fetchTemplateData() {
        // * Pull data from child component
        if (this.$refs.feedSelectorRef) {
          this.rssDataFromFeedSelector = this.$refs.feedSelectorRef.getRssData();
          console.warn("Template data generated", this.rssDataFromFeedSelector);
          this.generateEmailTemplate();
        }
      },
      generateEmailTemplate() {
        this.emailTemplates = this.rssDataFromFeedSelector.map((item) => {
          return `
                        <div style="border:1px solid #ddd; padding: 10px; margin-bottom: 10px; font-family: Arial, sans-serif;">
                          <h3 style="color:#2d2d2d;">${item.title}</h3>
                          <p>${item.desc.replace(/\n/g, "<br>")}</p>
                          <p><a href="${
                            item.link
                          }" style="color:#007bff;">Read More</a></p>
                          <p><small>Published on: ${item.pubDate}</small></p>
                        </div>
                        `;
        });
        this.openNewWindowForTemplateDisplay();
      },
      openNewWindowForTemplateDisplay() {
        const newWindow = window.open("", "_blank", "width=1280,height=720");

        if (newWindow) {
          newWindow.document.write(`
                    <html>
                    <head>
                      <title>Email Templates</title>
                      <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .email-container { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; }
                        h3 { color: #2d2d2d; }
                        a { color: #007bff; text-decoration: none; }
                      </style>
                    </head>
                    <body>
                      <h2>Generated Email Templates</h2>
                      ${this.emailTemplates.join("")}
                    </body>
                    </html>
                  `);
          newWindow.document.close(); // Close document to finish writing
        } else {
          alert("Popup blocked! Please allow popups for this site.");
        }
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

  #all-rss-feeds-tag-search {
    width: 300px;
  }

  button {
    max-width: 20em;
  }

  .email-content {
    display: none;
  }
</style>
