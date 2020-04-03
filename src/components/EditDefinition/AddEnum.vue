<!-- 
Component for adding enumeration to definitions
-->

<template>
  <div class="editor-function-container">
    <div class="editor-function-body-container">
      <p>Enumerations:</p>
      <div class="enum-list">
        <li
          v-for="(_enum, index) in sortedEnumList"
          @click="enumSelect(index)"
          class="enum-in-enum-list"
          :class="{ 'selected-node': index == selectedIndex }"
        >
          {{ _enum }}
        </li>
      </div>
      <span id="input-enumeration-title">
        Input enumeration name:
      </span>
      <span id="enumeration-input-container">
        <input v-model="enumToAdd" id="enum-input" />
        <b-button
          variant="primary"
          @click="submitAddEnum"
          size="sm"
          id="enum-add-btn"
        >
          Add
        </b-button>
      </span>
    </div>
    <div class="editor-function-footer-container">
      <b-button @click="goPreviousView" size="sm">Back</b-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedIndex: null,
      enumToAdd: ""
    };
  },
  methods: {
    enumSelect(index) {
      this.selectedIndex = index;
    },
    submitAddEnum() {
      this.$store.commit("addEnumToObject", this.enumToAdd);
      this.enumToAdd = "";
    },
    goPreviousView() {
      this.$store.state.activeEditingView = "EditDefinitionFormDisabled";
    }
  },
  computed: {
    sortedEnumList() {
      let tmp_enum_str = [];
      if (this.$store.state.nodeEnum == "None") {
        return [];
      } else {
        return this.$store.state.nodeEnum;
      }
    }
  }
};
</script>

<style>
.enum-in-enum-list {
  list-style: none;
  border-bottom: 1px solid black;
  padding-left: 5px;
}

.enum-list {
  height: 250px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid black;
  margin-bottom: 4px;
}

.selected-node {
  background-color: #89cff0;
}

#enumeration-input-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.editor-function-container {
  display: grid;
  height: 100%;
  grid-template-rows: 1fr 50px;
}

.editor-function-body-container {
  padding-top: 9px;
  overflow-y: auto;
  grid-row: 1 / 2;
  padding-left: 15px;
  padding-right: 15px;
}

.editor-function-footer-container {
  grid-row: 2 / 3;
  display: flex;
  justify-content: center;
  align-items: center;
  border: #d3d3d3 solid 1px;
}

#enum-input {
  display: inline-block;
}

#enum-add-btn {
  display: inline-block;
}

#input-enumeration-title {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
</style>
