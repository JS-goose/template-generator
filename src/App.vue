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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
