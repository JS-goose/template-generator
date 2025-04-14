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
    <div class="instructions">
      <h2>💡 How to Use the Cloudinary Template Generator</h2>
      <p>
        This tool helps you quickly generate professional email content from
        Cloudinary's latest updates — perfect for sharing new features or
        integrations with customers.
      </p>

      <h2>🖥️ Step-by-Step Instructions</h2>
      <ol>
        <li>
          <strong>Pull the Latest Release Notes</strong><br />
          Click <code>Pull All RSS Feeds</code> to load updates for:
          <ul>
            <li><strong>PM</strong> – Programmable Media</li>
            <li><strong>DAM</strong> – Digital Asset Management</li>
            <li><strong>INT</strong> – Integrations</li>
          </ul>
        </li>
        <li>
          <strong>Browse the Updates</strong><br />
          Use the tabs (PM, DAM, INT) to view updates. Each item shows:
          <ul>
            <li>🗓 Publish Date</li>
            <li>📝 Description</li>
            <li>🔗 Link to Learn More</li>
          </ul>
        </li>
        <li>
          <strong>Select Items to Include</strong><br />
          Check the box labeled <code>Include</code> next to each update you
          want in your email.
        </li>
        <li>
          <strong>Generate the Email</strong><br />
          Click <code>Generate Template</code>. A formatted preview of your
          email will appear.
        </li>
        <li>
          <strong>Copy the Content</strong><br />
          Copy the template and paste it into Gmail, Outlook, or Zendesk.
        </li>
        <li>
          <strong>Clear or Refresh Feeds (Optional)</strong><br />
          Use <code>Clear All</code> or product-specific buttons to refresh or
          reset feed data.
        </li>
      </ol>

      <h2>✅ Pro Tips</h2>
      <div class="tip">
        🔍 Use the search bar to quickly filter updates by keyword or date
        (e.g., "video", "Feb 2025").
      </div>
      <div class="tip">
        💬 Ideal for customer check-ins, renewal outreach, or showcasing new
        product features.
      </div>
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

  .instructions {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    max-width: 800px;
    margin: auto;
    padding: 20px;
    color: #333;
    text-align: left;
  }
  .instructions > h1,
  .instructions > h2 {
    color: #2c3e50;
  }
  .instructions > .tip {
    background-color: #eef8ff;
    padding: 10px;
    border-left: 4px solid #3498db;
    margin: 1em 0;
  }
  .instructions > ol {
    padding-left: 1.2em;
  }
  li {
    margin-bottom: 0.75em;
  }
  code {
    background-color: #eaeaea;
    padding: 2px 4px;
    border-radius: 3px;
  }
</style>
