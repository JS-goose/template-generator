# Cloudinary RSS Mailer

## Description

A web application designed to simplify the creation of HTML emails and templates for customer communication. This tool allows Cloudinary CSMs and AMs to generate structured email content using Cloudinary's **release notes** and **feature updates** fetched from RSS feeds. It integrates **Programmable Media**, **Digital Asset Management (DAM)**, and **Integrations** feeds, parsing them dynamically and formatting them into a ready-to-use email template.

The application features an intuitive email modal interface with GPT-powered email generation, allowing users to create personalized customer emails with context-aware content. Users can customize email content, include RSS feed items as reference, and leverage AI to generate professional business emails that can be directly copied to Gmail.

## Getting Started

### Dependencies to Run Locally

- Node.js (v18 or later)
- npm (v8 or later)
- Vue CLI
- Wrangler CLI (for Cloudflare Workers development)
- Vercel CLI (optional, for local Vercel development)

### Built With

- Vue 3
- Node.js
- Express
- Cloudflare Workers (Hono)
- OpenAI API (GPT)
- axios
- xml2js
- node-cache
- Webpack
- Babel
- Vercel

### Installing

1. Clone the repository:

   ```bash
   git clone https://github.com/jsexton-cloudinary/template-generator.git
   cd template-generator
   ```

2. Install root dependencies:

   ```bash
   npm install
   ```

3. Install local API server dependencies:

   ```bash
   cd local-api-server
   npm install
   cd ..
   ```

4. Install GPT proxy worker dependencies:

   ```bash
   cd gpt-proxy-worker
   npm install
   cd ..
   ```

5. Set up environment variables:
   - Create a `.env` file in the `local-api-server` directory with:
     ```
     LLM_API_KEY=your_openai_api_key_here
     ```
   - Configure Cloudflare Workers environment variables as needed (see `gpt-proxy-worker/wrangler.jsonc`)

### Running Locally

This project requires **three separate processes** to run simultaneously for full functionality:

#### Terminal 1: Vue Development Server (Root Directory)

```bash
npm run serve
```

This starts the Vue.js frontend application at `http://localhost:8080`

#### Terminal 2: Local API Server (local-api-server directory)

```bash
cd local-api-server
node server.cjs
```

This starts the Express API server at `http://localhost:3001` which proxies GPT API requests (required for local development as Vercel environment variables aren't available locally)

#### Terminal 3: GPT Proxy Worker (gpt-proxy-worker directory)

```bash
cd gpt-proxy-worker
wrangler dev
```

This starts the Cloudflare Worker development server for GPT email generation endpoints

### Quick Start Summary

Open three terminal windows and run:

**Terminal 1 (Root):**

```bash
npm run serve
```

**Terminal 2 (local-api-server):**

```bash
cd local-api-server && node server.cjs
```

**Terminal 3 (gpt-proxy-worker):**

```bash
cd gpt-proxy-worker && wrangler dev
```

Then open your browser to `http://localhost:8080`

## Features

### Email Generation

- **GPT-Powered Email Creation**: Generate professional business emails using OpenAI's GPT models
- **RSS Feed Integration**: Automatically pull and format Cloudinary release notes and feature updates from RSS feeds
- **Custom Email Editing**: Rich text and plain text editing modes with link customization
- **Email Regeneration**: Regenerate GPT responses without reloading the page
- **Generation Cancellation**: Cancel ongoing email generation processes

### Email Modal Interface

- **Unified Configuration**: Single text area for customer name, email context, and custom instructions
- **Responsive Design**: Modal adapts to screen size with min/max constraints
- **RSS Feed Reference**: Collapsible section displaying RSS items for context during email generation
- **Streamlined Instructions**: Clear, icon-based guidelines for using the email editor
- **Link Editing**: Double-click links to edit both text and URL

### RSS Feed Management

- **Multi-Feed Support**: Integrates Programmable Media, DAM, and Integrations feeds
- **Caching**: Efficient caching mechanism for RSS data to improve performance
- **Dynamic Parsing**: Automatically formats RSS content for email inclusion

## Help

If you encounter any issues, please check the Issues section on GitHub. You can also reach out via email or submit a pull request if you have improvements to suggest.

### Troubleshooting

**Issue: GPT email generation not working**

- Ensure all three servers are running (Vue dev server, local API server, and Cloudflare Worker)
- Verify your `LLM_API_KEY` is set in `local-api-server/.env`
- Check that the local API server is running on port 3001

**Issue: RSS feeds not loading**

- Verify your internet connection
- Check browser console for CORS or network errors
- Ensure the Vue dev server is running

**Issue: Enrich functionality returns 404 or never loads feature text**
- Ensure the local API server is running (`cd local-api-server && node server.cjs`) so `/api/rss` and `/api/enrich-rss-data` are proxied from the Vue dev server to port 3001
- After pulling updates, restart that process so it picks up new routes

**Issue: Modal content cut off or not responsive**

- Clear browser cache and refresh
- Check browser console for CSS errors
- Verify you're using a modern browser (Chrome, Firefox, Safari, Edge)

You can also try these commands in the terminal:

```
npm help
git help
vue --help
wrangler --help
```

## Authors

Contributors names and contact info

- Personal Github account [Jonathan Sexton](https://github.com/JS-goose)
- Professional Github account: [Jonathan Sexton](https://github.com/jsexton-cloudinary)
  - Lead Developer

## Version History

- 0.3
  - GPT-powered email generation
    - Unified prompt configuration (customer name, email context, instructions in single text area)
    - Email regeneration functionality
    - Generation cancellation with cancel button
    - Improved email formatting (proper list structure, link formatting, line break fixes)
    - RSS feed items displayed in collapsible section within configuration area
    - Custom text from editor included in GPT prompts
    - Enhanced GPT instructions (no subject lines, no placeholders, proper greetings)
  - UI/UX improvements
    - Responsive modal with min/max height and width constraints
    - Streamlined instructions with icon-based design
    - Rounded corners on all modal sides
    - Improved button styling and visibility logic
    - Better text formatting and link handling
- 0.2
  - Various bug fixes and optimizations
    - moved email template generation to it's own component
    - caching mechanism added for RSS data
    - styling changes to various aspects of project
    - Cloudinary brand styling added
- 0.1
  - Pre-alpha - Initial Release
    - Added RSS feed pull mechanisms from Cloudinary documentation

## License

This project is licensed under the [NAME HERE] License - see the LICENSE.md file for details

## Acknowledgments

Inspiration, code snippets, etc.

- [@DomPizzie](https://gist.github.com/DomPizzie/7a5ff55ffa9081f2de27c315f5018afc) - _thank you for the great README template!_
- Cloudinary CSM team - _Project Concept and Feedback_
