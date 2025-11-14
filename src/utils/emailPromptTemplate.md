# Email Generation Prompt Documentation

> **Note:** The actual prompt implementation lives in `emailPromptTemplate.js` (same directory). This document serves as human-readable documentation and reference. For the authoritative source, see the JavaScript module.

## Overview

The email generation process has been streamlined to require minimal user input. The system uses sensible defaults and only requires optional instructions when needed.

## User Interface

Users can optionally provide:

- **Customer Name**: e.g., "Customer Name: John Smith"
- **Additional Instructions**: Any specific instructions, tone preferences, or context for the email generation

**Example optional instructions:**

- "Focus on video features and emphasize performance improvements"
- "Make it more technical and include implementation details"
- "Keep it brief and highlight only the top 3 features"
- "This is for a customer at Custom Ink who is a Salesforce developer interested in AI"

## Email Generation Guidelines

### Key Requirements

The system enforces the following requirements when generating emails:

- **Maximum 8 feature highlights** (prioritizes most impactful)
- **Links formatted as:** `[Specific Benefit Description](complete-url)`
- **Professional but approachable tone**
- **Use quantifiable benefits** where available (ONLY if explicitly stated in RSS feed items)
- **NEVER use "Dear"** - Always use "Hi" or "Hello" for greetings
- **Do NOT include a subject line** - The user will add their own
- **Do NOT include placeholders** like [Your Name] or [Your Position] - The user will add their signature in Gmail
- **Use numbered lists (1., 2., 3., etc.)** NOT bullet points for the feature list
- **Format numbered lists** as "1. Content" (no line breaks between number and content)
- **Each list item** should be a single, continuous paragraph without internal line breaks

### Email Structure (3 Parts Only)

1. **Introduction paragraph**: Start with "Hi" or "Hello" - NEVER use "Dear". Include a brief greeting, context about why you're reaching out, and introduce the update/release. This should be ONE cohesive paragraph.

2. **Ordered list** (numbered 1, 2, 3, etc.): 6-8 numbered feature highlights with business impact (ONLY from RSS feed items). Each item should be formatted as "1. [Feature Name with Link]: Description of the feature and its business value."

3. **Closing paragraph**: Appropriate call-to-action and professional close. This should be ONE cohesive paragraph.

### Source of Truth

The system enforces that **RSS feed items are the ONLY source of information**. The AI MUST:

- ONLY use information that is explicitly stated in the RSS feed items
- DO NOT guess, assume, or make up any details, features, or benefits
- DO NOT add information that is not directly present in the RSS feed items
- Use exact details from the RSS feed items (titles, descriptions, URLs, etc.)

## Enhanced Email Structure Template:

Here's an improved version that addresses the formatting and content issues:

---

**Subject: New Cloudinary Features That Could Transform Your Workflow**

Dear [Customer's Name],

I wanted to personally reach out about some game-changing features we've just released that could significantly streamline your development workflow and reduce manual coding.

Here are the most impactful updates for teams like yours:

• **[AI-Powered No-Code App Building](https://cloudinary.com/documentation/rn_pm_07_09_2025#base44_cloudinary_integration)** - Build complete Cloudinary-powered applications using natural language prompts through our new Base44 integration, eliminating the need for traditional coding.

• **[Natural Language Workflow Automation](https://cloudinary.com/documentation/rn_pm_07_09_2025#mcp_servers)** - Five new Model Context Protocol servers let you automate complex media workflows using plain English in your favorite IDE (Cursor, VSCode, etc.).

• **[70% Lighter Video Player](https://cloudinary.com/documentation/rn_pm_07_09_2025#new_major_version_of_cloudinary_video_player)** - Version 3.0 delivers the same functionality in just 130KB (down from ~450KB) with tree-shaking and lazy-loading for faster page loads.

• **[Preserve Image Transparency](https://cloudinary.com/documentation/rn_pm_07_09_2025#preserve_transparency_with_the_extract_effect)** - New preserve-alpha option maintains transparency when using extract effects, perfect for complex image compositions.

• **[Real-Time Video Analytics](https://cloudinary.com/documentation/rn_pm_07_09_2025#live_streams_engagement_metrics)** - Track viewer counts, average watch time, and concurrent viewers for your live streams directly in the dashboard.

• **[Enhanced Security & Access Control](https://cloudinary.com/documentation/rn_pm_07_09_2025#new_root_api_keys_and_users)** - New root API key system and granular user environment assignments provide better security and team management.

• **[Dark Mode Console](https://cloudinary.com/documentation/rn_pm_07_09_2025#theme_dark_mode_light_mode_selector)** - Choose your preferred theme for a more comfortable development experience.

• **[Accessible Media Implementation Guide](https://cloudinary.com/documentation/rn_pm_07_09_2025#new_accessible_media_guide)** - Comprehensive guide with WCAG-compliant best practices for inclusive digital experiences.

Given that these features could significantly impact your current implementation, I'd love to schedule a brief call to walk through the ones most relevant to your use case. We could also discuss how the new automation features might reduce your development overhead.

Would you be available for a 20-minute demo this week or next?

---

## Key Improvements:

1. **Simplified Input**: Removed the need for structured fields (Customer Name, Email Context, Additional Instructions). Users now only need to optionally provide instructions.

2. **Sensible Defaults**: The system automatically uses appropriate defaults:

   - Generic greeting (no customer name required)
   - Standard business context focused on value and benefits
   - Professional but approachable tone

3. **Streamlined Workflow**: Users can generate emails with zero configuration, or add optional instructions for customization.

## Example Email Output:

