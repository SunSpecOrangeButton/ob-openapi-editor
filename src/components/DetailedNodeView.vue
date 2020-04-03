<template>
  <div class="detailed-view-container">
    <span v-if="$store.state.isSelected">
      <b-table
        :fields="fields"
        :items="defnDetails"
        id="detailsTable"
        ref="nodeDetailTable"
      ></b-table>
      <div class="detailed-view-buttons">
        <span v-if="$store.state.inOASTab">
          <b-button
            v-if="$store.state.nodeParent == 'root'"
            variant="primary"
            size="sm"
            @click="showEditNodeView"
            :disabled="!$store.state.defnIsLocal"
            >Edit definition</b-button
          >
          <b-button
            v-else
            variant="primary"
            size="sm"
            v-b-modal.modal-edit-node
            :disabled="!$store.state.defnIsLocal"
            >Edit definition</b-button
          >

          <b-button v-b-modal.modal-delete-node variant="danger" size="sm">
            <span v-if="$store.state.nodeParent == 'root'"> Delete </span>
            <span v-else>Remove </span>
          </b-button>
        </span>
      </div>
    </span>
    <div class="error-container">
      <span v-if="showError">
        <p id="error-msg">
          Can't remove inherited objects, remove inheritance instead
        </p>
      </span>
    </div>

    <b-modal
      id="modal-delete-node"
      :title="deleteWarningTitle"
      ref="delete-modal"
      centered
      no-stacking
      @ok="deleteNode($store.state.isSelected)"
    >
      <span v-html="deleteWarning"></span>
    </b-modal>
    <b-modal
      id="modal-edit-node"
      title="Edit member?"
      ref="edit-modal-warning"
      centered
      no-stacking
      @ok="showEditNodeView()"
    >
      <p>
        This {{ $store.state.nodeType }} is a member and cannot be edited.
        <br />Would you like to edit the definition?
      </p>
    </b-modal>
  </div>
</template>

