<template>
  <article id="all-feeds-display-container">
    <!-- Global Fixed Controls Toolbar -->
    <div class="feed-global-toolbar">
      <div class="toolbar-left-group">
        <button @click="pullAllRSSFeeds" class="toolbar-btn">
          {{
            this.pmGroupedItemsArray.length &&
            this.damGroupedItemsArray.length &&
            this.intGroupedItemsArray.length
              ? "Refresh"
              : "Pull All RSS Feeds"
          }}
        </button>

        <input
          type="text"
          v-model="searchInputValue"
          placeholder="Search tags, keywords, or date"
          title="E.g. today, feb 2025, mm/dd/yyyy, or tags"
        />

        <button
          @click="clearAllFeedsData"
          class="toolbar-btn danger"
          v-if="showClearAllButton"
        >
          Clear All
        </button>
        <button
          @click="$emit('generateTemplate')"
          class="generate-template-btn toolbar-btn"
          :disabled="!rssObjsForTemplate.length"
        >
          Generate Template
          <span v-if="rssObjsForTemplate.length"
            >({{ rssObjsForTemplate.length }})</span
          >
        </button>
      </div>

      <div class="product-tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="activeTab = tab"
          :class="[
            'tab-button',
            tab.toLowerCase(),
            { active: activeTab === tab },
          ]"
          :disabled="disableTab(tab)"
        >
          {{ tab.toUpperCase() }}
          <span class="tab-count">({{ tabItemCount(tab) }})</span>
        </button>
      </div>

      <div class="toolbar-right-group">
        <div class="control-group">
          <strong>PM:</strong>
          <button @click="fetchRSSFeed('pm')" class="toolbar-btn">
            {{ this.pmGroupedItemsArray.length ? "Refresh" : "Fetch" }}
          </button>
          <button
            @click="clearRSSFeedData('pm')"
            class="toolbar-btn danger"
            :disabled="!pmGroupedItemsArray.length"
          >
            Clear
          </button>
        </div>
        <div class="control-group">
          <strong>DAM:</strong>
          <button @click="fetchRSSFeed('dam')" class="toolbar-btn">
            {{ this.damGroupedItemsArray.length ? "Refresh" : "Fetch" }}
          </button>
          <button
            @click="clearRSSFeedData('dam')"
            class="toolbar-btn danger"
            :disabled="!damGroupedItemsArray.length"
          >
            Clear
          </button>
        </div>
        <div class="control-group">
          <strong>INT:</strong>
          <button @click="fetchRSSFeed('int')" class="toolbar-btn">
            {{ this.intGroupedItemsArray.length ? "Refresh" : "Fetch" }}
          </button>
          <button
            @click="clearRSSFeedData('int')"
            class="toolbar-btn danger"
            :disabled="!intGroupedItemsArray.length"
          >
            Clear
          </button>
        </div>
      </div>
    </div>

    <div
      v-for="name in filteredProductTabs"
      :key="name"
      class="feed-data-container"
    >
      <div
        :class="['product-section-header', name]"
        v-if="
          this.pmGroupedItemsArray.length ||
          this.damGroupedItemsArray.length ||
          this.intGroupedItemsArray.length
        "
      >
        <h2>{{ name.toUpperCase() }} Feed</h2>
        <p class="section-subtitle">
          Below are the most recent updates for {{ name.toUpperCase() }}.
        </p>
      </div>

      <ul class="feed-selector-rss-list-container">
        <li
          v-for="key in showAllItems[name]
            ? filteredRssItems[name]
            : filteredRssItems[name].slice(0, 10)"
          :key="key.title"
          class="feed-selector-rss-list-item"
          :class="{
            selected: rssObjsForTemplate.some(
              (item) => item.index === key.index
            ),
          }"
        >
          <div class="feed-selector-rss-list-item-header">
            <div>
              <label for="rss-list-item-include-checkbox">
                Include
                <input
                  type="checkbox"
                  name="rss-list-item-include-checkbox"
                  id="rss-list-item-include-checkbox"
                  @click="includeInTemplate(key, name)"
              /></label>
            </div>
            <div class="product-tag" :class="name">
              {{ name.toUpperCase() }}
            </div>
          </div>
          <div class="rss-list-item-title-container">
            <p>{{ key.title.toUpperCase() }}</p>
          </div>
          <div>
            <p>
              <span class="feed-item-label">Publish Date:</span>
              {{ key.pubDate }}
            </p>
          </div>
          <div>
            <p>
              <span class="feed-item-label">Description:</span> {{ key.desc }}
            </p>
          </div>
          <div class="feed-selector-rss-list-item-action-container">
            <a :href="key.directLink" target="_blank" rel="noopener noreferrer">
              Full Release Notes
            </a>
            <button @click="enrichRSSData(key)">Enrich</button>
            <!-- * This works well for what it is but is obsiously a placeholder -->
            <!-- ! Placeholder - needs removal after testing -->
            <div v-if="key.enrichedFeatures">
              <strong>Features:</strong>
              <ul>
                <li
                  v-for="feature in key.enrichedFeatures"
                  :key="feature.title"
                >
                  <p>{{ feature.title }}</p>
                  <small>{{ feature.preview }}</small>
                </li>
              </ul>
            </div>
          </div>
        </li>
      </ul>

      <div
        class="rss-toggle-container"
        v-if="filteredRssItems[name].length > 10"
      >
        <button
          class="toolbar-btn rss-toggle-button"
          @click="showAllItems[name] = !showAllItems[name]"
        >
          {{
            showAllItems[name]
              ? `Show Less ${name.toLocaleUpperCase()} Items`
              : `Load More ${name.toLocaleUpperCase()} Items`
          }}
        </button>
      </div>
    </div>
  </article>
