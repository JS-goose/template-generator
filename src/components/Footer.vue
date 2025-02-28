<template>
  <footer>
    <div id="footer-top"></div>
    <div id="footer-bottom">
      <p>
        Built with &hearts; and &#9749; by Jonathan Sexton -
        <a href="https://github.com/JS-goose" rel="noopener noreferrer"
          >GitHub</a
        >&nbsp;|
        <a href="https://www.linkedin.com/in/jj-goose/">LinkedIn</a>
      </p>
      <p><a href="https://cloudinary.com/tou">Terms of Use</a></p>
      <p><a href="https://cloudinary.com/privacy">Privacy Policy</a></p>
      <p>
        &copy; {{ new Date().getFullYear() }} Cloudinary. All rights reserved.
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

  a:visited {
    color: var(--cldLightBlue);
  }

  #footer-top,
  #footer-bottom {
    display: flex;
    width: 100%;
    margin: 0;
  }
</style>
