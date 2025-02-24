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
        <p>Tag search value: {{ tagSearchInputValue }}</p>
      </form>
    </div>
    <div v-for="name in products" :key="name" class="feed-data-container">
      <h1>{{ name.toUpperCase() }} Generator</h1>
      <p v-if="feedPullTime(name)">Last updated: {{ feedPullTime(name) }}</p>
      <button @click="fetchRSSFeed(name)">Fetch {{ name }} Feed</button>
      <button @click="clearRSSFeedData(name)">
        Clear {{ name }} Feed Data
      </button>
      <ul class="feed-selector-rss-list-container">
        <!-- TODO Adjust the selected class as it's adding the effects to items from other feeds that have not been selected -->
        <li
          v-for="key in arrayToLoop(name)"
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
      tagSearchInputValue: String,
      required: false,
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
    computed: {},
    methods: {
      // TODO This is only working on the PM array and needs to be adjusted to all products
      convertDateString(dateString, product) {
        const date = new Date(dateString);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const day = String(date.getUTCDate()).padStart(2, "0");
        const productURLModifier = product;
        console.warn(
          `DATESTRING${dateString} MONTH${month} DAY${day} YEAR${year}`
        );
        return `https://cloudinary.com/documentation/rn_${productURLModifier}_${month}_${day}_${year}`;
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
          this.error = `Error fetching the ${productString} feed - check URL for accuracy`;
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
                // * Maybe these can be adjusted or processed to include classes in the URLs such as #enhancements and #new_features
                directLink: this.convertDateString(grouped[key][0].pubDate, "pm"),
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
                directLink: this.convertDateString(
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
                directLink: "NEEDS INT DIRECT LINK",
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
    computed: {},
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
