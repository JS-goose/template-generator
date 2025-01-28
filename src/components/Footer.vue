<template>
  <footer>
    <div id="footer-top">
      <p>footer top</p>
      <p>footer logo here</p>
    </div>
    <div id="footer-bottom">
      <p>
        Built with &hearts; and &#9749; by Jonathan Sexton -
        <a href="https://github.com/JS-goose" rel="noopener noreferrer"
          >GitHub</a
        >&nbsp;|
        <a href="https://www.linkedin.com/in/jj-goose/">LinkedIn</a>
      </p>
      <p>
        right justified footer bottom with TOS, Privacy Policy and Copyright
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

  #footer-top,
  #footer-bottom {
    display: flex;
    width: 100%;
    margin: 0;
    color: white;
  }
</style>
