<template>
  <div id="navbar-container">
    <b-navbar id="navbar" toggleable="lg">
      <b-navbar-brand>
        <img
          id="navbar-logo"
          src="@/assets/images/Orange-button-logo-flat-rgb.png"
        />
        Orange Button OpenAPI Editor
      </b-navbar-brand>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <span class='nav-viewer-mode' v-if="$store.state.viewerMode == 'View Mode'" @click="changeViewerMode('Edit Mode')">
            <v-icon
              name="edit"
              class="nav-viewer-icon"
              style="cursor: pointer"
            />        </span>
        <span class='nav-viewer-mode' v-else-if="$store.state.viewerMode == 'Edit Mode'" @click="changeViewerMode('View Mode')">
            <v-icon
              name="regular/eye"
              class="nav-viewer-icon"
              style="cursor: pointer"
            />
        </span>
        <div id="navbar-icons-container">
          <v-icon
            name="cog"
            class="navbar-icons clickable"
            v-b-modal.settings-modal
          />
        </div>
      </b-navbar-nav>
    </b-navbar>
    <b-modal id="settings-modal">
      <template v-slot:modal-title>
        Settings
      </template>
      <template v-slot:default>
        <h5>Dependencies Loaded:</h5>
        <p>
          <u>Master Solar Taxonomy:</u> <br />
          <i>Master-Solar-Taxonomy-040120.json</i>
        </p>
        <p>
          <u>Master Orange Button OpenAPI Definition File:</u> <br />
          <i>Master-OB-OpenAPI-030420.json</i>
        </p>
      </template>
    </b-modal>
    <!-- <b-modal id="help-modal">This will have basic help information</b-modal> -->
  </div>
</template>

<script>
export default {
  methods: {
    changeViewerMode(mode) {
      this.$store.commit('clearEditorView')
      this.$store.commit('changeViewerMode', mode)
      this.$store.commit('reRenderList')
    }
  }
}
</script>

<style scoped>
.navbar {
  background-color: white;
  border: #d3d3d3 solid 1px;
  height: 57px;
  max-height: 57px;
}

#navbar-logo {
  height: 40px;
  width: 40px;
}

.navbar-text {
}

.navbar-icons {
  height: 35px;
  width: 35px;
}

#navbar-icons-container {
  width: 80px;
  display: flex;
  justify-content: space-between;
}

.nav-viewer-mode {
  padding-right:15px;
}

.nav-viewer-icon {
  height: 35px;
  width: 35px;
}

.nav-viewer-mode:hover {
  text-decoration: underline;
  cursor: pointer;
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
}
</style>
