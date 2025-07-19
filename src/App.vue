<template>
  <Nav />
  <ProductSelectorLandingPage />
  <Footer />
</template>

<script>
  import { onMounted } from "vue";
  import ProductSelectorLandingPage from "./components/ProductSelectorLandingPage.vue";
  import Nav from "./components/Nav.vue";
  import Footer from "./components/Footer.vue";

  export default {
    name: "App",
    components: {
      ProductSelectorLandingPage,
      Nav,
      Footer,
    },

    setup() {
      onMounted(() => {
        console.log("components mounted");
      });
    },
  };
</script>

<style lang="css">
  body {
    margin: 0;
  }
  /* TODO Apply Cloudinary styling guide found here: https://cloudinary.com/brand  */
  @font-face {
    font-family: CldInter;
    src: url(assets/fonts/static/Inter_28pt-Regular.ttf);
  }

  body {
    width: 100%;
    height: 100%;
    font-size: 16px;
  }

  #generator {
    font-family: CldInter, Helvetica, Arial, sans-serif;
    /* * Primary CLD Colors */
    --cldBlue: #3448c5;
    --cldAegeanBlue: #101926;
    --cldCetaceanBlue: #0c163b;
    --cldMidnightBlue: #3f5fff;
    --cldSkyBlue: #0d9aff;
    --cldTurquoiseBlue: #48c4d8;
    /* * Secondary CLD Colors */
    --cldCoral: #ff5050;
    --cldYellow: #f7bc00;
    --cldSlate: #162436;
    --cldLightBlue: #b3cffb;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin: 0;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
</style>