</template>
<script>
  import axios from "axios";
  import { parseString } from "xml2js";
  import keyword_extractor from "keyword-extractor";

  export default {
    data() {
      return {
        displayClearBtn: false,
        searchInputValue: "",
        products: ["pm", "dam", "int"],
        fetchError: null,
        pmGroupedItemsArray: [],
        damGroupedItemsArray: [],
        intGroupedItemsArray: [],
        activeTab: "All",
        tabs: ["All", "PM", "DAM", "INT"],
        pmBaseURL:
          "https://cloudinary.com/documentation/rss/cloudinary-pm-release-notes.xml",
        damBaseURL:
          "https://cloudinary.com/documentation/rss/cloudinary-dam-release-notes.xml",
        intBaseURL:
          "https://cloudinary.com/documentation/rss/cloudinary-int-release-notes.xml",
        jsonResults: null,
        timesUpdated: { pm: "", dam: "", int: "" },
        rssObjsForTemplate: [],
        showAllItems: {},
      };
    },
    created() {
      this.showAllItems = this.products.reduce((acc, name) => {
        acc[name] = false;
        return acc;
      }, {});
    },
    computed: {
      filteredProductTabs() {
        if (this.activeTab === "All") {
          return this.products;
        }
        return this.products.filter(
          (product) => product.toLowerCase() === this.activeTab.toLowerCase()
        );
      },
      filteredRssItems() {
        if (!this.searchInputValue) {
          return {
            pm: this.pmGroupedItemsArray,
            dam: this.damGroupedItemsArray,
            int: this.intGroupedItemsArray,
          };
        }

        const searchText = this.searchInputValue
          .toLowerCase()
          .split(/[,\s]+/)
          .filter((text) => text.trim() !== "");

        return {
          pm: this.rssItemFilterHelper(this.pmGroupedItemsArray, searchText),
          dam: this.rssItemFilterHelper(this.damGroupedItemsArray, searchText),
          int: this.rssItemFilterHelper(this.intGroupedItemsArray, searchText),
        };
      },
      showClearAllButton() {
        return (
          this.pmGroupedItemsArray.length ||
          this.damGroupedItemsArray.length ||
          this.intGroupedItemsArray.length
        );
      },
    },
    methods: {
      async enrichRSSData(rssItem) {
        try {
          const date = new Date(rssItem.pubDate);
          // TODO Add robust error handling here to let the user know this date string is invalid
          if (isNaN(date.getTime())) {
            console.error(
              "Invalid date format for normalized date in enrichRSSData:",
              rssItem.pubDate
            );
            return [];
          }

          const utcYear = date.getUTCFullYear();
          const utcMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
          const utcDay = String(date.getUTCDate()).padStart(2, "0");
          const urlDate = `${utcMonth}_${utcDay}_${utcYear}`;
          const completeURL = `https://cloudinary.com/documentation/rn_${rssItem.product}_${urlDate}`;
          const vercelApiEndpoint = `/api/enrich-rss-data?url=${encodeURIComponent(
            completeURL
          )}`;

          console.log(
            "fetching from: ",
            vercelApiEndpoint,
            "pubDate Normalized: ",
            completeURL
          );
          const response = await fetch(vercelApiEndpoint);

          const data = await response.json();
          if (data.features && Array.isArray(data.features)) {
            rssItem.enrichedFeatures = data.features;
            console.log("Enriched features added to RSS item:", rssItem);
          } else {
            console.warn("No features returned from enrichment API");
          }

          if (!response.ok) throw new Error("FAILED IN RESPONSE");
        } catch (error) {
          console.warn("error with the fetching endpoint for enrichment", error);
        }
      },
      disableTab(tab) {
        const tabKey = tab.toLowerCase();
        if (tabKey === "pm") return this.pmGroupedItemsArray.length === 0;
        if (tabKey === "dam") return this.damGroupedItemsArray.length === 0;
        if (tabKey === "int") return this.intGroupedItemsArray.length === 0;
        // return false;
      },
      emitFeedStatus() {
        // * Emit feed status to the parent (ProductSelectorLandingPage) for conditional rendering of instructions
        const isEmpty =
          this.pmGroupedItemsArray.length === 0 &&
          this.damGroupedItemsArray.length === 0 &&
          this.intGroupedItemsArray.length === 0;

        this.$emit("feedStatusChanged", isEmpty);
      },
      tabItemCount(tab) {
        if (tab === "All") {
          return (
            this.pmGroupedItemsArray.length +
            this.damGroupedItemsArray.length +
            this.intGroupedItemsArray.length
          );
        }
        const tabKey = tab.toLowerCase();
        return this[`${tabKey}GroupedItemsArray`]?.length || 0;
      },
      async pullAllRSSFeeds() {
        await this.fetchRSSFeed("pm");
        await this.fetchRSSFeed("dam");
        await this.fetchRSSFeed("int");
        this.displayClearBtn = true;
      },
      clearAllFeedsData() {
        this.clearRSSFeedData("pm");
        this.clearRSSFeedData("dam");
        this.clearRSSFeedData("int");
        this.displayClearBtn = false;
        this.$emit("clearEmailTemplateData");
        this.rssObjsForTemplate = [];
        this.searchInputValue = "";
        this.emitFeedStatus();
      },
      rssItemFilterHelper(rssItems, searchText) {
        return rssItems.filter((rss) => {
          const rssTags = rss.tags.map((tag) => tag.toLowerCase());
          const pubDateFormatted = this.normalizeDateHelper(rss.pubDate);

          return searchText.some(
            (text) =>
              rssTags.some((tag) => tag.includes(text)) ||
              pubDateFormatted.some((date) => date.includes(text)) ||
              rss.title.toLowerCase().includes(text) ||
              rss.desc.toLowerCase().includes(text)
          );
        });
      },
      normalizeDateHelper(dateString) {
        try {
          const date = new Date(dateString);
          // TODO Add robust error handling here to let the user know this date string is invalid
          if (isNaN(date.getTime())) {
            console.error("Invalid date format:", dateString);
            return [];
          }

          const utcYear = date.getUTCFullYear();
          const utcMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
          const utcDay = String(date.getUTCDate()).padStart(2, "0");

          return [
            new Date(Date.UTC(utcYear, utcMonth - 1, utcDay))
              .toDateString()
              .toLowerCase(), // * "sat feb 01 2025"
            `${utcYear}-${utcMonth}-${utcDay}`, // * "2025-02-01" yyyy-mm-dd
            `${utcMonth}-${utcDay}-${utcYear}`, // * "02-01-2025" mm-dd-yyyy
            `${utcMonth}_${utcDay}_${utcYear}`, // * "02_01_2025" mm_dd_yyyy
            `${utcDay}-${utcMonth}-${utcYear}`, // * "01-02-2025" dd-mm-yyyy
            `${utcMonth}/${utcDay}/${utcYear}`, // * "02/01/2025" mm/dd/yyyy
            `${utcDay}/${utcMonth}/${utcYear}`, // * "01/02/2025" dd/mm/yyyy
            `${utcDay}/${utcMonth}/${utcYear}`, // * "2025/02/01" yyyy/mm/dd
          ];
        } catch (dateError) {
          // TODO Add robust error handling here to let the user know this date string is invalid
          console.error("Date conversion error:", dateError);
          return [];
        }
      },
      getDynamicReleaseNotesURL(dateString, product, tags) {
        // * Helper function to convert the published date string value and provide dynamic URLs based on the product
        const date = new Date(dateString);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const day = String(date.getUTCDate()).padStart(2, "0");
        // * Get the integration URL based on tags
        const getIntegrationURL = (tags) => {
          const tagSet = new Set(tags);
          const integrations = [
            // Wordpress
            {
              requiredTags: ["wordpress"],
              url: "https://cloudinary.com/documentation/integrations_release_notes#wordpress_plugin_img_src_https_cloudinary_res_cloudinary_com_image_upload_v1501590940_wordpress_plain_svg_title_wordpress_plugin_width_23px_style_margin_bottom_5px",
            },
            // SAP Commerce
            {
              requiredTags: ["sap", "commerce"],
              url: "https://cloudinary.com/documentation/integrations_release_notes#sap_commerce_extension_img_src_https_cloudinary_res_cloudinary_com_image_upload_v1617879432_sap_commerce_extension_plain_svg_title_sap_commerce_extension_width_30px",
            },
            // Salesforce Marketing Cloud
            {
              requiredTags: ["salesforce", "marketing"],
              url: "https://cloudinary.com/documentation/integrations_release_notes#salesforce_marketing_cloud_app_img_src_https_cloudinary_res_cloudinary_com_image_upload_v1616515093_salesforce_page_designer_cartridge_plain_svg_title_salesforce_marketing_cloud_app_width_25px",
            },
            // Salesforce Commerce B2c
            {
              requiredTags: ["salesforce", "b2c"],
              url: "https://cloudinary.com/documentation/integrations_release_notes#salesforce_commerce_cloud_b2c_commerce_cartridge_img_src_https_cloudinary_res_cloudinary_com_image_upload_v1616515093_salesforce_page_designer_cartridge_plain_svg_title_salesforce_commerce_cloud_b2c_commerce_cartridge_width_25px",
            },
            // Salesforce Page Designer
            {
              requiredTags: ["salesforce", "page", "designer"],
              url: "https://cloudinary.com/documentation/integrations_release_notes#salesforce_commerce_cloud_page_designer_cartridge_img_src_https_cloudinary_res_cloudinary_com_image_upload_w_28_q_auto_docsite_cms_sfcc_svg_title_salesforce_commerce_cloud_page_designer_width_25px",
            },
            {
              requiredTags: ["headless", "salesforce"],
              salesforceHeadlessCommerce:
                "https://cloudinary.com/documentation/integrations_release_notes#salesforce_commerce_cloud_b2c_commerce_cartridge_for_headless_img_src_https_cloudinary_res_cloudinary_com_image_upload_v1616515093_salesforce_page_designer_cartridge_plain_svg_title_salesforce_commerce_cloud_b2c_commerce_cartridge_width_25px",
            },
            // Magento
            {
              requiredTags: ["magento"],
              url: "https://cloudinary.com/documentation/integrations_release_notes#magento_adobe_commerce_extension_img_src_https_cloudinary_res_cloudinary_com_image_upload_v1501590941_magento_plain_svg_title_magento_adobe_commerce_extension_width_18px_style_margin_left_3px",
            },
            // Figma
            {
              requiredTags: ["figma"],
              url: "https://cloudinary.com/documentation/integrations_release_notes#figma_plugin_img_src_https_cloudinary_res_cloudinary_com_image_upload_v1728919342_figma_integration_plain_svg_title_figma_plugin_width_23px_style_margin_bottom_5px",
            },
          ];

          // * Loop through and return the first matching URL based on tags
          for (const { requiredTags, url } of integrations) {
            const allPresent = requiredTags.every((requiredTag) =>
              tagSet.has(requiredTag)
            );
            if (allPresent) {
              return url;
            }
          }
          // * Defaults to the most recent integrations release notes URL if no match is found above
          return "https://cloudinary.com/documentation/integrations_release_notes";
        };

        // * If the product is integrations related, return the specific integration URL based on tags
        if (product === "int") {
          return getIntegrationURL(tags);
        }

        // * Return the release notes URL for PM and DAM
        return `https://cloudinary.com/documentation/rn_${encodeURIComponent(
          product
        )}_${month}_${day}_${year}`;
      },
      async fetchRSSFeed(productType = "pm") {
        try {
          const vercelApiEndpoint = `/api/rss?feed=${productType}`;

          console.log("Fetching RSS from:", vercelApiEndpoint);

          const response = await fetch(vercelApiEndpoint);
          if (!response.ok) throw new Error("Failed to fetch RSS");

          const xmlData = await response.text();
          console.log("Received XML Data:", xmlData.substring(0, 100));

          await this.convertRssToJson(xmlData, productType);
        } catch (error) {
          console.error(`Error fetching RSS for ${productType}:`, error);
          this.fetchError = `Error fetching ${productType} feed. Please try again later.`;
        }
      },
      convertRssToJson(xml, productString) {
        console.log("productString", productString);
        // * Set the date to let the user know when the last time data was updated
        const now = new Date().toLocaleTimeString();
        return new Promise((resolve, reject) => {
          if (!xml || typeof xml !== "object") {
            if (!xml || typeof xml !== "string" || !xml.trim().startsWith("<")) {
              console.error("Invalid or empty XML string:", xml);
              this.fetchError =
                "Problem parsing/converting the XML: invalid or empty content.";
              return reject("Problem parsing the XML: invalid or empty content.");
            }
          }

          parseString(xml, { explicitArray: true }, (error, result) => {
            if (error) {
              this.fetchError = "Problem parsing the XML";
              reject("Problem parsing the XML");
              return;
            }

            const items = result?.rss?.channel[0]?.item;

            const grouped = {};
            let rssNum = 0;
            console.log("ITEMS AFTER PARSING", items);
            // * Loop over the returned data, add tags, and organize
            items.forEach((rssItem) => {
              rssItem.rssKey = rssNum++;
              const rssObj = rssItem.rssKey;
              const tags = keyword_extractor.extract(rssItem.description.join(), {
                language: "english",
                remove_digits: false,
                return_changed_case: true,
                return_chained_words: false,
                remove_duplicates: true,
              });
              // * If the data item doesn't exist in the obj, add it
              if (!grouped[rssObj]) {
                grouped[rssObj] = [];
              }
              grouped[rssObj].push({
                pubDate: rssItem?.pubDate[0],
                desc: rssItem?.description[0],
                link: rssItem?.link[0],
                title: rssItem?.title[0],
                rssKey: rssItem?.key,
                tags: tags,
              });
            });
            // * Depending on the product, organize data in a readable manner and add to the correct array
            if (productString.includes("pm")) {
              this.timesUpdated.pm = now;
              this.pmGroupedItemsArray = Object.keys(grouped)
                .map((key) => ({
                  pubDate: grouped[key][0].pubDate,
                  desc: grouped[key][0].desc,
                  link: grouped[key][0].link,
                  title: grouped[key][0].title,
                  rssKey: key,
                  product: "pm",
                  index: `pm${key}`,
                  directLink: this.getDynamicReleaseNotesURL(
                    grouped[key][0].pubDate,
                    "pm"
                  ),
                  tags: grouped[key][0].tags,
                }))
                .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
              this.emitFeedStatus();
            } else if (productString.includes("dam")) {
              this.timesUpdated.dam = now;
              this.damGroupedItemsArray = Object.keys(grouped)
                .map((key) => ({
                  pubDate: grouped[key][0].pubDate,
                  desc: grouped[key][0].desc,
                  link: grouped[key][0].link,
                  title: grouped[key][0].title,
                  rssKey: key,
                  product: "dam",
                  index: `dam${key}`,
                  directLink: this.getDynamicReleaseNotesURL(
                    grouped[key][0].pubDate,
                    "dam"
                  ),
                  tags: grouped[key][0].tags,
                }))
                .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
              this.emitFeedStatus();
            } else {
              this.timesUpdated.int = now;
              this.intGroupedItemsArray = Object.keys(grouped)
                .map((key) => ({
                  pubDate: grouped[key][0].pubDate,
                  desc: grouped[key][0].desc,
                  link: grouped[key][0].link,
                  title: grouped[key][0].title,
                  rssKey: key,
                  product: "int",
                  index: `int${key}`,
                  directLink: this.getDynamicReleaseNotesURL(
                    grouped[key][0].pubDate,
                    "int",
                    grouped[key][0].tags
                  ),
                  tags: grouped[key][0].tags,
                }))
                .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
              this.emitFeedStatus();
            }
            resolve(items);
          });
        });
      },
      arrayToLoop(name) {
        if (name == "pm") return this.pmGroupedItemsArray;
        if (name == "dam") return this.damGroupedItemsArray;
        if (name == "int") return this.intGroupedItemsArray;
      },
      clearRSSFeedData(productName) {
        this.emitFeedStatus();
        if (productName == "pm") return (this.pmGroupedItemsArray = []);
        if (productName == "dam") return (this.damGroupedItemsArray = []);
        if (productName == "int") return (this.intGroupedItemsArray = []);
      },
      includeInTemplate(rssItem, name) {
        console.warn("RSSITEM FOR TEMPLATE", rssItem, name);
        // * Check for duplicates
        const uniques = this.rssObjsForTemplate.find(
          (item) => item.index === rssItem.index
        );
        // * If RSS item isn't in array, push item to array
        if (!uniques) {
          this.rssObjsForTemplate.push(rssItem);
          console.log(this.rssObjsForTemplate);
        }
        // * If RSS item is in the array, remove it on another click
        if (uniques) {
          this.rssObjsForTemplate = this.rssObjsForTemplate.filter(
            (item) => item.index !== rssItem.index
          );
        }
        this.$emit("templateObjsUpdated", this.rssObjsForTemplate.length);
      },
      feedPullTime(name) {
        return this.timesUpdated[name];
      },
      getRssData() {
        return this.rssObjsForTemplate;
      },
    },
    watch: {
      message(newValue, oldValue) {
        console.log(newValue, oldValue);
      },
    },
  };