<script>
export default {
  data() {
    return {
      nodeDetails: null,
      defnName: "",
      showError: false,
      fields: ["Attributes", "Values"],
      refreshFields: true
    };
  },
  methods: {
    deleteNode(nodeName) {
      if (this.$store.state.isSubClassedNode) {
        this.showError = true;
      } else {
        this.$store.commit("clearEditorView");
        this.$store.commit({
          type: "deleteNode",
          nodeName: nodeName,
          currentFile: this.$store.state.currentFile.file,
          parent: this.$store.state.nodeParent,
          nodeType: this.$store.state.nodeType
        });
        this.$store.commit("selectNone");
      }
    },
    showEditNodeView() {
      this.$store.commit("showEditNodeView");
    },
    cancelDetailedView() {
      this.$store.state.showDetailedView = false;
    }
  },
  watch: {
    "$store.state.isSelected"() {
      this.showError = false;
    }
  },
  computed: {
    deleteWarning() {
      if (
        this.$store.state.nodeType == "element" &&
        this.$store.state.nodeParent == "root" &&
        this.$store.state.isSelected != null
      ) {
        return (
          "Are you sure you want to delete the definition: " +
          this.$store.state.isSelected.bold() +
          "?" +
          "\nThis is the " +
          "definition".bold() +
          " element, deleting this will remove every instance of the element in the file"
        );
      } else if (
        this.$store.state.nodeType == "object" &&
        this.$store.state.nodeParent == "root" &&
        this.$store.state.isSelected != null
      ) {
        return (
          "Are you sure you want to delete the definition: " +
          this.$store.state.isSelected.bold() +
          "?" +
          "\nThis is the " +
          "definition".bold() +
          " object, deleting this will remove every instance of the element in the file"
        );
      } else if (this.$store.state.isSelected != null) {
        return (
          "Are you sure you want to delete " +
          this.$store.state.isSelected.bold() +
          "?" +
          "\nThis will remove the " +
          "member ".bold() +
          this.$store.state.nodeType +
          ": " +
          this.$store.state.isSelected.bold() +
          " from the object: " +
          this.$store.state.nodeParent.bold() +
          ", but will not delete the definition."
        );
      }
    },
    deleteWarningTitle() {
      if (this.$store.state.nodeParent == "root") {
        return "Delete " + this.$store.state.nodeType;
      } else {
        return "Remove " + this.$store.state.nodeType;
      }
    },
    defnDetails() {
      let temp_defn_name = this.defnName;
      let temp_doc = this.$store.state.nodeDescription;
      let temp_superClassList = [];
      let temp_superClassListStr = "";
      let temp_ret_obj = null;
      let temp_enum = this.$store.state.nodeEnum;
      let arrayItemName = null;
      let defnOBType = this.$store.state.nodeOBType;
      let defnOBUnit = this.$store.state.nodeOBUnit;
      let defnOBEnum = this.$store.state.nodeOBEnum;

      this.refreshFields = !this.refreshFields;

      if (!temp_doc) {
        temp_doc = "Documentation not available";
      }

      if (!defnOBType) {
        defnOBType = "None";
      }

      if (!defnOBUnit) {
        defnOBUnit = "None";
      }

      if (!defnOBEnum) {
        defnOBEnum = "None";
      }

      if (!temp_enum) {
        temp_enum = "None";
      } else {
        temp_enum = temp_enum.join(", ");
      }
      let defnDoc = this.$store.state.selectedDefnRefFile;

      if (defnDoc[this.$store.state.isSelected]["allOf"]) {
        for (let i in defnDoc[this.$store.state.isSelected]["allOf"]) {
          if (defnDoc[this.$store.state.isSelected]["allOf"][i]["$ref"]) {
            temp_superClassList.push(
              defnDoc[this.$store.state.isSelected]["allOf"][i]["$ref"].slice(
                defnDoc[this.$store.state.isSelected]["allOf"][i][
                  "$ref"
                ].lastIndexOf("/") + 1
              )
            );
          }
        }
      }
      if (temp_superClassList.length == 0) {
        temp_superClassListStr = "None";
      } else {
        temp_superClassListStr = temp_superClassList.join(", ");
      }

      if (
        (defnDoc[this.$store.state.isSelected]["type"] == "object" ||
          defnDoc[this.$store.state.isSelected]["allOf"]) &&
        !this.$store.state.isTaxonomyElement
      ) {
        temp_ret_obj = [
          { Attributes: "Name", Values: this.$store.state.nodeName },
          { Attributes: "Type", Values: this.$store.state.nodeType },
          { Attributes: "Documentation", Values: temp_doc },
          { Attributes: "Superclasses", Values: temp_superClassListStr }
        ];
      } else if (this.$store.state.isTaxonomyElement) {
        temp_ret_obj = [
          { Attributes: "Name", Values: this.$store.state.nodeName },
          { Attributes: "Type", Values: this.$store.state.nodeType },
          { Attributes: "Documentation", Values: temp_doc },
          { Attributes: "Enumeration", Values: temp_enum },
          { Attributes: "OB Item Type", Values: defnOBType },
          { Attributes: "OB Unit", Values: defnOBUnit },
          { Attributes: "OB Enumeration", Values: defnOBEnum },
          { Attributes: "Superclasses", Values: temp_superClassListStr }
        ];
      } else if (defnDoc[this.$store.state.isSelected]["type"] == "array") {
        arrayItemName = defnDoc[this.$store.state.isSelected]["items"][
          "$ref"
        ].slice(
          defnDoc[this.$store.state.isSelected]["items"]["$ref"].lastIndexOf(
            "/"
          ) + 1
        );

        temp_ret_obj = [
          { Attributes: "Name", Values: this.$store.state.nodeName },
          { Attributes: "Type", Values: this.$store.state.nodeType },
          { Attributes: "Array Item", Values: arrayItemName }
        ];
      } else {
        temp_ret_obj = [
          { Attributes: "Name", Values: this.$store.state.nodeName },
          { Attributes: "Type", Values: this.$store.state.nodeType },
          { Attributes: "Documentation", Values: temp_doc }
        ];
      }

      let arr = temp_ret_obj;

      return arr;
    }
  }
};
</script>

<style>
#detailsTable {
  background-color: white;
}

.detailed-view-buttons {
  height: 50px;
  background-color: white;
  margin-top: -16px;
  border-top: 1px solid #dee2e6;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

#error-msg {
  color: red;
  font-weight: bold;
}

.table.b-table.b-table-stacked > tbody > tr > [data-label]::before {
  float: none !important;
}

.detailed-view-container {
  padding-left: 15px;
  padding-right: 15px;
}
</style>
