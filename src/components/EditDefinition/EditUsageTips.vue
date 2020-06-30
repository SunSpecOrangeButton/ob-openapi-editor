<!-- 
Component for adding/removing usage tips to definitions
-->

<template>
  <div class="editor-function-container">
    <div class="editor-function-body-container">
      <p>Edit Usage Tips:</p>
      <b-form-textarea
        id="textarea"
        v-model="usageTips"
        rows="3"
        max-rows="6"
        :disabled="hasSubmitted"
      ></b-form-textarea>
    </div>
    <div class="editor-function-footer-container">
      <b-button variant="primary" @click="submitEdit" :disabled="hasSubmitted" size="sm">
        <span v-if="!hasSubmitted">Submit Edit</span>
        <span v-else>Edit Submitted!</span>
      </b-button>
      <b-button @click="goPreviousView" size="sm">Back</b-button>
    </div>
  </div>
</template>

<script>
export default {
  created() {
    this.usageTips = this.$store.state.nodeOBUsageTips;
  },
  data() {
    return {
      selectedIndex: null,
      usageTips: "",
      hasSubmitted: false
    };
  },
  methods: {
    submitEdit() {
      this.$store.commit("addUsageTips", this.usageTips);
      this.hasSubmitted = true;
    },
    goPreviousView() {
      this.$store.state.activeEditingView = "EditDefinitionFormDisabled";
    }
  },
  computed: {}
};
</script>

<style>
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
</style>
