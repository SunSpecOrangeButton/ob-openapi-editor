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
        <div id="navbar-icons-container">
          <v-icon
            name="cog"
            class="navbar-icons clickable"
            v-b-modal.settings-modal
          />
          <!-- <v-icon
            name="question-circle"
            class="navbar-icons clickable"
            v-b-modal.help-modal
          /> -->
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
</style>
