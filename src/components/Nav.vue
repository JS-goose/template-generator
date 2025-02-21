<template>
  <nav>
    <a href="https://cloudinary.com" target="_blank">
      <img
        src="../assets//images/cloudinary_full_logo_white_small.png"
        alt="Cloudinary"
      />
    </a>
    <h1>RSS Feed to Email Template Generator</h1>
    <ul>
      <li>
        <a
          href="http://cloudinary.com/documentation"
          target="_blank"
          rel="noreferrer noopener"
          >Cloudinary Documentation</a
        >
      </li>
      <li>
        <a
          href="https://github.com/JS-goose/template-generator"
          target="_blank"
          rel="noreferrer noopener"
          >Template Builder Documentation</a
        >
      </li>
      <li>
        <a
          href="https://cloudinary.com/documentation/programmable_media_release_notes"
          target="_blank"
          rel="noreferrer noopener"
          >PM Release Notes</a
        >
      </li>
      <li>
        <a
          href="https://cloudinary.com/documentation/digital_asset_management_release_notes"
          target="_blank"
          rel="noreferrer noopener"
          >DAM Release Notes</a
        >
      </li>
      <li>
        <a
          href="https://cloudinary.com/documentation/integrations_release_notes"
          target="_blank"
          rel="noreferrer noopener"
          >INT Release Notes</a
        >
      </li>
    </ul>
  </nav>
</template>
<script>
  export default {
    data() {
      return {};
    },
  };
</script>
<style lang="css" scoped>
  img {
    width: 160px;
  }

  nav {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    border-bottom: 1px solid var(--cldSlate);
    color: white;
    background-color: var(--cldAegeanBlue);
    margin: 0;
    padding: 1em;
  }

  a {
    text-decoration: none;
    color: white;
    font-weight: 600;
    font-size: 1em;
  }

  a:hover {
    color: var(--cldLightBlue);
  }

  a:visited {
    color: white;
  }

  nav > ul {
    display: flex;
    list-style: none;
  }

  ul > li {
    padding: 1em;
  }
</style>
