<template>
  <div class="modal-overlay" aria-modal="true" role="dialog">
    <div class="modal-content">
      <h2>Template</h2>
      <div class="instructions-block">
        <p><strong>How to use:</strong></p>
        <ul>
          <li>Edit any part of the template directly in the area below.</li>
          <li>
            <kbd>Cmd</kbd> (or <kbd>Ctrl</kbd>) + Click a link to open it in a
            new tab.
          </li>
          <li>Double-click a link to edit its text or URL inline.</li>
        </ul>
      </div>
      <!-- Close Button -->
      <button class="close-button" @click="closeModal">✖ Close</button>

      <!-- Editable Content Area -->
      <div
        ref="editor"
        class="editable-area"
        contenteditable="true"
        @input="updateEditorContent"
      ></div>
      <div class="final-instructions">
        <p>
          When you're ready, click <strong>“Finalize Email”</strong> below. This
          will copy the formatted content to your clipboard and open a new Gmail
          draft so you can paste and send it quickly.
        </p>
      </div>

      <!-- * Finalize Buttons -->
      <div class="finalize-buttons-container">
        <button class="finalize-button" @click="finalizeEmail">
          Finalize Email
        </button>
        <button disabled class="finalize-button" title="Coming soon..">
          Copy Plain Text
        </button>
        <button disabled class="finalize-button" title="Coming soon..">
          Copy Markdown Text
        </button>
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
            <h4 style="margin: 0 0 10px 0; font-size: 15px;">
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
        // * Only open links in window if user holds Ctrl or Cmd
        if ((event.metaKey || event.ctrlKey) && target.tagName === "A") {
          window.open(target.href, "_blank", "noopener,noreferrer");
        }

        // * Allow users to edit link by double-click
        if (event.detail === 2 && target.tagName === "A") {
          event.preventDefault();

          const href = target.getAttribute("href");
          const text = target.innerText;

          const wrapper = document.createElement("span");
          wrapper.innerHTML = `
                    Text: <input type="text" value="${text}" class="edit-link-text" />
                    URL: <input type="text" value="${href}" class="edit-link-href" />
                    <button class="save-link">Save</button>
              `;

          target.replaceWith(wrapper);

          wrapper.querySelector(".save-link").addEventListener("click", () => {
            const newText = wrapper.querySelector(".edit-link-text").value;
            const newHref = wrapper.querySelector(".edit-link-href").value;

            const newAnchor = document.createElement("a");
            newAnchor.href = newHref;
            newAnchor.innerText = newText;
            newAnchor.target = "_blank";
            newAnchor.rel = "noopener noreferrer";

            wrapper.replaceWith(newAnchor);
          });
        }
      },
    },
  };
</script>

<style lang="css">
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

  /* .template-psa {
                                                  display: flex;
                                                  flex-direction: row;
                                                  justify-content: center;
                                                  width: 100%;
                                                  margin-top: 1em;
                                                }

                                                .template-psa small {
                                                  width: 60%;
                                                } */

  .instructions-block {
    background-color: #f9f9f9;
    border-left: 4px solid var(--cldSlate);
    border-right: 4px solid var(--cldSlate);
    padding: 12px 16px;
    margin: 16px 0;
    text-align: left;
    font-size: 0.9em;
    border-radius: 6px;
    max-width: 693px;
    width: 100%;
  }

  .instructions-block ul {
    padding-left: 1.2em;
    margin: 0;
  }

  .instructions-block ul li {
    padding-bottom: 0.5em;
  }

  .instructions-block kbd {
    background-color: #eee;
    border-radius: 3px;
    border: 1px solid #ccc;
    font-size: 0.85em;
    padding: 2px 6px;
  }

  .final-instructions {
    font-size: 0.9em;
    color: #555;
    margin-top: 16px;
    background: #fffbe6;
    padding: 12px 16px;
    border-left: 4px solid var(--cldYellow);
    border-right: 4px solid var(--cldYellow);
    border-radius: 6px;
    text-align: left;
    max-width: 693px;
    width: 100%;
  }
  .rss-item-container {
    background: #fff;
    margin-top: 10px;
  }

  .finalize-buttons-container {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    padding: 1em 0;
    margin-top: 1em;
    align-items: center;
  }

  .finalize-button {
    color: white;
    padding: 10px;
    border: 1px solid white;
    border-radius: 4px;
    margin-top: 10px;
    cursor: pointer;
    font-size: 1.01em;
    background-color: var(--cldBlue);
  }

  .finalize-button:hover {
    color: var(--cldBlue);
    background: white;
    border: 1px solid var(--cldBlue);
    transition: all 0.25s;
  }

  .finalize-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: var(--cldSlate);
    color: gray;
  }

  a {
    cursor: pointer;
    color: var(--cldBlue);
  }

  a:visited {
    color: var(--cldBlue);
  }

  .edit-link-text,
  .edit-link-href {
    margin: 4px;
    padding: 4px;
    font-size: 0.85em;
    width: 100%;
  }

  .save-link {
    margin-left: 6px;
    background-color: var(--cldBlue);
    color: white;
    border: none;
    padding: 4px 8px;
    font-size: 0.85em;
    border-radius: 4px;
    cursor: pointer;
  }

  .save-link:hover {
    background-color: var(--cldSlate);
  }
</style>
