<template>
  <nav>
    <img src="../assets//images/cloudinary_full_logo_white_small.png" alt="">
    <h1>RSS Feed to Email Template Generator</h1>
    <ul>
      <li>Link 1</li>
      <li>Link 2</li>
      <li>Link 3</li>
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
nav {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  border-bottom: 1px solid var(--cldSlate);
  color: white;
  background-color: var(--cldAegeanBlue);
  width: 100%;
  margin: 0;
  padding: 1em
}

nav > ul {
  display: flex;
  list-style: none;
}
</style>
