<template>
  <div class="modal-overlay" aria-modal="true" role="dialog">
    <div class="modal-content">
      <h2>Email Template Editor</h2>
      <!-- * Close Button -->
      <button class="close-button" @click="closeModal">✖ Close</button>

      <!-- * RSS Items Display - Collapsible -->
      <div
        v-if="emailTemplates && emailTemplates.length > 0"
        class="unified-config-section rss-collapsible-section"
      >
        <div class="rss-header" @click="toggleRssSection">
          <h3>RSS Feed Items (for reference)</h3>
          <span class="rss-caret" :class="{ expanded: rssSectionExpanded }"
            >▼</span
          >
        </div>
        <div
          v-show="rssSectionExpanded"
          class="rss-items-container"
          v-html="formattedRssItems"
        ></div>
      </div>

      <!-- * Editor Controls -->
      <div class="editor-controls">
        <div class="control-row">
          <label class="editor-mode-toggle">
            <input
              type="checkbox"
              v-model="richTextMode"
              @change="toggleEditorMode"
            />
            <span>Rich Text Editor</span>
          </label>
        </div>
      </div>

      <!-- Editor Section with Help Icon -->
      <div class="editor-section-wrapper">
        <div class="editor-help-container">
          <div class="help-icon-wrapper">
            <span class="help-icon">?</span>
            <div class="help-tooltip">
              <div class="tooltip-content">
                <p class="tooltip-title">What can I add here?</p>
                <p>
                  Customer Name, Instructions, Draft content, or any other
                  context to guide email generation.
                </p>
                <p class="tooltip-note">
                  If left empty, defaults will be used.
                </p>
              </div>
            </div>
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
            data-placeholder='You can add: Customer Name (e.g., "Customer Name: John Smith"), Instructions (e.g., "Instructions: Focus on video features"), draft email content, or any other context to guide email generation. If left empty, defaults will be used.'
            @input="updateRichEditorContent"
            @focus="handleEditorFocus('rich')"
            @blur="handleEditorBlur('rich')"
          ></div>
        </div>

        <!-- Simple Editable Area (when rich text is disabled) -->
        <div
          v-else
          ref="editor"
          class="editable-area"
          contenteditable="true"
          data-placeholder='You can add: Customer Name (e.g., "Customer Name: John Smith"), Instructions (e.g., "Instructions: Focus on video features"), draft email content, or any other context to guide email generation. If left empty, defaults will be used.'
          @input="updateEditorContent"
          @focus="handleEditorFocus('simple')"
          @blur="handleEditorBlur('simple')"
        ></div>
      </div>

      <!-- * Streamlined Instructions -->
      <div class="streamlined-instructions">
        <div class="instruction-item">
          <span class="instruction-icon">✏️</span>
          <span
            >Add customer name, instructions, draft content, or any context in
            the editor above</span
          >
        </div>
        <div class="instruction-item">
          <span class="instruction-icon">💡</span>
          <span
            >Examples: "Customer Name: John Smith" or "Instructions: Focus on
            video features"</span
          >
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

      <div class="final-instructions">
        <p>
          <strong>Ready to send?</strong> Click "Finalize Email" to copy the
          content to your clipboard and open a new Gmail draft.
        </p>
      </div>

      <!-- * Finalize Buttons -->
      <div class="finalize-buttons-container">
        <button class="finalize-button primary" @click="finalizeEmail">
          Finalize Email
        </button>

        <!-- Generate Button (only shown before first generation) -->
        <button
          v-if="!hasGeneratedResponse"
          class="finalize-button secondary"
          @click="generateEmailWithGPT"
          :disabled="isGeneratingWithPrompt"
        >
          <span v-if="isGeneratingWithPrompt">
            <span class="spinner"></span> Generating... {{ pollingProgress }}
          </span>
          <span v-else>Generate with ChatGPT</span>
        </button>

        <!-- Regenerate Button (only shown after first GPT response) -->
        <button
          v-if="hasGeneratedResponse"
          class="finalize-button secondary regenerate"
          @click="regenerateEmailWithGPT"
          :disabled="isGeneratingWithPrompt"
        >
          <span v-if="isGeneratingWithPrompt">
            <span class="spinner"></span> Regenerating... {{ pollingProgress }}
          </span>
          <span v-else>🔄 Regenerate Response</span>
        </button>

        <!-- Cancel Button (only shown during generation) -->
        <button
          v-if="isGeneratingWithPrompt"
          class="finalize-button cancel"
          @click="cancelGeneration"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script>
  import { generateMimeEmail } from "@/utils/encodeEmail";
  import { nextTick } from "vue";
  import {
    generateEmailPrompt,
    DEFAULT_EMAIL_CONTEXT,
  } from "@/utils/emailPromptTemplate";

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
        richTextMode: false,
        includeRssInGpt: true, // Keep for GPT generation logic
        rssSectionExpanded: true, // Default to expanded
        isGeneratingWithPrompt: false,
        pollingProgress: "",
        hasGeneratedResponse: false,
        generationCancelled: false, // Flag to cancel ongoing generation
      };
    },
    computed: {
      formattedRssItems() {
        if (!this.emailTemplates || this.emailTemplates.length === 0) {
          return "";
        }

        return this.emailTemplates
          .map((email) => {
            const enrichedHTML = email.enrichedFeatures
              ? `<ul style="padding-left: 1.5em;">
                                                                                            ${email.enrichedFeatures
                                                                                              .map(
                                                                                                (
                                                                                                  feature
                                                                                                ) => `
                                                                                                <li style="margin-bottom: 8px;">
                                                                                                  <a href="${feature.url}" target="_blank" rel="noopener noreferrer" style="color: #0073e6; font-weight: bold; text-decoration: none;">${feature.title}</a>
                                                                                                  <p style="margin: 4px 0 0 0; font-size: 13px; line-height: 1.4;">${feature.preview}</p>
                                                                                                </li>
                                                                                              `
                                                                                              )
                                                                                              .join(
                                                                                                ""
                                                                                              )}
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
      },
    },
    mounted() {
      this.initializeEditorContent();
      document.body.style.overflow = "hidden";
      // * Delegate click behavior for links inside editable area
      // Add listeners to both editors since we don't know which one will be active
      this.$nextTick(() => {
        if (this.$refs.editor) {
          this.$refs.editor.addEventListener("click", this.handleLinkClick);
        }
        if (this.$refs.richEditor) {
          this.$refs.richEditor.addEventListener("click", this.handleLinkClick);
        }
      });
    },
    beforeDestroy() {
      document.body.style.overflow = "";
      if (this.$refs.editor) {
        this.$refs.editor.removeEventListener("click", this.handleLinkClick);
      }
      if (this.$refs.richEditor) {
        this.$refs.richEditor.removeEventListener("click", this.handleLinkClick);
      }
    },
    watch: {
      emailTemplates: {
        handler() {
          nextTick(() => this.initializeEditorContent());
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      initializeEditorContent() {
        // Reset the generated response flag
        this.hasGeneratedResponse = false;
        // Reset cancellation flag
        this.generationCancelled = false;
        // Reset loading state
        this.isGeneratingWithPrompt = false;
        this.pollingProgress = "";

        // Set empty content - placeholder will be shown via CSS
        this.editorContent = "";

        // Set content in the appropriate editor based on mode
        if (this.richTextMode && this.$refs.richEditor) {
          this.$refs.richEditor.innerHTML = "";
          this.$refs.richEditor.classList.add("empty");
        } else if (this.$refs.editor) {
          this.$refs.editor.innerHTML = "";
          this.$refs.editor.classList.add("empty");
        }
      },
      handleEditorFocus(type) {
        const editor =
          type === "rich" ? this.$refs.richEditor : this.$refs.editor;
        if (editor) {
          editor.classList.remove("empty");
        }
      },
      handleEditorBlur(type) {
        const editor =
          type === "rich" ? this.$refs.richEditor : this.$refs.editor;
        if (editor) {
          const text = editor.innerText || editor.textContent || "";
          if (text.trim() === "") {
            editor.classList.add("empty");
            editor.innerHTML = "";
          } else {
            editor.classList.remove("empty");
          }
        }
      },

      toggleRssSection() {
        this.rssSectionExpanded = !this.rssSectionExpanded;
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
        const editor = this.$refs.editor;
        if (editor) {
          const text = editor.innerText || editor.textContent || "";
          if (text.trim() === "") {
            editor.classList.add("empty");
            this.editorContent = "";
          } else {
            editor.classList.remove("empty");
            this.editorContent = editor.innerHTML;
          }
        }
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
        // Cancel any ongoing generation
        this.generationCancelled = true;
        this.isGeneratingWithPrompt = false;
        this.pollingProgress = "";
        // Reset state
        this.editorContent = "";
        this.hasGeneratedResponse = false;
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
        // Reset cancellation flag at start of generation
        this.generationCancelled = false;
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

          // Extract content from the editor
          let editorContent = "";

          // Get content from the appropriate editor based on mode
          if (this.richTextMode && this.$refs.richEditor) {
            editorContent =
              this.$refs.richEditor.innerText ||
              this.$refs.richEditor.textContent ||
              "";
          } else if (this.$refs.editor) {
            editorContent =
              this.$refs.editor.innerText || this.$refs.editor.textContent || "";
          }

          // Parse customer name and instructions from editor content
          let customerName = "";
          let instructions = "";
          let userCustomText = "";

          // Remove placeholder text and RSS markers
          const placeholderPatterns = [
            "Write your email content here...",
            "July",
            "release notes",
            "Publish Date:",
          ];

          if (
            editorContent &&
            !editorContent.includes("Write your email content here...")
          ) {
            const lines = editorContent.split("\n");
            let inInstructionsSection = false;
            let instructionsLines = [];
            const customLines = [];

            for (let i = 0; i < lines.length; i++) {
              const trimmedLine = lines[i].trim();

              // Skip placeholder patterns
              const isPlaceholder = placeholderPatterns.some((pattern) =>
                trimmedLine.includes(pattern)
              );
              if (isPlaceholder) continue;

              // Check for customer name pattern
              const customerNameMatch = trimmedLine.match(
                /Customer\s+Name\s*:?\s*(.+)/i
              );
              if (customerNameMatch) {
                customerName = customerNameMatch[1].trim();
                continue;
              }

              // Check for instructions/context patterns
              const instructionsHeaderMatch = trimmedLine.match(
                /(?:Instructions|Context|Additional\s+Instructions|Additional\s+Context)\s*:?\s*(.+)?/i
              );
              if (instructionsHeaderMatch) {
                inInstructionsSection = true;
                if (instructionsHeaderMatch[1]) {
                  instructionsLines.push(instructionsHeaderMatch[1].trim());
                }
                continue;
              }

              // If we're in instructions section, collect lines until we hit another header or empty line
              if (inInstructionsSection) {
                if (
                  trimmedLine &&
                  !/^(Customer\s+Name|Instructions|Context)/i.test(trimmedLine)
                ) {
                  instructionsLines.push(trimmedLine);
                } else {
                  inInstructionsSection = false;
                  if (trimmedLine) {
                    customLines.push(trimmedLine);
                  }
                }
              } else if (trimmedLine) {
                // Regular content line
                customLines.push(trimmedLine);
              }
            }

            // Join instructions if found
            if (instructionsLines.length > 0) {
              instructions = instructionsLines.join("\n").trim();
            }

            // Join custom text if found
            if (customLines.length > 0) {
              userCustomText = customLines.join("\n").trim();
            }
          }

          // Default context if no instructions provided
          const emailContext = instructions || DEFAULT_EMAIL_CONTEXT;

          // Generate the prompt using the template utility
          // This keeps the prompt maintainable and separate from component logic
          const enhancedPrompt = generateEmailPrompt({
            emailContext,
            customerName,
            userCustomText,
          });

          // Log the prompt for debugging (remove in production if desired)
          console.log("Generated prompt:", enhancedPrompt);

          // Always include RSS items in the content sent to GPT for reference
          // The toggle only controls visibility in the configuration area, not what's sent to GPT
          let contentToSend = this.editorContent;

          // Add RSS items to the content sent to GPT (always included regardless of toggle)
          if (this.emailTemplates && this.emailTemplates.length > 0) {
            contentToSend += this.formattedRssItems;
          }

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

          // Check if generation was cancelled after initial delay
          if (this.generationCancelled) {
            console.log("Generation cancelled after initial delay");
            return; // Exit early without error
          }

          while (attempt < maxAttempts) {
            // Check if generation was cancelled (e.g., modal closed)
            if (this.generationCancelled) {
              console.log("Generation cancelled by user");
              return; // Exit early without error
            }

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

          // Check if generation was cancelled before processing result
          if (this.generationCancelled) {
            console.log("Generation cancelled before processing result");
            return; // Exit early without error
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

          // Store customer name for post-processing (needed for greeting check)
          const customerNameForProcessing = customerName;

          // Enhanced link processing for Gmail compatibility
          const processedText = this.processLinksForGmail(text);

          // First, convert markdown to HTML before processing lists
          let safe = String(processedText);

          // Convert markdown bold more conservatively - only for short phrases
          safe = safe.replace(/\*\*([^*]{1,50}?)\*\*/g, "<strong>$1</strong>");
          // Convert italic
          safe = safe.replace(/\*([^*]{1,50}?)\*/g, "<em>$1</em>");

          // Convert newlines to <br> for non-list content
          // But we need to be careful not to break list formatting
          safe = safe.replace(/\n/g, "<br>");

          // Now properly format numbered lists for Gmail
          // This regex matches numbered list items: "1. " or "1. " at start of line or after <br>
          // Pattern: number followed by period and space, then content until next number or end
          safe = this.formatNumberedListsForGmail(safe);

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

          // Fix the specific pattern: "1. <br> CONTENT" to "1. CONTENT"
          safe = safe.replace(/(\d+\.)\s*<br>\s*([^<]+)/g, "$1 $2");

          // Clean up any remaining line breaks after numbers
          safe = safe.replace(/(\d+\.)\s*<br>\s*/g, "$1 ");

          // Fix the pattern where content is split across multiple lines within list items
          // This handles cases like "1. We've introduced <br>five new Model Context Protocol..."
          safe = safe.replace(
            /(\d+\.\s*[^<]*?)<br>([^<]*?)(?=<br><br>|\d+\.|$)/g,
            "$1 $2"
          );

          // Fix any remaining line breaks that split list item content
          safe = safe.replace(
            /(\d+\.\s*[^<]*?)<br>([^<]*?)(?=\d+\.|$)/g,
            "$1 $2"
          );

          // Clean up multiple consecutive line breaks within list items
          safe = safe.replace(
            /(\d+\.\s*[^<]*?)<br><br>([^<]*?)(?=\d+\.|$)/g,
            "$1 $2"
          );

          // Final cleanup: Remove any remaining line breaks that split list item content
          // This is a more aggressive approach to ensure clean list formatting
          safe = safe.replace(
            /(\d+\.\s*[^<]*?)<br>([^<]*?)(?=\d+\.|$)/g,
            "$1 $2"
          );

          // Remove name and position placeholders
          safe = safe.replace(/\[Your Name\]/g, "");
          safe = safe.replace(/\[Your Position\]/g, "");
          safe = safe.replace(/\[Your Name\]<br>/g, "");
          safe = safe.replace(/\[Your Position\]<br>/g, "");

          // Fix line breaks before links in paragraphs (outside of lists)
          // This handles cases where there's a line break between text and a link
          safe = safe.replace(/([^>])\s*<br>\s*<a\s+href=/g, "$1 <a href=");

          // Fix line breaks within paragraphs that split text (but not within list items)
          // Only fix if not inside an <li> tag
          safe = safe.replace(
            /([a-z])\s*<br>\s*([a-z])/gi,
            (match, p1, p2, offset, string) => {
              // Check if we're inside a list item
              const beforeMatch = string.substring(0, offset);
              const lastLiOpen = beforeMatch.lastIndexOf("<li");
              const lastLiClose = beforeMatch.lastIndexOf("</li>");
              // If we're inside a list item, don't fix this
              if (lastLiOpen > lastLiClose) {
                return match; // Keep the <br> inside list items
              }
              return `${p1} ${p2}`;
            }
          );

          // Remove unwanted bold formatting from regular paragraphs (not in list items)
          safe = safe.replace(/<strong>([^<]+)<\/strong>/g, (match, content) => {
            // If it's a short phrase (likely intentional), keep it
            // If it's a long paragraph, remove bold
            if (content.length > 50 && !content.includes("<")) {
              return content;
            }
            return match; // Keep short bold phrases
          });

          // CRITICAL: Remove subject lines (must be done before other processing)
          // Remove "Subject:" lines at the start (with or without line breaks)
          safe = safe.replace(/^Subject:\s*[^<\n]*/i, "");
          safe = safe.replace(/Subject:\s*[^<\n]*/gi, "");
          // Remove subject lines that might be on their own line
          safe = safe.replace(/<br>\s*Subject:\s*[^<\n]*<br>/gi, "<br>");
          safe = safe.replace(/<br>\s*Subject:\s*[^<\n]*/gi, "<br>");
          // Remove any text that appears on the same line as "Subject:"
          safe = safe.replace(/Subject:[^<\n]*\n?/gi, "");

          // CRITICAL: Ensure greeting is present and fix "Dear" if it appears
          // Check if email starts with a greeting (check text content, not HTML)
          const textContent = safe
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          const startsWithGreeting = /^(Hi|Hello)\s+/i.test(textContent);
          if (!startsWithGreeting) {
            // Email doesn't start with greeting - add it
            // Remove any leading <br> tags first
            safe = safe.replace(/^(<br\s*\/?>)+/i, "");
            if (customerNameForProcessing) {
              const firstName = customerNameForProcessing.split(" ")[0];
              safe = `Hi ${firstName},<br><br>${safe}`;
            } else {
              safe = `Hi there,<br><br>${safe}`;
            }
          }

          // Remove "Dear" if it appears (should never happen but safety check)
          // Handle "Dear" at the start of content
          safe = safe.replace(/^Dear\s+([^,<\n]+),?\s*/i, (match, name) => {
            const trimmedName = name.trim();
            return trimmedName ? `Hi ${trimmedName}, ` : "Hi ";
          });
          // Handle "Dear" anywhere else
          safe = safe.replace(/Dear\s+([^,<]+),?\s*/gi, (match, name) => {
            const trimmedName = name.trim();
            return trimmedName ? `Hi ${trimmedName}, ` : "Hi ";
          });
          // Handle "Dear" followed by line break
          safe = safe.replace(/Dear\s+([^,<\n]+),?\s*<br>/gi, (match, name) => {
            const trimmedName = name.trim();
            return trimmedName ? `Hi ${trimmedName},<br>` : "Hi<br>";
          });

          // Ensure ONE continuous list - merge multiple <ol> tags into one
          // This handles cases where GPT creates multiple separate lists instead of one continuous list
          const listMatches = [...safe.matchAll(/<ol[^>]*>(.*?)<\/ol>/gs)];
          if (listMatches.length > 1) {
            // Extract all <li> items from all lists
            const allListItems = [];
            let firstListStart = -1;
            let lastListEnd = -1;

            listMatches.forEach((match, index) => {
              const listContent = match[1];
              const items = listContent.match(/<li[^>]*>.*?<\/li>/gs);
              if (items) {
                allListItems.push(...items);
              }

              // Track positions
              const matchStart = match.index;
              const matchEnd = matchStart + match[0].length;
              if (index === 0) {
                firstListStart = matchStart;
              }
              if (matchEnd > lastListEnd) {
                lastListEnd = matchEnd;
              }
            });

            // If we found multiple lists with items, merge them
            if (
              allListItems.length > 0 &&
              firstListStart !== -1 &&
              lastListEnd !== -1
            ) {
              // Create one continuous list with all items
              const singleList = `<ol style="margin: 12px 0; padding-left: 30px; font-family: Arial, sans-serif; line-height: 1.6;">${allListItems.join(
                ""
              )}</ol>`;

              // Replace all lists (and any content between them) with the single continuous list
              const beforeLists = safe.substring(0, firstListStart);
              const afterLists = safe.substring(lastListEnd);
              safe = beforeLists + singleList + afterLists;
            }
          }

          // Add proper spacing between paragraphs and sections
          // First, ensure spacing between introduction and list
          safe = safe.replace(
            /([^>])(<ol[^>]*>)/g,
            (match, p1, p2, offset, string) => {
              // Check if there's already spacing
              const before = string.substring(Math.max(0, offset - 10), offset);
              if (!before.match(/<br>\s*$/)) {
                return `${p1}<br><br>${p2}`;
              }
              return match;
            }
          );

          // Ensure spacing after list (before closing paragraph)
          safe = safe.replace(
            /(<\/ol>)([^<])/g,
            (match, p1, p2, offset, string) => {
              // Check if there's already spacing
              const after = string.substring(
                offset + match.length,
                offset + match.length + 10
              );
              if (!after.match(/^\s*<br>/)) {
                return `${p1}<br><br>${p2}`;
              }
              return match;
            }
          );

          // Ensure spacing between text paragraphs (handle cases without <p> tags)
          // Add spacing between consecutive text blocks separated by <br><br>
          // This handles plain text paragraphs
          safe = safe.replace(/([^>])(<br><br>)([^<])/g, "$1<br><br>$3");

          // Ensure spacing between paragraphs with <p> tags (not in lists)
          safe = safe.replace(
            /(<\/p>)(<p[^>]*>)/g,
            (match, p1, p2, offset, string) => {
              // Check if we're inside a list
              const beforeMatch = string.substring(0, offset);
              const lastOlOpen = beforeMatch.lastIndexOf("<ol");
              const lastOlClose = beforeMatch.lastIndexOf("</ol>");
              // If we're inside a list, don't add spacing
              if (lastOlOpen > lastOlClose) {
                return match;
              }
              // Add spacing between paragraphs
              return `${p1}<br><br>${p2}`;
            }
          );

          // Clean up excessive spacing (more than 2 <br> in a row)
          safe = safe.replace(/(<br>\s*){3,}/g, "<br><br>");

          // Ensure there's spacing between the introduction and list if they're too close
          // Look for pattern: text ending, then immediately <ol>
          safe = safe.replace(/([a-z])(<ol[^>]*>)/gi, "$1<br><br>$2");

          // Ensure there's spacing between list and closing paragraph
          safe = safe.replace(/(<\/ol>)([A-Z])/g, "$1<br><br>$2");

          const gptOutput = `<div style="margin-top:1em; padding-top:1em; font-family: Arial, sans-serif;">
                                                                                                                           <h4 style="color: #333; margin-bottom: 10px;">GPT Generated Email:</h4>
                                                                                                                           <div style="line-height: 1.6; color: #333;">${safe}</div>
                                                                                                                         </div>`;

          this.editorContent += gptOutput;

          // Check if generation was cancelled before updating UI
          if (this.generationCancelled) {
            console.log("Generation cancelled before updating UI");
            return; // Exit early without error
          }

          // Set flag that we have generated a response (enables regenerate button)
          this.hasGeneratedResponse = true;

          // Update the appropriate editor
          if (this.richTextMode && this.$refs.richEditor) {
            this.$refs.richEditor.innerHTML = this.editorContent;
          } else if (this.$refs.editor) {
            this.$refs.editor.innerHTML = this.editorContent;
          }
        } catch (error) {
          // Don't show error if generation was cancelled
          if (this.generationCancelled) {
            console.log("Generation cancelled, ignoring error");
            return;
          }
          console.error("GPT polling error:", error);
          alert(
            error?.message || "An error occurred while generating the email."
          );
        } finally {
          // Only reset loading state if not cancelled (cancellation already handled in closeModal)
          if (!this.generationCancelled) {
            this.isGeneratingWithPrompt = false;
            this.pollingProgress = "";
          }
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
                                                                                                                             style="color: #0073e6; text-decoration: none;">${linkText}</a>`;
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
              // Add click listener to rich editor
              this.$refs.richEditor.addEventListener(
                "click",
                this.handleLinkClick
              );
            }
          });
        } else {
          // Switching to simple mode
          this.$nextTick(() => {
            if (this.$refs.editor) {
              this.$refs.editor.innerHTML = this.editorContent;
              // Add click listener to simple editor
              this.$refs.editor.addEventListener("click", this.handleLinkClick);
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
        const editor = this.$refs.richEditor;
        if (editor) {
          const text = editor.innerText || editor.textContent || "";
          if (text.trim() === "") {
            editor.classList.add("empty");
            this.editorContent = "";
          } else {
            editor.classList.remove("empty");
            this.editorContent = editor.innerHTML;
          }
        }
      },

      // Regenerate email with GPT
      async regenerateEmailWithGPT() {
        // Remove the previous GPT response from editor content
        const gptResponseIndex = this.editorContent.indexOf(
          "GPT Generated Email:"
        );
        if (gptResponseIndex !== -1) {
          // Keep only the content up to the GPT response
          this.editorContent = this.editorContent.substring(0, gptResponseIndex);
        }

        // Update the editor display
        if (this.richTextMode && this.$refs.richEditor) {
          this.$refs.richEditor.innerHTML = this.editorContent;
        } else if (this.$refs.editor) {
          this.$refs.editor.innerHTML = this.editorContent;
        }

        // Generate new response
        await this.generateEmailWithGPT();
      },

      // Cancel generation process
      cancelGeneration() {
        this.generationCancelled = true;
        this.isGeneratingWithPrompt = false;
        this.pollingProgress = "";
        console.log("Generation cancelled by user");
      },

      // Format numbered lists for Gmail compatibility
      formatNumberedListsForGmail(content) {
        // First, handle cases where numbered lists might be on separate lines
        // Pattern: "1. " at start or after <br>, followed by content
        // We'll process the content line by line

        // Split by <br> but preserve them for reconstruction
        const lines = content.split(/<br>/);
        const result = [];
        let currentList = [];
        let currentListItem = null;
        let inList = false;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();

          // Check if this line starts a new numbered list item
          // Pattern: starts with digit(s), period, space, then content
          const listItemMatch = line.match(/^(\d+)\.\s+(.+)$/);

          if (listItemMatch) {
            // Save previous list item if exists
            if (currentListItem !== null) {
              currentList.push(currentListItem);
            }

            // Start new list if not already in one
            if (!inList) {
              inList = true;
            }

            // Start new list item
            currentListItem = listItemMatch[2]; // Content after "1. "
          } else if (inList && line && currentListItem !== null) {
            // This line continues the current list item (multi-line list item)
            // Only continue if it doesn't look like a new list item
            if (!line.match(/^\d+\.\s+/)) {
              currentListItem += " " + line;
            } else {
              // This is actually a new list item, save the previous one
              currentList.push(currentListItem);
              const newMatch = line.match(/^(\d+)\.\s+(.+)$/);
              if (newMatch) {
                currentListItem = newMatch[2];
              } else {
                currentListItem = null;
                inList = false;
                result.push(this.createGmailOrderedList(currentList));
                currentList = [];
                if (line) result.push(line);
              }
            }
          } else {
            // Not a list item
            if (inList && currentList.length > 0) {
              // Save current list item if exists
              if (currentListItem !== null) {
                currentList.push(currentListItem);
                currentListItem = null;
              }
              // Close the list
              result.push(this.createGmailOrderedList(currentList));
              currentList = [];
              inList = false;
            } else if (currentListItem !== null) {
              // We had a single list item, but now we're out of list context
              // This shouldn't happen often, but handle it
              currentList.push(currentListItem);
              currentListItem = null;
            }

            // Add non-list content
            if (line) {
              result.push(line);
            }
          }
        }

        // Handle any remaining list
        if (inList) {
          if (currentListItem !== null) {
            currentList.push(currentListItem);
          }
          if (currentList.length > 0) {
            result.push(this.createGmailOrderedList(currentList));
          }
        }

        // Join all parts with <br>
        return result.join("<br>");
      },

      // Create Gmail-compatible ordered list with inline styles
      createGmailOrderedList(items) {
        // Gmail needs inline styles and proper structure
        // Use inline styles that Gmail supports
        let listHtml =
          '<ol style="margin: 12px 0; padding-left: 30px; font-family: Arial, sans-serif; line-height: 1.6;">';

        items.forEach((item) => {
          // Clean up the item - remove extra <br> tags within the item but preserve other HTML
          let cleanItem = item.trim();

          // Remove <br> tags that break up the list item content
          cleanItem = cleanItem.replace(/<br>\s*/g, " ");

          // Fix multiple spaces
          cleanItem = cleanItem.replace(/\s+/g, " ");

          // Ensure proper spacing after links (colon should be right after link)
          cleanItem = cleanItem.replace(/(<\/a>)\s*:\s*/g, "$1: ");

          // Ensure proper spacing before links
          cleanItem = cleanItem.replace(/\s+(<a\s+href=)/g, " $1");

          // Style the list item with Gmail-compatible inline styles
          listHtml += `<li style="margin-bottom: 10px; padding-left: 0; line-height: 1.6; color: #333; font-size: 14px;">${cleanItem}</li>`;
        });

        listHtml += "</ol>";
        return listHtml;
      },

      // Format content as proper numbered list (legacy method - keeping for compatibility)
      formatAsNumberedList(content) {
        // Remove subject line if present
        content = content.replace(/Subject:\s*[^<]*?<br>/gi, "");

        // Clean up the malformed HTML structure that GPT is generating
        // Remove empty list items and malformed nested lists
        content = content.replace(
          /<ol><ul><li><strong><a[^>]*><\/a><\/strong><\/li><\/ul><\/ol>/g,
          ""
        );

        // Clean up any remaining HTML artifacts
        content = content.replace(/<="" li="">/g, "");

        // Find all the feature sections that start with links
        // Support both with and without <strong> tags for backward compatibility
        // First, try pattern with bold tags
        const featurePatternWithBold =
          /<strong><a href="([^"]*)"[^>]*>([^<]*)<\/a><\/strong>:\s*([^<]*?)(?=<br><br>|$)/g;
        // Then try pattern without bold tags
        const featurePatternWithoutBold =
          /<a href="([^"]*)"[^>]*>([^<]*)<\/a>:\s*([^<]*?)(?=<br><br>|$)/g;

        let formattedContent = "";
        let lastIndex = 0;
        let match;
        const matches = [];

        // Extract the greeting and intro content (before first feature)
        // Check for both patterns to find the first feature
        const firstFeatureMatchWithBold = content.match(
          /<strong><a href="[^"]*"[^>]*>[^<]*<\/a><\/strong>:/
        );
        const firstFeatureMatchWithoutBold = content.match(
          /<a href="[^"]*"[^>]*>[^<]*<\/a>:/
        );

        const firstFeatureMatch =
          firstFeatureMatchWithBold || firstFeatureMatchWithoutBold;
        if (firstFeatureMatch) {
          const introContent = content.substring(0, firstFeatureMatch.index);
          formattedContent += introContent;
          lastIndex = firstFeatureMatch.index;
        }

        // Collect all matches from both patterns
        // Try pattern with bold first
        while ((match = featurePatternWithBold.exec(content)) !== null) {
          matches.push({
            index: match.index,
            url: match[1],
            title: match[2],
            description: match[3],
            fullMatch: match[0],
          });
        }

        // If no matches with bold, try without bold
        if (matches.length === 0) {
          while ((match = featurePatternWithoutBold.exec(content)) !== null) {
            matches.push({
              index: match.index,
              url: match[1],
              title: match[2],
              description: match[3],
              fullMatch: match[0],
            });
          }
        }

        // Process each feature and convert to proper list items
        matches.forEach((matchData) => {
          // Add the feature as a proper list item (without bold for normal text)
          formattedContent += `<li><a href="${matchData.url}">${
            matchData.title
          }</a>: ${matchData.description.trim()}</li>`;
          lastIndex = Math.max(
            lastIndex,
            matchData.index + matchData.fullMatch.length
          );
        });

        // Add any remaining content after the last feature
        if (lastIndex < content.length) {
          const remainingContent = content.substring(lastIndex);
          formattedContent += remainingContent;
        }

        // Wrap list items in ordered list tags if we have any
        if (formattedContent.includes("<li>")) {
          formattedContent = formattedContent.replace(
            /(<li>.*?<\/li>)/gs,
            "<ol>$1</ol>"
          );
        }

        return formattedContent;
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

    .help-tooltip {
      width: 240px;
      right: -10px;
    }

    .editor-help-container {
      top: 8px;
      right: 8px;
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

  /* Editor Section Wrapper */
  .editor-section-wrapper {
    position: relative;
    width: 100%;
  }

  .editor-help-container {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10;
  }

  /* Adjust position when rich text editor is active (account for toolbar) */
  .editor-section-wrapper:has(.rich-text-editor) .editor-help-container {
    top: 50px; /* Account for toolbar height */
  }

  .help-icon-wrapper {
    position: relative;
    display: inline-block;
  }

  .help-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #e3e3e3;
    color: #666;
    font-size: 14px;
    font-weight: 600;
    cursor: help;
    transition: all 0.2s ease;
    user-select: none;
  }

  .help-icon:hover {
    background-color: var(--cldBlue);
    color: white;
    transform: scale(1.1);
  }

  .help-tooltip {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 280px;
    background: white;
    border: 1px solid #e3e3e3;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-8px);
    transition: all 0.2s ease;
    pointer-events: none;
    z-index: 1000;
  }

  .help-icon-wrapper:hover .help-tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    pointer-events: auto;
  }

  .tooltip-content {
    padding: 16px;
    font-size: 13px;
    line-height: 1.6;
    color: #333;
    text-align: left;
  }

  .tooltip-content p {
    margin: 0 0 8px 0;
    text-align: left;
  }

  .tooltip-content p:last-child {
    margin-bottom: 0;
  }

  .tooltip-title {
    font-weight: bold;
    margin-bottom: 10px !important;
    color: #222;
  }

  .tooltip-note {
    margin: 0;
    padding-top: 10px;
    border-top: 1px solid #e3e3e3;
    font-size: 12px;
    color: #666;
    font-style: italic;
    font-weight: normal;
  }

  /* Tooltip arrow */
  .help-tooltip::before {
    content: "";
    position: absolute;
    top: -6px;
    right: 12px;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid white;
  }

  .help-tooltip::after {
    content: "";
    position: absolute;
    top: -7px;
    right: 12px;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid #e3e3e3;
    z-index: -1;
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

  /* Placeholder styling for contenteditable */
  .editable-area.empty::before,
  .rich-editor-area.empty::before {
    content: attr(data-placeholder);
    color: #999;
    font-style: italic;
    pointer-events: none;
    position: absolute;
  }

  .editable-area.empty,
  .rich-editor-area.empty {
    position: relative;
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

  .finalize-button.regenerate {
    background-color: #17a2b8;
    border-color: #17a2b8;
    color: white;
  }

  .finalize-button.regenerate:hover {
    background-color: #138496;
    border-color: #138496;
    transform: translateY(-1px);
  }

  .finalize-button.cancel {
    background-color: #dc3545;
    border-color: #dc3545;
    color: white;
  }

  .finalize-button.cancel:hover {
    background-color: #c82333;
    border-color: #bd2130;
    transform: translateY(-1px);
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

  .editor-mode-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-weight: 500;
    color: #333;
  }

  .editor-mode-toggle input[type="checkbox"] {
    margin: 0;
  }

  .control-description {
    margin-top: 8px;
    color: #666;
    font-style: italic;
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

  /* RSS Items Section Styles - Collapsible */
  .rss-collapsible-section {
    margin-bottom: 25px;
  }

  .rss-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    user-select: none;
    padding: 5px 0;
    transition: background-color 0.2s ease;
    border-radius: 4px;
    margin: -5px -5px 15px -5px;
    padding: 10px 5px;
  }

  .rss-header:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  .rss-header h3 {
    margin: 0;
    color: #333;
    font-size: 16px;
    font-weight: 600;
    flex: 1;
  }

  .rss-caret {
    display: inline-block;
    font-size: 12px;
    color: #666;
    transition: transform 0.3s ease;
    margin-left: 10px;
    flex-shrink: 0;
  }

  .rss-caret.expanded {
    transform: rotate(180deg);
  }

  .rss-items-container {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #e3e3e3;
    border-radius: 6px;
    background-color: #fff;
    padding: 10px;
    margin-top: 10px;
  }

  .rss-items-container::-webkit-scrollbar {
    width: 8px;
  }

  .rss-items-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  .rss-items-container::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  .rss-items-container::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
</style>