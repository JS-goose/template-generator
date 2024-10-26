<template>
  <section></section>
</template>
<script>
  export default {
    data() {
      return {
        data: [],
      };
    },
    methods: {},
    computed: {
      computedExample() {},
    },
    watch: {
      message(newValue, oldValue) {
        console.log(newValue, oldValue);
      },
    },
  };
</script>
<style lang='scss' scoped>
  @import "";
</style>