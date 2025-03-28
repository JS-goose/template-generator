<template>
  <footer>
    <div id="footer-top"></div>
    <div id="footer-bottom">
      <p>
        Built with &hearts; and &#9749; by the Scaled Team & Jonathan Sexton -
        <a
          href="https://github.com/JS-goose"
          rel="noopener noreferrer"
          target="_blank"
          >GitHub</a
        >&nbsp;|
        <a
          href="https://www.linkedin.com/in/jj-goose/"
          rel="noopener noreferrer"
          target="_blank"
          >LinkedIn</a
        >
      </p>
      <p>
        <a
          href="https://cloudinary.com/tou"
          rel="noopener noreferrer"
          target="_blank"
          >Terms of Use</a
        >
      </p>
      <p>
        <a
          href="https://cloudinary.com/privacy"
          rel="noopener noreferrer"
          target="_blank"
          >Privacy Policy</a
        >
      </p>
      <p>
        <a
          href="https://cloudinary.com/product_updates"
          rel="noopener noreferrer"
          target="_blank"
          >Product Updates</a
        >
      </p>
      <p>
        &copy; {{ new Date().getUTCFullYear() }}
        <a
          href="https://cloudinary.com/"
          rel="noopener noreferrer"
          target="_blank"
          >Cloudinary</a
        >. All rights reserved.
      </p>
    </div>
  </footer>
</template>

<script>
  export default {};
</script>

<style lang="css" scoped>
  footer {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 300px;
    margin-top: auto;
    color: var(--cldLightBlue);
    font-size: 1.05em;
  }

  #footer-top {
    margin-top: auto;
    background-color: var(--cldCetaceanBlue);
    height: 100%;
    justify-content: space-evenly;
  }

  #footer-bottom {
    background-color: var(--cldAegeanBlue);
    height: 60%;
    justify-content: space-evenly;
  }

  a {
    color: var(--cldLightBlue);
    text-decoration: none;
  }

  a:hover {
    color: white;
  }

  #footer-top,
  #footer-bottom {
    display: flex;
    width: 100%;
    margin: 0;
  }
</style>
