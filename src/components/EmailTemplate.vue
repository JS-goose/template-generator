<template>
  <section class="email-template-wrapper">
    <h2>Email Template</h2>

    <!-- Editable Email Textarea -->
    <textarea
      v-model="emailBody"
      placeholder="Write your email here..."
    ></textarea>

    <!-- RSS Items (Read-Only) -->
    <div
      v-for="(email, index) in emailTemplates"
      :key="index"
      class="rss-item-container"
    >
      <h3>{{ email.title }}</h3>
      <p v-html="email.desc"></p>
      <p><a :href="email.link" target="_blank">Read More</a></p>
      <p>
        <small>Published on: {{ email.pubDate }}</small>
      </p>
    </div>
  </section>
</template>
  
  <script>
  export default {
    name: "EmailTemplate",
    props: {
      emailTemplates: Array,
    },
    data() {
      return {
        emailBody: "",
        localTemplates: [],
      };
    },
    watch: {
      emailTemplates: {
        handler(newVal) {
          console.log("Received new emailTemplates data:", newVal);
          this.localTemplates = newVal;
        },
        deep: true, // Ensures Vue detects nested changes
        immediate: true, // Runs when component is first loaded
      },
    },
  };
</script>
  
  <style scoped>
  .email-template-wrapper {
    width: 80%;
    margin: 20px auto;
    padding: 15px;
    background: #f9f9f9;
    border-radius: 5px;
    border: 1px solid #ddd;
  }

  textarea {
    width: 100%;
    height: 150px;
    margin-bottom: 10px;
    padding: 10px;
    font-size: 14px;
    font-family: Arial, sans-serif;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .rss-item-container {
    border: 1px solid #ddd;
    padding: 10px;
    margin-top: 10px;
    background: #fff;
  }

  h3 {
    color: #333;
  }

  a {
    color: #007bff;
    text-decoration: none;
  }
</style>
  