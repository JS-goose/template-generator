# Enhanced Email Generation Prompt

## Core Prompt Structure:

```
Generate a compelling, customer-focused email announcement based on the provided Cloudinary release notes.

**Requirements:**
- Maximum 8-10 feature highlights (prioritize most impactful)
- Collaborative, consultative tone for unresponsive customers
- Focus on business value and practical benefits
- Use specific details from the release notes, not generic descriptions
- Format links as: [Feature Name](URL) - compatible with Gmail and copy-paste
- Include clear call-to-action for live demo/walkthrough
- Keep each bullet point to 1-2 sentences maximum

**Structure:**
1. Engaging subject line
2. Personal greeting with context
3. Brief intro highlighting release theme
4. Bulleted feature list with business impact
5. Collaborative closing with demo offer
6. Professional signature

**Tone Guidelines:**
- Consultative, not salesy
- Focus on "how this helps you" rather than "what we built"
- Use action-oriented language
- Show understanding of customer needs
- Maintain professional enthusiasm

**Link Formatting:**
- Use descriptive link text (not "Learn more")
- Ensure URLs are complete and clickable
- Format: [Specific Feature Benefit](full-url)

Based on these requirements, generate the email:
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

## Technical Implementation Improvements:

<function_calls>
<invoke name="read_file">
<parameter name="target_file">template-generator/api/gpt-email.js
