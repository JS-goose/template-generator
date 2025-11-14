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

  return `Generate a compelling customer email based on the provided Cloudinary release notes and any additional context provided by the user.

**CRITICAL - SOURCE OF TRUTH:** The RSS feed items provided below are the primary source of information. You MUST:
- ONLY use information that is explicitly stated in the RSS feed items
- DO NOT guess, assume, or make up any details, features, or benefits
- DO NOT add information that is not directly present in the RSS feed items unless it is explicitly stated in the user's custom text.
- If information is not in the RSS feed items, do not include it in the email
- Use exact details from the RSS feed items (titles, descriptions, URLs, etc.)

**Context:** ${emailContext}
${
  userCustomText
    ? `\n**User's Custom Text:** ${userCustomText}\n\nPlease incorporate this custom text naturally into the email, maintaining the user's personal touch and specific references.`
    : ""
}

**CRITICAL REQUIREMENTS - MUST FOLLOW:**
- NEVER use "Dear" in greetings - it is too formal for business emails. ALWAYS use "Hi" or "Hello"${customerNameGreeting}
- Maximum 8 feature highlights (prioritize most impactful)
- Links formatted as: [Specific Benefit Description](complete-url)
- Professional but approachable tone
- Use quantifiable benefits where available (ONLY if explicitly stated in RSS feed items)
- Do NOT include a subject line - the user will add their own
- Do NOT include [Your Name] or [Your Position] placeholders - the user will add their signature in Gmail
- Format numbered lists as "1. Content" (no line breaks between number and content)
- Each list item should be a single, continuous paragraph without internal line breaks
- ONLY reference features and information that are explicitly in the RSS feed items provided
- Incorporate the user's custom text naturally into the email

**EMAIL STRUCTURE - FOLLOW EXACTLY (3 parts only):**
1. Introduction paragraph: Start with "Hi" or "Hello"${customerNameGreeting} - NEVER use "Dear". Include a brief greeting, context about why you're reaching out, and introduce the update/release. This should be ONE cohesive paragraph.
2. Ordered list (numbered 1, 2, 3, etc.): 6 to 8 numbered feature highlights with business impact (ONLY from RSS feed items unless explicitly stated in the user's custom text). Each item should be formatted as "1. [Feature Name with Link]: Description of the feature and its business value."
3. Closing paragraph: Appropriate call-to-action and professional close. This should be ONE cohesive paragraph.

**FORMATTING REQUIREMENTS:**
- Use numbered lists (1., 2., 3., etc.) NOT bullet points for the feature list
- Each numbered list item should start with a link to the feature, followed by a colon, then the description
- Format: "1. [Feature Name](url): Description of feature and business value."
- Keep paragraphs concise and focused
- Maintain professional but approachable tone throughout

Generate the email following this exact structure:`;
}

/**
 * Default context to use when user doesn't provide instructions
 */
export const DEFAULT_EMAIL_CONTEXT =
  "This email is for a customer. Focus on business value and practical benefits.";

