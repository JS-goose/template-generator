<template>
  <div class="modal-overlay" aria-modal="true" role="dialog">
    <div class="modal-content">
      <h2>Email Template Editor</h2>
      <!-- * Close Button -->
      <button class="close-button" @click="closeModal">✖ Close</button>

      <!-- * Unified Configuration Section -->
      <div class="unified-config-section">
        <h3>Email Configuration & Prompt</h3>
        <div class="config-description">
          <p>
            Enter all your email configuration details and prompt in one place:
          </p>
        </div>

        <textarea
          v-model="unifiedPrompt"
          placeholder="Enter customer name, email context, and any specific instructions here...

Example:
Customer Name: John Smith
Email Context: This is for a customer who requested information about new video features
Additional Instructions: Focus on business value and practical benefits"
          class="unified-prompt-area"
          rows="8"
        ></textarea>
      </div>

      <!-- * Editor Controls -->
      <div class="editor-controls">
        <div class="control-row">
          <label class="include-rss-toggle">
            <input type="checkbox" v-model="includeRssInGpt" />
            <span>Show RSS items in editor</span>
          </label>

          <label class="editor-mode-toggle">
            <input
              type="checkbox"
              v-model="richTextMode"
              @change="toggleEditorMode"
            />
            <span>Rich Text Editor</span>
          </label>
        </div>
        <div class="control-description" v-if="!includeRssInGpt">
          <small
            >💡 RSS items are hidden from the editor but will still be included
            in the GPT prompt for reference.</small
          >
        </div>
      </div>

      <!-- Rich Text Editor (when enabled) -->
      <div v-if="richTextMode" class="rich-text-editor">
        <div class="rich-text-toolbar">
          <button @click="formatText('bold')" title="Bold">
            <strong>B</strong>
          </button>
          <button @click="formatText('italic')" title="Italic">
            <em>I</em>
          </button>
          <button @click="formatText('underline')" title="Underline">
            <u>U</u>
          </button>
          <button
            @click="formatText('insertUnorderedList')"
            title="Bullet List"
          >
            •
          </button>
          <button
            @click="formatText('insertOrderedList')"
            title="Numbered List"
          >
            1.
          </button>
          <button @click="formatText('createLink')" title="Insert Link">
            🔗
          </button>
        </div>
        <div
          ref="richEditor"
          class="rich-editor-area"
          contenteditable="true"
          @input="updateRichEditorContent"
        ></div>
      </div>

      <!-- Simple Editable Area (when rich text is disabled) -->
      <div
        v-else
        ref="editor"
        class="editable-area"
        contenteditable="true"
        @input="updateEditorContent"
      ></div>

      <!-- RSS Content Toggle -->
      <div v-if="!includeRssInGpt" class="rss-toggle-notice">
        <div class="rss-notice-content">
          <span class="rss-notice-icon">📋</span>
          <span
            >RSS items are hidden but will be included in GPT prompts for
            reference.</span
          >
          <button @click="includeRssInGpt = true" class="show-rss-button">
            Show RSS Items
          </button>
        </div>
      </div>

      <!-- * Streamlined Instructions -->
      <div class="streamlined-instructions">
        <div class="instruction-item">
          <span class="instruction-icon">✏️</span>
          <span>Edit content directly in the area above</span>
        </div>
        <div class="instruction-item">
          <span class="instruction-icon">🔗</span>
          <span
            ><kbd>Cmd</kbd>/<kbd>Ctrl</kbd> + Click links to open in new
            tab</span
          >
        </div>
        <div class="instruction-item">
          <span class="instruction-icon">✂️</span>
          <span>Double-click links to edit text and URL</span>
        </div>
        <div class="instruction-item">
          <span class="instruction-icon">⚙️</span>
          <span>Toggle Rich Text Editor for advanced formatting</span>
        </div>
      </div>

      <!-- * Finalize Buttons -->
      <div class="finalize-buttons-container">
        <button class="finalize-button primary" @click="finalizeEmail">
          Finalize Email
        </button>

        <button
          class="finalize-button secondary"
          @click="generateEmailWithGPT"
          :disabled="isGeneratingWithPrompt"
        >
          <span v-if="isGeneratingWithPrompt">
            <span class="spinner"></span> Generating... {{ pollingProgress }}
          </span>
          <span v-else>Generate with ChatGPT</span>
        </button>
      </div>

      <!-- * Final Instructions -->
      <div class="final-instructions">
        <p>
          <strong>Ready to send?</strong> Click "Finalize Email" to copy the
          content to your clipboard and open a new Gmail draft.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
  import { generateMimeEmail } from "@/utils/encodeEmail";
  import { nextTick } from "vue";

  export default {
    name: "EmailTemplate",
    props: {
      emailTemplates: Array,
      closeTemplateModal: Function,
      cloudflareWorkerUrl: {
        type: String,
        default: null,
      },
    },
    data() {
      return {
        editorContent: "",
        customerName: "",
        emailContext:
          "This email is for a customer. Focus on business value and practical benefits.",
        richTextMode: false,
        includeRssInGpt: true,
        unifiedPrompt: `Customer Name: 
                    Email Context: This email is for a customer. Focus on business value and practical benefits.
                    Additional Instructions: `,
        isGeneratingWithPrompt: false,
        pollingProgress: "",
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
    watch: {
      emailTemplates: {
        handler() {
          nextTick(() => this.initializeEditorContent());
        },
        deep: true,
        immediate: true,
      },
      includeRssInGpt: {
        handler() {
          nextTick(() => this.applyRssVisibility());
        },
      },
    },
    methods: {
      initializeEditorContent() {
        if (!this.$refs.editor) {
          console.warn("Editor ref not ready yet");
          return;
        }

        const rssHTML = this.emailTemplates
          .map((email) => {
            const enrichedHTML = email.enrichedFeatures
              ? `<ul style="padding-left: 1.5em;">
                                      ${email.enrichedFeatures
                                        .map(
                                          (feature) => `
                                          <li style="margin-bottom: 8px;">
                                            <a href="${feature.url}" target="_blank" rel="noopener noreferrer" style="color: #0073e6; font-weight: bold; text-decoration: none;">${feature.title}</a>
                                            <p style="margin: 4px 0 0 0; font-size: 13px; line-height: 1.4;">${feature.preview}</p>
                                          </li>
                                        `
                                        )
                                        .join("")}
                                      </ul>`
              : "";

            return `
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
                                              ${enrichedHTML}
                                            </li>
                                          </ul>
                                        </div>
                                      </div>
                                      `;
          })
          .join("");

        this.editorContent = `<p style="font-family: Arial, sans-serif; font-size: 14px;">Write your email content here...</p>${rssHTML}`;

        // Apply the RSS visibility toggle
        this.applyRssVisibility();
      },
      applyRssVisibility() {
        if (!this.$refs.editor) return;

        if (this.includeRssInGpt) {
          // Show RSS items - restore full content
          this.$refs.editor.innerHTML = this.editorContent;
        } else {
          // Hide RSS items - show only email content
          const emailContentMatch = this.editorContent.match(
            /<p style="font-family: Arial, sans-serif; font-size: 14px;">Write your email content here\.\.\.<\/p>/
          );
          if (emailContentMatch) {
            const parts = this.editorContent.split(
              '<p style="font-family: Arial, sans-serif; font-size: 14px;">Write your email content here...</p>'
            );
            if (parts.length > 1) {
              const rssStart = parts[1].indexOf(
                '<div style="max-width: 600px; font-family: Arial, sans-serif;">'
              );
              if (rssStart !== -1) {
                const visibleContent = parts[1].substring(0, rssStart);
                this.$refs.editor.innerHTML = `<p style="font-family: Arial, sans-serif; font-size: 14px;">Write your email content here...</p>${visibleContent}`;
              } else {
                this.$refs.editor.innerHTML = this.editorContent;
              }
            }
          }
        }
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

        const htmlContent = this.editorContent;

        const blob = new Blob([htmlContent], { type: "text/html" });
        const data = [new ClipboardItem({ "text/html": blob })];

        navigator.clipboard.write(data).then(() => {
          const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&tf=1`;
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
                                      <button class="save-link">Save</button>`;

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
      async generateEmailWithGPT() {
        this.isGeneratingWithPrompt = true;
        this.pollingProgress = "";
        try {
          const isLocal = window.location.hostname === "localhost";
          const kickoffEndpoint = isLocal
            ? "http://localhost:8787"
            : "/api/gpt-email";
          const workerPollBase = isLocal
            ? "http://localhost:8787"
            : this.cloudflareWorkerUrl || process.env.VUE_APP_WORKER_URL || "";

          console.log("Making request to:", kickoffEndpoint);
          // Dynamically enhance the prompt with customer name and context
          let enhancedPrompt = this.unifiedPrompt;

          // Extract customer name, context, and instructions
          const customerNameMatch = enhancedPrompt.match(
            /Customer Name: (.+?)\n/
          );
          const emailContextMatch = enhancedPrompt.match(
            /Email Context: (.+?)\n/
          );
          const instructionsMatch = enhancedPrompt.match(
            /Additional Instructions: (.+?)\n/
          );

          this.customerName = customerNameMatch
            ? customerNameMatch[1].trim()
            : "";
          this.emailContext = emailContextMatch
            ? emailContextMatch[1].trim()
            : "This email is for a customer. Focus on business value and practical benefits.";
          const additionalInstructions = instructionsMatch
            ? instructionsMatch[1].trim()
            : "";

          // Combine all parts into the final prompt
          enhancedPrompt = `Generate a compelling customer email based on the provided Cloudinary release notes.

                **Context:** ${this.emailContext}
                ${
                  additionalInstructions
                    ? `\n**Additional Instructions:** ${additionalInstructions}`
                    : ""
                }

                **Requirements:**
                - Maximum 8 feature highlights (prioritize impact)
                - Links formatted as: [Specific Benefit Description](complete-url)
                - Professional but approachable tone
                - Use quantifiable benefits where available
                - If customer name is provided, use it; otherwise use [Customer's Name]
                - Do NOT include a subject line - the user will add their own
                - Do NOT include [Your Name] or [Your Position] placeholders - the user will add their signature in Gmail
                - Use proper bullet points (•) for lists, not dashes (-)
                - Focus on the content provided, do not reference RSS feed items unless specifically included

                **Structure:**
                1. Personal greeting (use customer name if provided)
                2. Brief introduction about the update
                3. 6-8 bulleted features with business impact
                4. Appropriate call-to-action
                5. Professional close

                Generate the email:`;

          if (this.customerName.trim()) {
            // Extract first name only
            const firstName = this.customerName.split(" ")[0];
            enhancedPrompt = `${enhancedPrompt}\n\n**IMPORTANT:** The customer's first name is "${firstName}". Use this first name in the greeting instead of [Customer's Name].`;
          }

          // Always send the full content (including RSS items) to GPT for reference
          // The toggle only controls visibility in the editor, not what's sent to GPT
          let contentToSend = this.editorContent;

          // If no content was found, send a minimal placeholder
          if (!contentToSend || contentToSend.trim() === "") {
            contentToSend = "<p>Write your email content here...</p>";
          }

          const kickoff = await fetch(kickoffEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: contentToSend,
              prompt: enhancedPrompt,
            }),
          });
          console.log("Kickoff response status:", kickoff.status);

          const kickoffData = await kickoff.json();
          const requestId = kickoffData.id;
          const token = kickoffData.token;

          if (!requestId || !token) {
            throw new Error("Failed to start GPT generation.");
          }

          if (!workerPollBase) {
            throw new Error("Worker polling base URL not configured.");
          }

          const pollInterval = 5000; // Increased from 3000 to 5000ms
          const maxAttempts = 20; // Increased from 10 to 20 (60 seconds total)
          let attempt = 0;
          let result;

          // Add initial delay to give GPT request time to complete
          await new Promise((res) => setTimeout(res, 2000));

          while (attempt < maxAttempts) {
            console.log(
              `Polling attempt ${
                attempt + 1
              }: ${workerPollBase}?id=${encodeURIComponent(requestId)}`
            );
            const poll = await fetch(
              `${workerPollBase}?id=${encodeURIComponent(requestId)}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            console.log(`Poll response status: ${poll.status}`);
            if (poll.status === 200) {
              result = await poll.json();
              console.log("GPT response received:", result);
              break;
            }
            if (poll.status === 410) {
              throw new Error("Result expired. Please retry generation.");
            }
            if (poll.status === 401) {
              throw new Error("Unauthorized polling. Please retry generation.");
            }
            if (poll.status === 202) {
              // Still processing, continue polling
              console.log(
                `GPT still processing... attempt ${attempt + 1}/${maxAttempts}`
              );
              this.pollingProgress = `(${attempt + 1}/${maxAttempts})`;
            }
            await new Promise((res) => setTimeout(res, pollInterval));
            attempt++;
          }

          if (attempt >= maxAttempts) {
            throw new Error(
              "GPT request timed out after 60 seconds. Please try again with a shorter prompt or content."
            );
          }

          console.log("Final result:", result);

          if (!result) {
            throw new Error("No result received from GPT.");
          }

          if (result.error) {
            throw new Error(`GPT Error: ${result.error}`);
          }

          if (!result.data?.choices?.length) {
            console.error("Unexpected result structure:", result);
            throw new Error(
              "GPT response structure is invalid. Please try again."
            );
          }

          const text = result.data.choices[0]?.message?.content || "";

          // Enhanced link processing for Gmail compatibility
          const processedText = this.processLinksForGmail(text);
          let safe = String(processedText)
            .replace(/\n/g, "<br>")
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Convert **bold** to <strong>
            .replace(/\*(.*?)\*/g, "<em>$1</em>") // Convert *italic* to <em>
            .replace(/^\d+\.\s+\*\*(.*?)\*\*:/gm, "<strong>$1:</strong>") // Format numbered list headers
            .replace(/^\d+\.\s+(.*?)$/gm, "<li>$1</li>") // Convert numbered lists to HTML
            .replace(/(<li>.*?<\/li>)/gs, "<ol>$1</ol>"); // Wrap lists in <ol> tags

          // Clean up any remaining malformed HTML attributes
          safe = safe.replace(
            /target="_blank"\s*rel="noopener noreferrer"\s*style="[^"]*">/g,
            ">"
          );
          safe = safe.replace(/\s*style="[^"]*"\s*/g, " ");
          safe = safe.replace(/\s*rel="[^"]*"\s*/g, " ");

          // Fix the specific formatting issues from GPT response
          // Replace "- target="_blank"" with proper bullet points
          safe = safe.replace(/-\s*target="_blank"\s*<br>/g, "<li>");
          safe = safe.replace(/<br>\s*>/g, "</li><br>");

          // Convert ">text" to proper list items
          safe = safe.replace(/<br>\s*>\s*([^<]+)/g, "<li>$1</li>");

          // Fix bullet points that start with "- "
          safe = safe.replace(/<br>\s*-\s*([^<]+)/g, "<li>$1</li>");

          // Remove name and position placeholders
          safe = safe.replace(/\[Your Name\]/g, "");
          safe = safe.replace(/\[Your Position\]/g, "");
          safe = safe.replace(/\[Your Name\]<br>/g, "");
          safe = safe.replace(/\[Your Position\]<br>/g, "");

          // Wrap consecutive list items in ul tags
          safe = safe.replace(
            /(<li>.*?<\/li>)(<br><li>.*?<\/li>)*/gs,
            (match) => {
              if (match.includes("<ol>") || match.includes("</ol>")) {
                return match; // Already wrapped in ol
              }
              return `<ul>${match}</ul>`;
            }
          );

          const gptOutput = `<div style="margin-top:1em; padding-top:1em; font-family: Arial, sans-serif;">
                                         <h4 style="color: #333; margin-bottom: 10px;">GPT Generated Email:</h4>
                                         <div style="line-height: 1.6; color: #333;">${safe}</div>
                                       </div>`;

          this.editorContent += gptOutput;
          this.$refs.editor.innerHTML = this.editorContent;
        } catch (error) {
          console.error("GPT polling error:", error);
          alert(
            error?.message || "An error occurred while generating the email."
          );
        } finally {
          this.isGeneratingWithPrompt = false;
          this.pollingProgress = "";
        }
      },
      processLinksForGmail(text) {
        // First, clean up any malformed HTML that might be in the GPT response
        let cleanedText = text.replace(
          /target="_blank"\s*rel="noopener noreferrer"\s*style="[^"]*">/g,
          ">"
        );

        // Convert markdown-style links to HTML with Gmail-friendly attributes
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

        let result = cleanedText.replace(linkRegex, (match, linkText, url) => {
          // Ensure URL starts with https:// for security
          const cleanUrl = url.startsWith("http") ? url : `https://${url}`;

          return `<a href="${cleanUrl}" 
                                           target="_blank" 
                                           rel="noopener noreferrer" 
                                           style="color: #0073e6; text-decoration: none; font-weight: bold;">${linkText}</a>`;
        });

        // Additional cleanup for any remaining malformed HTML
        result = result.replace(
          /target="_blank"\s*rel="noopener noreferrer"\s*style="[^"]*">/g,
          ">"
        );
        result = result.replace(/\s*style="[^"]*"\s*/g, " ");
        result = result.replace(/\s*rel="[^"]*"\s*/g, " ");

        // Clean up any remaining HTML attributes that might be showing as text
        result = result.replace(/target="_blank"/g, "");
        result = result.replace(/rel="noopener noreferrer"/g, "");
        result = result.replace(/style="[^"]*"/g, "");

        return result;
      },

      // Rich Text Editor Methods
      toggleEditorMode() {
        if (this.richTextMode) {
          // Switching to rich text mode
          this.$nextTick(() => {
            if (this.$refs.richEditor) {
              this.$refs.richEditor.innerHTML = this.editorContent;
            }
          });
        } else {
          // Switching to simple mode
          this.$nextTick(() => {
            if (this.$refs.editor) {
              this.$refs.editor.innerHTML = this.editorContent;
            }
          });
        }
      },

      formatText(command) {
        if (this.richTextMode && this.$refs.richEditor) {
          if (command === "createLink") {
            const url = prompt("Enter URL:");
            if (url) {
              document.execCommand(command, false, url);
            }
          } else {
            document.execCommand(command, false, null);
          }
          this.$refs.richEditor.focus();
        }
      },

      updateRichEditorContent() {
        if (this.$refs.richEditor) {
          this.editorContent = this.$refs.richEditor.innerHTML;
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
    padding: 20px;
    box-sizing: border-box;
  }

  .modal-content {
    background: white;
    width: min(95vw, 1200px);
    height: min(95vh, 800px);
    min-width: 600px;
    min-height: 500px;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 30px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.3);
    position: relative;
    font-size: 14px;
    box-sizing: border-box;
    border: none;
    outline: none;
  }

  /* Ensure scrollbar doesn't interfere with border radius */
  .modal-content::-webkit-scrollbar {
    width: 8px;
  }

  .modal-content::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 0 12px 12px 0;
    margin: 4px 0;
  }

  .modal-content::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    border: 2px solid transparent;
    background-clip: content-box;
  }

  .modal-content::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
    background-clip: content-box;
  }

  .modal-content::-webkit-scrollbar-corner {
    background: transparent;
  }

  /* Responsive adjustments for smaller screens */
  @media (max-width: 768px) {
    .modal-content {
      width: 98vw;
      height: 98vh;
      min-width: 320px;
      min-height: 400px;
      padding: 20px;
      font-size: 13px;
    }

    .unified-prompt-area {
      min-height: 100px;
      font-size: 13px;
    }

    .editable-area,
    .rich-editor-area {
      min-height: 300px;
      padding: 1.5em;
    }

    .control-row {
      flex-direction: column;
      gap: 15px;
      align-items: flex-start;
    }

    .finalize-buttons-container {
      flex-direction: column;
      gap: 15px;
    }

    .finalize-button {
      min-width: 200px;
      padding: 10px 20px;
      font-size: 1em;
    }
  }

  @media (max-width: 480px) {
    .modal-content {
      padding: 15px;
      font-size: 12px;
    }

    .unified-config-section {
      padding: 15px;
    }

    .streamlined-instructions {
      padding: 12px 15px;
    }
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
    max-width: 100%;
    min-height: 400px;
    padding: 2em;
    border: 1px solid #e3e3e3;
    border-radius: 8px;
    text-align: left;
    overflow: auto;
    background-color: #fafafa;
    box-sizing: border-box;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .editable-area * {
    max-width: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .editable-area ul,
  .editable-area ol {
    padding-left: 20px;
    margin: 10px 0;
  }

  .editable-area li {
    margin-bottom: 8px;
    line-height: 1.5;
  }

  .final-instructions {
    font-size: 0.9em;
    color: #555;
    margin-top: 20px;
    background: #fffbe6;
    padding: 16px 20px;
    border-left: 4px solid var(--cldYellow);
    border-right: 4px solid var(--cldYellow);
    border-radius: 8px;
    text-align: left;
    width: 100%;
    box-sizing: border-box;
  }
  .rss-item-container {
    background: #fff;
    margin-top: 10px;
  }

  .finalize-buttons-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 20px;
    padding: 2em 0;
    margin-top: 2em;
    align-items: center;
  }

  .finalize-button {
    color: white;
    padding: 12px 24px;
    border: 1px solid white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.1em;
    font-weight: 500;
    transition: all 0.25s;
    min-width: 180px;
  }

  .finalize-button.primary {
    background-color: var(--cldBlue);
  }

  .finalize-button.secondary {
    background-color: var(--cldSlate);
  }

  .finalize-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .finalize-button.primary:hover {
    color: var(--cldBlue);
    background: white;
    border: 1px solid var(--cldBlue);
  }

  .finalize-button.secondary:hover {
    color: var(--cldSlate);
    background: white;
    border: 1px solid var(--cldSlate);
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
  .spinner {
    border: 2px solid #eee;
    border-top: 2px solid var(--cldSlate);
    border-radius: 50%;
    width: 14px;
    height: 14px;
    animation: spin 0.7s linear infinite;
    display: inline-block;
    vertical-align: middle;
    margin-right: 6px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Rich Text Editor Styles */
  .editor-controls {
    margin: 1em 0;
    text-align: left;
    width: 100%;
  }

  .control-row {
    display: flex;
    gap: 30px;
    align-items: center;
    flex-wrap: wrap;
  }

  .editor-mode-toggle,
  .include-rss-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-weight: 500;
    color: #333;
  }

  .editor-mode-toggle input[type="checkbox"],
  .include-rss-toggle input[type="checkbox"] {
    margin: 0;
  }

  .control-description {
    margin-top: 8px;
    color: #666;
    font-style: italic;
  }

  /* RSS Toggle Notice */
  .rss-toggle-notice {
    background-color: #f8f9fa;
    border: 1px solid #e3e3e3;
    border-radius: 8px;
    padding: 15px;
    margin: 15px 0;
    text-align: center;
  }

  .rss-notice-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .rss-notice-icon {
    font-size: 1.2em;
  }

  .show-rss-button {
    background-color: var(--cldBlue);
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
    transition: all 0.2s;
  }

  .show-rss-button:hover {
    background-color: var(--cldSlate);
    transform: translateY(-1px);
  }

  .rich-text-editor {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
  }

  .rich-text-toolbar {
    display: flex;
    gap: 4px;
    padding: 8px;
    background-color: #f8f9fa;
    border: 1px solid #e3e3e3;
    border-bottom: none;
    border-radius: 5px 5px 0 0;
    flex-wrap: wrap;
  }

  .rich-text-toolbar button {
    padding: 6px 10px;
    border: 1px solid #ddd;
    background-color: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    min-width: 32px;
    transition: all 0.2s;
  }

  .rich-text-toolbar button:hover {
    background-color: #f0f0f0;
    border-color: #999;
  }

  .rich-text-toolbar button:active {
    background-color: #e0e0e0;
  }

  .rich-editor-area {
    width: 100%;
    min-height: 400px;
    padding: 2em;
    border: 1px solid #e3e3e3;
    border-radius: 0 0 8px 8px;
    text-align: left;
    overflow: auto;
    background-color: #fafafa;
    box-sizing: border-box;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .rich-editor-area * {
    max-width: 100%;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .rich-editor-area:focus {
    outline: none;
    border-color: var(--cldBlue);
    box-shadow: 0 0 0 2px rgba(0, 115, 230, 0.1);
  }

  /* Unified Configuration Styles */
  .unified-config-section {
    background-color: #f8f9fa;
    border: 1px solid #e3e3e3;
    border-radius: 8px;
    padding: 25px;
    margin: 25px 0;
    text-align: left;
    box-sizing: border-box;
    width: 100%;
  }

  .unified-config-section h3 {
    margin: 0 0 15px 0;
    color: #333;
    font-size: 16px;
    font-weight: 600;
  }

  .config-description {
    margin-bottom: 15px;
    font-size: 0.9em;
    color: #555;
  }

  .unified-prompt-area {
    width: 100%;
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    min-height: 120px;
    box-sizing: border-box;
    line-height: 1.5;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .unified-prompt-area:focus {
    outline: none;
    border-color: var(--cldBlue);
    box-shadow: 0 0 0 3px rgba(0, 115, 230, 0.1);
  }

  /* Streamlined Instructions Styles */
  .streamlined-instructions {
    background-color: #f9f9f9;
    border-left: 4px solid var(--cldSlate);
    border-right: 4px solid var(--cldSlate);
    padding: 16px 20px;
    margin: 20px 0;
    text-align: left;
    font-size: 0.9em;
    border-radius: 8px;
    width: 100%;
    box-sizing: border-box;
  }

  .streamlined-instructions .instruction-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .streamlined-instructions .instruction-icon {
    font-size: 1.1em;
    color: var(--cldBlue);
  }
</style>