<template>
  <div class="modal-overlay" aria-modal="true" role="dialog">
    <div class="modal-content">
      <h2>Template</h2>
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

      <!-- * Finalize Buttons -->
      <div class="finalize-buttons-container">
        <button class="finalize-button" @click="finalizeEmail">
          Finalize Email
        </button>
        <button class="finalize-button">Copy Plain Text</button>
        <button class="finalize-button">Copy Markdown Text</button>
        <!-- * Future Release -->
        <!-- <button>Push to Vitally</button> -->
      </div>
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
                                    <div style="max-width: 600px; font-family: Arial, sans-serif;">
                                  <div style="margin-bottom: 20px; padding: 10px;">
                                    <ul>
                                      <li>
                                        <h4 style="margin: 0 0 10px 0; font-size: 16px;">
                                      <a href="${email.link}" target="_blank" rel="noopener noreferrer" style="color: #0073e6; text-decoration: none;">
                                        ${email.title}
                                      </a>
                                    </h4>
                                    <p style="margin: 0; font-size: 14px; line-height: 1.6;">${email.desc}</p>
                                        </li>
                                      </ul>
                                  </div>
                                  </div>
                                `
          )
          .join("");

        this.editorContent = `<p style="font-family: Arial, sans-serif; font-size: 14px;">Write your email content here...</p>${rssHTML}`;
        this.$refs.editor.innerHTML = this.editorContent;
      },
      copyHtmlToClipboard() {
        const htmlContent = this.editorContent;

        const blob = new Blob([htmlContent], { type: "text/html" });
        const data = [new ClipboardItem({ "text/html": blob })];

        navigator.clipboard.write(data).then(() => {
          console.log("HTML copied as rich content!");
        });
      },
      updateEditorContent() {
        this.editorContent = this.$refs.editor.innerHTML;
      },
      finalizeEmail() {
        this.updateEditorContent();

        const subject = "Cloudinary's Latest Release Notes";
        const htmlContent = this.editorContent;

        const blob = new Blob([htmlContent], { type: "text/html" });
        const data = [new ClipboardItem({ "text/html": blob })];

        navigator.clipboard.write(data).then(() => {
          const subject = encodeURIComponent("Cloudinary Release Notes");
          const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&tf=1`;
          window.open(gmailUrl, "_blank");
        });
        // *Encoding necessary for the eventual Google API implementation
        // const emailData = {
        //   from: "jonathan.sexton@cloudinary.com",
        //   to: "jonathan.sexton@cloudinary.com",
        //   subject: "Recent Cloudinary Release Notes",
        //   html: this.editorContent,
        // };

        // const encodedEmail = generateMimeEmail(emailData);
        // console.log("Encoded Email for Gmail API:", encodedEmail);
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

  .finalize-buttons-container {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
  }

  .finalize-button {
    color: white;
    padding: 10px;
    border: 1px solid white;
    margin-top: 10px;
    cursor: pointer;
    font-size: 1.01em;
  }

  .finalize-button:hover {
    color: var(--cldBlue);
    background: white;
    border: 1px solid var(--cldBlue);
    transition: all 0.25s;
  }

  a {
    cursor: pointer;
  }

  a:visited {
    color: var(--cldBlue);
  }
</style>
