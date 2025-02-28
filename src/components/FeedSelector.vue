<template>
  <article id="all-feeds-display-container">
    <!-- TODO Better logic for error handling -->
    <h2 v-if="fetchError">{{ fetchError }}</h2>
    <div id="all-feeds-display-container-controls">
      <form>
        <label for="rssObjSelectionCount"># of items selected:</label>
        <input
          disabled
          type="text"
          name="rssObjSelectionCount"
          id="rssObjSelectionCount"
          :value="this.rssObjsForTemplate.length"
        />
        <p>Search value: {{ searchInputValue }}</p>
      </form>
    </div>
    <div v-for="name in products" :key="name" class="feed-data-container">
      <h1>{{ name.toUpperCase() }} Generator</h1>
      <p v-if="feedPullTime(name)">Last updated: {{ feedPullTime(name) }}</p>
      <button @click="fetchRSSFeed(name)">Fetch {{ name }} Feed</button>
      <button @click="clearRSSFeedData(name)">
        Clear {{ name }} Feed Data
      </button>
      <!-- ! PM -->
      <ul class="feed-selector-rss-list-container" v-if="name === 'pm'">
        <!-- TODO  if statement here to cover each product and then I can remove the arrayToLoop function-->
        <li
          v-for="key in filteredPmItems"
          :key="key.title"
          class="feed-selector-rss-list-item"
          :class="{
            selected: rssObjsForTemplate.some(
              (item) => item.index === key.index
            ),
          }"
        >
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
          <div>
            <p>
              <a
                :href="key.directLink"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn More
              </a>
            </p>
          </div>
        </li>
      </ul>
      <!-- ! DAM -->
      <ul class="feed-selector-rss-list-container" v-if="name === 'dam'">
        <!-- TODO  if statement here to cover each product and then I can remove the arrayToLoop function-->
        <li
          v-for="key in filteredDamItems"
          :key="key.title"
          class="feed-selector-rss-list-item"
          :class="{
            selected: rssObjsForTemplate.some(
              (item) => item.index === key.index
            ),
          }"
        >
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
          <div>
            <p>
              <a
                :href="key.directLink"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn More
              </a>
            </p>
          </div>
        </li>
      </ul>
      <!-- ! INT -->
      <ul class="feed-selector-rss-list-container" v-if="name === 'int'">
        <!-- TODO  if statement here to cover each product and then I can remove the arrayToLoop function-->
        <li
          v-for="key in filteredIntItems"
          :key="key.title"
          class="feed-selector-rss-list-item"
          :class="{
            selected: rssObjsForTemplate.some(
              (item) => item.index === key.index
            ),
          }"
        >
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
          <div>
            <p>
              <a
                :href="key.directLink"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn More
              </a>
            </p>
          </div>
        </li>
      </ul>
    </div>
  </article>
</template>
<script>
  import axios from "axios";
  import { parseString } from "xml2js";
  import keyword_extractor from "keyword-extractor";

  export default {
    props: {
      searchInputValue: String,
    },
    data() {
      return {
        products: ["pm", "dam", "int"],
        fetchError: null,
        pmGroupedItemsArray: [],
        damGroupedItemsArray: [],
        intGroupedItemsArray: [],
        pmBaseURL:
          "https://cloudinary.com/documentation/rss/cloudinary-pm-release-notes.xml",
        damBaseURL:
          "https://cloudinary.com/documentation/rss/cloudinary-dam-release-notes.xml",
        intBaseURL:
          "https://cloudinary.com/documentation/rss/cloudinary-int-release-notes.xml",
        jsonResults: null,
        timesUpdated: { pm: "", dam: "", int: "" },
        rssObjsForTemplate: [],
      };
    },
    // TODO Once these computed properties are built, I need to update the template so they reference the computed function instead of the explicit array
    computed: {
      // TODO search multiple tags, search
      filteredPmItems() {
        if (!this.searchInputValue) return this.pmGroupedItemsArray;
        const searchText = this.searchInputValue.toLowerCase();
        return this.pmGroupedItemsArray.filter(
          (item) =>
            item.tags.some((tag) => tag.includes(searchText)) ||
            item.pubDate.toLowerCase().includes(searchText)
        );
      },
      filteredDamItems() {
        if (!this.searchInputValue) return this.damGroupedItemsArray;
        const searchText = this.searchInputValue.toLowerCase();
        return this.damGroupedItemsArray.filter(
          (item) =>
            item.tags.some((tag) => tag.includes(searchText)) ||
            item.pubDate.toLowerCase().includes(searchText)
        );
      },
      filteredIntItems() {
        if (!this.searchInputValue) return this.intGroupedItemsArray;
        const searchText = this.searchInputValue.toLowerCase();
        return this.intGroupedItemsArray.filter(
          (item) =>
            item.tags.some((tag) => tag.includes(searchText)) ||
            item.pubDate.toLowerCase().includes(searchText)
        );
      },
    },
    methods: {
      // TODO When multiple tags matching exist such as SFCC B2C Commerce and Page Designer Cartridges or when Magento tag exists the default is the integration landing page - needs to be looked at
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
        // * Depending on the product type, choose the correct url
        const productString = productType.includes("pm")
          ? this.pmBaseURL
          : productType.includes("dam")
          ? this.damBaseURL
          : productType.includes("int")
          ? this.intBaseURL
          : "";

        // * Proxy due to CORS
        const proxy = "https://thingproxy.freeboard.io/fetch/";
        this.jsonResults = null;
        this.fetchError = null;
        try {
          const response = await axios.get(proxy + productString);
          console.log("request sent", proxy + productString);
          await this.convertRssToJson(response.data, productString);
          console.log("RESPONSE DATA", response);
        } catch (error) {
          this.fetchError = `Error fetching the ${productString} feed - check URL for accuracy`;
        }
      },
      convertRssToJson(xml, productString) {
        console.log("productString", productString);
        // * Set the date to let the user know when the last time data was updated
        const now = new Date().toLocaleTimeString();
        return new Promise((resolve, reject) => {
          parseString(xml, { explicitArray: true }, (error, result) => {
            if (error) {
              this.error = "Problem parsing the XML";
              reject("Problem parsing the XML");
              return;
            }
            const items = result.rss.channel[0].item;
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
              // TODO parse URLs for formatting like the following: PM - rn_pm_11_29_2024 | DAM - rn_dam_11_26_2024 | INT will require much more processing
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
              this.pmGroupedItemsArray = Object.keys(grouped).map((key) => ({
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
              }));
            } else if (productString.includes("dam")) {
              this.timesUpdated.dam = now;
              this.damGroupedItemsArray = Object.keys(grouped).map((key) => ({
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
              }));
            } else {
              this.timesUpdated.int = now;
              this.intGroupedItemsArray = Object.keys(grouped).map((key) => ({
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
              }));
            }
            resolve();
          });
        });
      },
      arrayToLoop(name) {
        if (name == "pm") return this.pmGroupedItemsArray;
        if (name == "dam") return this.damGroupedItemsArray;
        if (name == "int") return this.intGroupedItemsArray;
      },
      clearRSSFeedData(productName) {
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
</style>
