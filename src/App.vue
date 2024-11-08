<template>
  <ProductSelectorLandingPage />
</template>

<script>
import { onMounted } from 'vue';
import ProductSelectorLandingPage from './components/ProductSelectorLandingPage.vue';

export default {
  name: 'App',
  components: {
    ProductSelectorLandingPage,
  },

  setup() {
    onMounted(() => {
      console.log('components mounted');
    });
  },
};
</script>

<style>
/* TODO Apply Cloudinary styling guide found here: https://cloudinary.com/brand  */
#app {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  /* * Primary CLD Colors */
  --cldBlue: #3448C5;
  --cldAegeanBlue: #101926;
  --cldCetaceanBlue: #0C163B;
  --cldMidnightBlue: #3F5FFF;
  --cldSkyBlue: #0D9AFF;
  --cldTurquoiseBlue: #48C4D8;
  /* * Secondary CLD Colors */
  --cldCoral: #FF5050;
  --cldYellow: #F7BC00;
  --cldSlate: #162436;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  width: 100%;
}

button {
  padding: 3px;
}
</style>
