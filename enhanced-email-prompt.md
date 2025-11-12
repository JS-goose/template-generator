# Enhanced Email Generation Prompt

## Simplified Email Generation

The email generation process has been streamlined to require minimal user input. The system uses sensible defaults and only requires optional instructions when needed.

### User Interface

Users can optionally provide:

- **Additional Instructions**: Any specific instructions, tone preferences, or context for the email generation

**Example optional instructions:**

- "Focus on video features and emphasize performance improvements"
- "Make it more technical and include implementation details"
- "Keep it brief and highlight only the top 3 features"

### Core Prompt Structure:

The system automatically generates emails using this structure:

```
Generate a compelling customer email based on the provided Cloudinary release notes.

**Context:** This email is for a customer. Focus on business value and practical benefits.

**Requirements:**
- Maximum 8 feature highlights (prioritize impact)
- Links formatted as: [Specific Benefit Description](complete-url)
- Professional but approachable tone
- Use quantifiable benefits where available
- Use "Hi" or "Hello" for greetings (avoid "Dear" as it's too formal for business emails)
- Do include a subject line unless the user provides their own and then use that one
- Do NOT include [Your Name] or [Your Position] placeholders - the user will add their signature in Gmail
- Use proper bullet points (•) for lists, not dashes (-)
- Format numbered lists as "1. Content" (no line breaks between number and content)
- Each list item should be a single, continuous paragraph without internal line breaks
- Focus on the content provided, do not reference RSS feed items unless specifically included

**Structure:**
1. Personal greeting (use "Hi" or "Hello" - never use "Dear" as it's too formal for business emails)
2. Brief introduction about the update
3. 6-8 bulleted features with business impact
4. Appropriate call-to-action
5. Professional close
```

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
