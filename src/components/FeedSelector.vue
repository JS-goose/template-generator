<template>
  <article>
    <!-- TODO Better logic for error handling -->
    <p v-if="fetchError">{{ fetchError }}</p>
    <p>Tag search value: {{ tagSearchInputValue }}</p>
    <div v-for="name in products" :key="name" class="feed-data-container">
      <h1>{{ name }} Generator</h1>
      <p v-if="feedPullTime(name)">Last updated: {{ feedPullTime(name) }}</p>
      <button @click="fetchRSSFeed(name)">Fetch {{ name }} Feed</button>
      <button @click="clearRSSFeedData(name)">
        Clear {{ name }} Feed Data
      </button>
      <ul>
        <li
          v-for="key in arrayToLoop(name)"
          :key="key.title"
          class="feed-selector-rss-list-item"
        >
          <div>
            <label for="rss-list-item-include-checkbox">
              Include
              <input
                type="checkbox"
                name="rss-list-item-include-checkbox"
                id="rss-list-item-include-checkbox"
                @click="includeInTemplate(key)"
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
              <span class="feed-item-label">Link:</span>
              <a :href="key.link" target="_blank" rel="noopener noreferrer">
                {{ key.link }}
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
      };
    },
    methods: {
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
          this.$emit("displayGenEmailBtn", true);
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
              this.pmGroupedItemsArray = Object.keys(grouped).map((key) => ({
                pubDate: grouped[key][0].pubDate,
                desc: grouped[key][0].desc,
                link: grouped[key][0].link,
                title: grouped[key][0].title,
                rssKey: key,
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
      includeInTemplate(rssItem) {
        // TODO Logic to include this/these items in the template to download
        console.log(rssItem);
      },
      feedPullTime(name) {
        return this.timesUpdated[name];
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
  .feed-selector-rss-list-item {
    max-width: 45%;
    height: 200px;
    display: inline-block;
    text-align: left;
    display: inline-block;
    margin: 0.75em;
    padding: 0.35em;
    border: 1px solid gray;
    border-radius: 3px;
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
</style>
