<!-- 
Child of EditDefinition, edit definition form
-->

<template>
  <div class="editor-function-container">
    <div class="editor-function-body-container">
      <b-form>
        <b-form-group
          id="edit-node-name-input-group"
          label="Current definition name:"
          label-for="node-name-input"
        >
          <b-form-input
            id="edit-node-name-input"
            v-model="form.nodeName"
            disabled
          ></b-form-input>
        </b-form-group>
        <b-form-group
          id="edit-node-new-name-input-group"
          label="New definition name:"
          label-for="node-new-name-input"
        >
          <b-form-input
            id="node-new-name-input"
            v-model="form.newNodeName"
            :disabled="hasSubmitted"
          ></b-form-input>
        </b-form-group>
      </b-form>
    </div>
    <div class="editor-function-footer-container">
      <b-button
        variant="primary"
        @click="submitChangeName"
        :disabled="hasSubmitted"
        size="sm"
      >
        <span v-if="!hasSubmitted">Submit</span>
        <span v-else>Submitted!</span>
      </b-button>
      <b-button @click="goPreviousView" size="sm">Back</b-button>
    </div>
  </div>
</template>

<script>
import * as miscUtilities from "../../utils/miscUtilities.js";

export default {
  created() {
    this.form.nodeName = this.$store.state.nodeName;
  },
  data() {
    return {
      form: {
        nodeName: "",
        newNodeName: ""
      },
      hasSubmitted: false
    };
  },
  methods: {
    submitChangeName() {
      this.$store.commit({
        type: "changeName",
        nodeName: this.form.nodeName,
        newNodeName: this.form.newNodeName
      });
      this.hasSubmitted = true;
    },
    goPreviousView() {
      this.$store.state.activeEditingView = "EditDefinitionFormDisabled";
    }
  }
};
</script>

<style>
.submit-button-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.edit-definition-form {
  padding-left: 15px;
  padding-right: 15px;
}
</style>
