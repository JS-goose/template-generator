<template>
  <section>
    <div class="email-content">
      <h2>Generated Email Templates</h2>
      <div
        v-for="(email, index) in emailTemplates"
        :key="index"
        v-html="email"
      ></div>
    </div>
  </section>
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
  };
</script>
<style scoped>
  @import "";
</style>