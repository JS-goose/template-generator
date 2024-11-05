<template>
  <ProductSelectorLandingPage msg="RSS Template Generator" />
  <!-- <FeedSelector /> -->
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
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

button {
  padding: 3px;
}
</style>
