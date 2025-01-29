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
          >Project Documentation</a
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
  }

  a:hover {
    color: white;
  }

  a:visited {
    color: inherit;
  }

  nav > ul {
    display: flex;
    list-style: none;
  }

  ul > li {
    padding: 1em;
  }
</style>
