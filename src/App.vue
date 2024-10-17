<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <HelloWorld msg="Template Generator" />
</template>

<script>
import { onMounted } from 'vue';
import HelloWorld from './components/HelloWorld.vue';
import {parse} from 'rss-to-json';

export default {
  name: 'App',
  components: {
    HelloWorld,
  },

  setup() {
    onMounted(() => {
      console.log('components mounted');
      console.log(parse);

      parse('https://cloudinary.com/documentation/rss/cloudinary-pm-release-notes.xml').then(pmRSS => {
        console.log(JSON.stringify(pmRSS))
      })
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
