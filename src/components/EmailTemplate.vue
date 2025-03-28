<template>
  <div class="modal-overlay" aria-modal="true" role="dialog">
    <div class="modal-content">
      <h2>Email Template</h2>
      <p>
        <small
          >The entire section is editable, including text, links, etc. from RSS
          items</small
        >
      </p>
      <!-- Close Button -->
      <button class="close-button" @click="closeModal">✖ Close</button>

      <!-- Editable Content Area -->
      <div
        ref="editor"
        class="editable-area"
        contenteditable="true"
        @input="updateEditorContent"
      ></div>

      <!-- Finalize Button -->
      <button class="finalize-button" @click="finalizeEmail">
        Finalize Email
      </button>
    </div>
  </div>
</template>

<script>
  import { generateMimeEmail } from "@/utils/encodeEmail";

  export default {
    name: "EmailTemplate",
    props: {
      emailTemplates: Array,
      closeTemplateModal: Function,
    },
    data() {
      return {
        editorContent: "",
      };
    },
    mounted() {
      this.initializeEditorContent();
      document.body.style.overflow = "hidden";
      // * Delegate click behavior for links inside editable area
      this.$refs.editor.addEventListener("click", this.handleLinkClick);
    },
    beforeDestroy() {
      document.body.style.overflow = "";
      this.$refs.editor.removeEventListener("click", this.handleLinkClick);
    },
    methods: {
      initializeEditorContent() {
        const rssHTML = this.emailTemplates
          .map(
            (email) => `
                <div class="rss-item-container">
                  <h4>
                    <a href="${email.link}" target="_blank" rel="noopener noreferrer">
                      ${email.title}
                    </a>
                  </h4>
                  <p>${email.desc}</p>
                </div>
              `
          )
          .join("");

        this.editorContent = `<p>Write your email content here...</p>${rssHTML}`;
        this.$refs.editor.innerHTML = this.editorContent;
      },
      updateEditorContent() {
        this.editorContent = this.$refs.editor.innerHTML;
      },
      finalizeEmail() {
        this.updateEditorContent();

        const emailData = {
          from: "example@email.com",
          to: "customer@email.com",
          subject: "Recent Cloudinary Release Notes",
          html: this.editorContent,
        };

        const encodedEmail = generateMimeEmail(emailData);
        console.log("Encoded Email for Gmail API:", encodedEmail);
        this.closeTemplateModal();
      },
      closeModal() {
        this.editorContent = "";
        document.body.style.overflow = "";
        this.closeTemplateModal();
      },
      handleLinkClick(event) {
        const target = event.target;
        // if (target.tagName === "A") {
        //   event.preventDefault();
        //   window.open(target.href, "_blank", "noopener,noreferrer");
        // }
        // * Only open links in window if user holds Ctrl or Cmd
        if ((event.metaKey || event.ctrlKey) && target.tagName === "A") {
          window.open(target.href, "_blank", "noopener,noreferrer");
        }
      },
    },
  };
</script>

<style lang="css" scoped>
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
    z-index: 9999;
  }

  .modal-content {
    background: white;
    max-width: 750px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
    position: relative;
    font-size: 14px;
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

  .editable-area {
    width: 100%;
    max-width: 675px;
    min-height: 300px;
    padding: 2em;
    border: 1px solid #e3e3e3;
    border-radius: 5px;
    text-align: left;
    overflow: auto;
  }

  .rss-item-container {
    background: #fff;
    margin-top: 10px;
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

  a {
    cursor: pointer;
  }

  a:visited {
    color: var(--cldBlue);
  }
</style>
