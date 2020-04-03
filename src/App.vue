<template>
  <div id="app">
    <Navbar />
    <router-view class="router-view-cls" />
  </div>
</template>

<script>
import Navbar from "./components/Navbar";

export default {
  components: {
    Navbar
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: calc(100vh - 57.6px);
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

body {
  margin: 0px;
}

.router-view-cls {
  margin-right: 250px;
  margin-left: 100px;
}
</style>
