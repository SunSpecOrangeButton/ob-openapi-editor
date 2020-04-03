<!-- 
Child of EditDefinition, edit definition form disabled
-->

<template>
  <div id="edit-definition-form-disabled-container">
    <b-form>
      <b-form-group
        id="edit-node-name-input-group"
        label="Definition name:"
        label-for="node-name-input"
      >
        <b-form-input
          id="edit-node-name-input"
          v-model="$store.state.nodeName"
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
          v-model="$store.state.nodeType"
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
          v-model="$store.state.nodeDescription"
          disabled
        ></b-form-input>
      </b-form-group>
    </b-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dataTypes: ["string", "number", "integer", "boolean", "array", "object"]
    };
  },
  computed: {
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
#edit-definition-form-disabled-container {
  padding-left: 15px;
  padding-right: 15px;
}
</style>
