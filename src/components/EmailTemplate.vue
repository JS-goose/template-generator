<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h2>Email Template</h2>

      <!-- Close Button -->
      <button class="close-button" @click="closeModal">✖ Close</button>

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

      <!-- Finalize Button -->
      <button class="finalize-button" @click="finalizeEmail">
        Finalize Email
      </button>
    </div>
  </div>
</template>
  
  <script>
  export default {
    name: "EmailTemplate",
    props: {
      emailTemplates: Array,
      closeTemplateModal: Function,
    },
    data() {
      return {
        emailBody: "",
      };
    },
    methods: {
      finalizeEmail() {
        console.log("Finalized Email Content:", this.emailBody);
        alert("Email has been finalized!");
        this.closeTemplateModal();
      },
    },
  };
</script>
  
  <style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .modal-content {
    background: white;
    width: 600px;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
    position: relative;
  }
  .close-button {
    position: absolute;
    top: 10px;
    right: 10px;
    border: none;
    background: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--cldCoral);
  }
  textarea {
    width: 100%;
    height: 150px;
    margin-bottom: 10px;
    padding: 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  .rss-item-container {
    border: 1px solid #ddd;
    padding: 10px;
    margin-top: 10px;
    background: #fff;
  }
  .finalize-button {
    color: white;
    padding: 10px;
    border: none;
    margin-top: 10px;
    cursor: pointer;
    font-size: 1.01em;
  }
  .finalize-button:hover {
    color: var(--cldBlue);
    background: white;
  }
</style>
  