</script>
<style lang="css" scoped>
  .feed-global-toolbar {
    position: sticky;
    top: 0;
    z-index: 500;
    background: white;
    padding: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    transition: box-shadow 0.2s ease-in-out;
  }

  .toolbar-left-group,
  .toolbar-center-group,
  .toolbar-right-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    scroll-behavior: smooth;
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  input[type="text"] {
    padding: 6px 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    min-width: 280px;
    font-size: 0.95em;
  }

  .toolbar-btn {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    background-color: var(--cldBlue);
    color: white;
    font-weight: 600;
    cursor: pointer;
  }

  .toolbar-btn:hover {
    background-color: var(--cldSlate);
  }

  .toolbar-btn.danger {
    background-color: var(--cldCoral);
  }

  .toolbar-btn.danger:hover {
    background-color: #b02a37;
  }

  .toolbar-btn:disabled,
  .generate-template-btn.toolbar-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: var(--cldSlate);
    color: gray;
  }

  .generate-template-btn.toolbar-btn {
    background-color: var(--cldYellow);
    border: 2px solid var(--cldSlate);
    font-size: 1.01em;
  }

  .feed-content-scroll-container {
    margin-top: 20px;
  }

  .product-tabs {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .tab-button {
    padding: 8px 14px;
    font-weight: 500;
    border: none;
    border-bottom: 3px solid transparent;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.95em;
    color: white;
    background-color: var(--cldSlate);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .tab-button.all {
    background-color: var(--cldSlate);
  }

  .tab-button.all > span {
    color: white;
  }

  .tab-button.all.active > span {
    color: var(--cldSlate);
  }

  .tab-button.pm {
    background-color: var(--cldBlue);
  }

  .tab-button.dam {
    background-color: var(--cldTurquoiseBlue);
  }

  .tab-button.int {
    background-color: var(--cldCoral);
  }

  .tab-count {
    background: rgba(255, 255, 255, 0.15);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    color: white;
  }

  .tab-button.active {
    font-weight: 700;
    background-image: linear-gradient(to bottom, white 30%, #f0f0f0 100%);
    border: 1px solid rgba(0, 0, 0, 0.1);
    color: var(--cldSlate);
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.15);
    transform: scale(1.03);
    font-size: 1.01em;
    border-bottom: 3px solid var(--cldSlate);
    transition: all 0.2s ease;
  }

  .tab-button.active.pm {
    border-bottom: 3px solid var(--cldBlue);
  }

  .tab-button.active.dam {
    border-bottom: 3px solid var(--cldTurquoiseBlue);
  }

  .tab-button.active.int {
    border-bottom: 3px solid var(--cldCoral);
  }

  .tab-button:hover {
    filter: brightness(1.3);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }

  .tab-button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    pointer-events: none;
  }

  .tab-count {
    background: rgba(255, 255, 255, 0.15);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    color: white;
  }

  .product-section-header {
    padding: 1em 0;
    margin-top: 2em;
    text-align: left;
    border-bottom: 2px solid var(--cldLightBlue);
  }

  .product-section-header.pm {
    border-left: 6px solid var(--cldBlue);
    padding-left: 10px;
    background-color: rgba(52, 72, 197, 0.05); /* light cldBlue tint */
  }

  .product-section-header.dam {
    border-left: 6px solid var(--cldTurquoiseBlue);
    padding-left: 10px;
    background-color: rgba(72, 196, 216, 0.05);
  }

  .product-section-header.int {
    border-left: 6px solid var(--cldCoral);
    padding-left: 10px;
    background-color: rgba(255, 80, 80, 0.05);
  }

  .section-subtitle {
    font-size: 0.9em;
    color: var(--cldSlate);
    margin: 0.25em 0 0;
  }

  .product-tag {
    display: inline-block;
    font-size: 0.75em;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 4px;
    margin-bottom: 4px;
    color: white;
  }

  .product-tag.pm {
    background-color: var(--cldBlue);
  }
  .product-tag.dam {
    background-color: var(--cldTurquoiseBlue);
  }
  .product-tag.int {
    background-color: var(--cldCoral);
  }

  #all-feeds-display-container {
    width: 100%;
    overflow: visible;
  }
  .tab-count {
    font-weight: normal;
    font-size: 0.85em;
    margin-left: 4px;
    color: var(--cldSlate);
  }

  #all-feeds-display-container {
    width: 100%;
  }
  #all-feeds-display-container-controls {
    display: flex;
    justify-content: center;
    flex-direction: row;
    align-items: baseline;
    width: 100%;
  }

  #all-feeds-display-container-controls > form {
    display: flex;
    display: flex;
    justify-content: center;
    flex-direction: row;
    align-items: baseline;
    width: 100%;
  }

  #all-feeds-display-container-controls > form > input {
    margin-right: 1.25em;
    width: 3.5em;
  }

  .feed-selector-rss-list-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
    gap: 1rem;
  }

  .feed-selector-rss-list-item {
    box-sizing: border-box;
    height: 100%;
    min-height: 300px;
    overflow: auto;
    text-align: left;
    margin: 0.75em;
    padding: 0.35em 0.35em 0.35em 1em;
    border-radius: 5px;
    -webkit-box-shadow: 10px 10px 10px 10px rgba(59, 58, 58, 5%);
    -moz-box-shadow: 10px 10px 10px 10px rgba(59, 58, 58, 5%);
    box-shadow: 10px 10px 10px 10px rgba(59, 58, 58, 5%);
  }

  .feed-selector-rss-list-item-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 1em 1em 1em 0;
  }

  .feed-selector-rss-list-item-action-container {
    display: flex;
    justify-content: space-between;
  }

  .selected {
    background-color: var(--cldLightBlue);
    border: 1px solid var(--cldSlate);
  }

  a {
    color: var(--cldSkyBlue);
    text-decoration: none;
  }

  a:hover {
    color: var(--cldSlate);
  }

  .rss-list-item-title-container > p {
    text-align: center;
  }

  .feed-data-container {
    height: 100%;
    width: 100%;
  }

  .feed-data-container > button {
    margin-right: 1em;
  }

  .feed-item-label {
    font-weight: 600;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  #rss-list-item-include-checkbox {
    width: 1.25em;
    height: 1.25em;
  }

  #rss-list-item-include-checkbox:hover {
    cursor: pointer;
  }
  .rss-toggle-container {
    display: flex;
    justify-content: flex-end;
    padding: 1em 1em 2em;
  }

  .rss-toggle-button {
    font-size: 0.95em;
    font-weight: 600;
    background-color: var(--cldSlate);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    text-align: center;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .rss-toggle-button:hover {
    background-color: var(--cldBlue);
  }
</style>
