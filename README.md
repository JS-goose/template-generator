# Cloudinary RSS Mailer

## Description

A web application designed to simplify the creation of HTML emails and templates for customer communication. This tool allows Cloudinary CSMs and AMs to generate structured email content using Cloudinary's **release notes** and **feature updates** fetched from RSS feeds. It integrates **Programmable Media**, **Digital Asset Management (DAM)**, and **Integrations** feeds, parsing them dynamically and formatting them into a ready-to-use email template.
An in-depth paragraph about your project and overview of use.

## Getting Started

### Dependencies to Run Locally

- Node.js (v18 or later)
- npm (v8 or later)
- Vue CLI

### Built With

- Vue 3
- Node.js
- Express
- axios
- xml2js
- node-cache
- Webpack
- Babel
- Vercel

### Installing

- `npm install`

### Executing program

How to run the program locally on your own machine.

- First, clone the project using this command in your terminal:

  - `git clone https://github.com/jsexton-cloudinary/template-generator.git`
  - Once cloned, run this command in your terminal to change locations: `cd cloudinary-template-generator.git`

- Then, run `npm install` in your terminal to install all project dependencies.
- Next, run this command in your terminal (this will compile for hot-reload development): `npm run serve`
- Finally, open your browser of choice and load the page located at: `http://localhost:8080`

## Help

If you encounter any issues, please check the Issues section on GitHub. You can also reach out via email or submit a pull request if you have improvements to suggest.

You can also try these one or all of these commands in the terminal:

```
npm help
git help
vue --help
```

## Authors

Contributors names and contact info

- Personal Github account [Jonathan Sexton](https://github.com/JS-goose)
- Professional Github account: [Jonathan Sexton](https://github.com/jsexton-cloudinary)
  - Lead Developer

## Version History

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
