/**
 * Email Prompt Template
 * 
 * This file contains the prompt template used for generating emails via GPT.
 * 
 * 📖 For documentation and guidelines, see: emailPromptTemplate.md (same directory)
 * 
 * This is the AUTHORITATIVE SOURCE for the prompt. Any changes to the prompt
 * should be made here. The markdown file serves as documentation only.
 * 
 * The template is built at build time and bundled with the application,
 * ensuring zero runtime overhead while keeping the prompt maintainable.
 */

/**
 * Generates the email generation prompt based on user context and instructions
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.emailContext - Context/instructions for the email
 * @param {string} options.customerName - Optional customer name
 * @param {string} options.userCustomText - Optional custom text from user
 * @returns {string} The complete prompt to send to GPT
 */
export function generateEmailPrompt({ emailContext, customerName = "", userCustomText = "" }) {
  const customerNameGreeting = customerName
    ? ` ${customerName.split(" ")[0]}`
    : "";

  const greetingExample = customerNameGreeting 
    ? `Hi${customerNameGreeting},` 
    : "Hi there,";
  
  return `Generate a customer email based on Cloudinary release notes. Your response MUST follow this EXACT format:

**REQUIRED FORMAT (copy this structure):**

${greetingExample}

[Write one paragraph introducing why you're reaching out and what update you're sharing. Keep it concise and engaging.]

1. [Feature Name](url): Description of feature and business value.
2. [Feature Name](url): Description of feature and business value.
3. [Feature Name](url): Description of feature and business value.
4. [Feature Name](url): Description of feature and business value.
5. [Feature Name](url): Description of feature and business value.
6. [Feature Name](url): Description of feature and business value.

[Write one closing paragraph with call-to-action and professional sign-off.]

---

**MANDATORY REQUIREMENTS:**
- Your FIRST line MUST be "${greetingExample}" or "Hello${customerNameGreeting || ""},"
- DO NOT include a subject line - start directly with the greeting
- DO NOT use "Dear" - it is forbidden
- Structure: greeting line → introduction paragraph → numbered list (1-8) → closing paragraph
- ALL features in ONE continuous numbered list (1, 2, 3, 4, 5, 6, 7, 8) - do NOT restart numbering
- ONLY use information from RSS feed items provided
- Format links as: [Feature Name](complete-url)
- NEVER use em dashes (—), emojis, or separators (---, ***, etc.) unless the user explicitly requests them
- Use standard punctuation only: commas, periods, colons, hyphens (-), and parentheses

**Context:** ${emailContext}
${
  userCustomText
    ? `\n**User's Custom Text:** ${userCustomText}\n\nIncorporate this naturally into the email.`
    : ""
}

**SOURCE OF TRUTH:** RSS feed items are the primary source. Only use information explicitly stated in them.

Generate the email now, starting with "${greetingExample}":`;
}

/**
 * Default context to use when user doesn't provide instructions
 */
export const DEFAULT_EMAIL_CONTEXT =
  "This email is for a customer. Focus on business value and practical benefits.";

