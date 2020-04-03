<!-- 
Child of EditDefinition, edit definition form
-->

<template>
  <div class="editor-function-container">
    <div class="editor-function-body-container">
      <b-form>
        <b-form-group
          id="edit-node-name-input-group"
          label="Definition name:"
          label-for="node-name-input"
        >
          <b-form-input
            id="edit-node-name-input"
            v-model="form.nodeName"
            disabled
          ></b-form-input>
        </b-form-group>
        <b-form-group
          id="edit-node-type-input-group"
          label="Definition OAS type:"
          label-for="node-type-input"
        >
          <b-form-input
            id="edit-node-type-input"
            v-model="form.nodeType"
            :options="dataTypes"
            disabled
          ></b-form-input>
        </b-form-group>
        <b-form-group
          id="edit-node-enum-input-group"
          label="Definition enum:"
          label-for="node-enum-input"
        >
          <b-form-input
            id="edit-node-enum-input"
            :value="nodeEnum"
            disabled
          ></b-form-input>
        </b-form-group>
        <b-form-group
          id="edit-node-description-input-group"
          label="Definition description:"
          label-for="node-description-input"
        >
          <b-form-input
            id="edit-node-description-input"
            v-model="form.nodeDescription"
            :disabled="hasSubmitted"
          ></b-form-input>
        </b-form-group>
      </b-form>
    </div>
    <div class="editor-function-footer-container">
      <b-button
        variant="primary"
        @click="submitEdit"
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
    this.form.nodeType = this.$store.state.nodeType;
    this.form.nodeDescription = this.$store.state.nodeDescription;
    this.form.nodeEnum = this.$store.state.nodeEnum;
  },
  data() {
    return {
      form: {
        nodeName: "",
        nodeType: "",
        nodeDescription: "",
        nodeEnum: ""
      },
      hasSubmitted: false
    };
  },
  methods: {
    submitEdit() {
      this.$store.commit({
        type: "editNode",
        nodeName: this.form.nodeName,
        // nodeType: this.form.nodeType,
        nodeDescription: this.form.nodeDescription
      });
      this.hasSubmitted = true;
    },
    goPreviousView() {
      this.$store.state.activeEditingView = "EditDefinitionFormDisabled";
    }
  },
  computed: {
    dataTypes() {
      if (
        miscUtilities.isDefnObj(
          this.$store.state.currentFile.file,
          this.form.nodeName
        )
      ) {
        return ["object"];
      } else {
        return ["string", "number", "integer", "boolean", "array"];
      }
    },
    nodeEnum() {
      if (this.$store.state.isSelected) {
        if (this.$store.state.nodeEnum) {
          return this.$store.state.nodeEnum.join(", ");
        } else {
          return "None";
        }
      }
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
