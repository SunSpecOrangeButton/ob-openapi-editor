<!-- 
Component for adding inheritance to objects
-->

<template>
  <div class="editor-function-container">
    <div class="editor-function-body-container">
      <div>Select document:</div>
      <b-form-select
        v-model="selectedFileName"
        :options="getLoadedFiles"
        :select-size="4"
        id="select-form-files"
      ></b-form-select>
      <br />
      <b-form-group
        id="node-selector-input-label"
        label="Choose definition to add to object:"
        label-for="node-selector-input"
      >
        <b-form-input
          v-model="searchTerm"
          placeholder="Search for definition..."
        ></b-form-input>
      </b-form-group>
      <div>Select definition to add:</div>
      <div class="file-elements-list">
        <span v-if="selectedFileName">
          <li
            v-for="(name, index) in fileElements"
            id="defn-from-file"
            @click="selectDefn(index, name)"
            :class="{ 'selected-node': index == selectedDefnIndex }"
          >
            {{ name }}
          </li>
        </span>
      </div>
      <b-table
        :items="defnDetails"
        id="add-member-detail-table"
        ref="add-member-detail-table"
        v-if="selectedSuperClassName"
      ></b-table>
    </div>
    <div class="error-container">
      <span v-if="showErrorInfinite || showErrorConflict">
        <p id="error-msg" v-if="showErrorInfinite">
          Can't add this, will cause infinite loop error. Object or superclass
          contains the one you're trying to add
        </p>
        <p id="error-msg" v-if="showErrorConflict">
          Can't add this, will cause conflict error. Object or superclass is
          being referenced already
        </p>
      </span>
    </div>
    <div class="editor-function-footer-container">
      <b-button
        variant="primary"
        @click="submitAddSuperClass"
        size="sm"
        v-if="!maxInheritance"
      >
        <span v-if="!hasSubmitted">Add</span>
        <span v-else>Add another</span>
      </b-button>
      <span
        v-b-popover.hover.top="
          'Can only inherit from one superclass. Remove superclass if you want to add a different one.'
        "
        v-if="maxInheritance"
      >
        <b-button variant="primary" size="sm" disabled>
          Add
        </b-button>
      </span>
      <b-button @click="goPreviousView" size="sm">Back</b-button>
    </div>
  </div>
</template>

<script>
import * as miscUtilities from "../../utils/miscUtilities";

export default {
  data() {
    return {
      searchTerm: "",
      superClassName: "",
      showErrorInfinite: false,
      showErrorConflict: false,
      hasSubmitted: false,

      selectedFileName: null,
      selectedDefnIndex: null,
      selectedSuperClassName: null,
      selectedDefnType: null,
      selectedDefnDescrip: null
    };
  },
  methods: {
    selectDefn(index, superClassName) {
      this.selectedDefnIndex = index;
      this.selectedSuperClassName = superClassName;
      this.showErrorInfinite = false;
      this.showErrorConflict = false;
    },
    submitAddSuperClass() {
      if (!this.showErrorInfinite && !this.showErrorConflict) {
        this.$store.commit({
          type: "addSuperClass",
          superClassName: this.selectedSuperClassName,
          superClassRefFileName: this.selectedFileName
        });
        this.hasSubmitted = true;
      }
    },
    goPreviousView() {
      this.$store.state.activeEditingView = "EditDefinitionFormDisabled";
    }
  },
  computed: {
    fileElements() {
      if (this.selectedFileName) {
        let fileElements = miscUtilities.getAllObjectsFlat(
          this.$store.state.loadedFiles[this.selectedFileName]["file"]
        );

        return fileElements
          .filter(node => {
            if (
              node.toLowerCase() != this.$store.state.isSelected.toLowerCase()
            ) {
              return node.toLowerCase().includes(this.searchTerm.toLowerCase());
            }
          })
          .sort();
      }
    },
    getLoadedFiles() {
      let optionsArr = [];
      for (let i in this.$store.state.loadedFiles) {
        optionsArr.push({
          value: i,
          text: i
        });
      }
      return optionsArr;
    },
    defnDetails() {
      let temp_ret_obj = null;

      let defnName = this.selectedSuperClassName;
      let defnType = "";
      let defnDescrip = "Documentation not available";
      let defnEnum = "";
      let temp_superClassList = [];
      let temp_superClassListStr = "";
      let defnObjChildren = "";
      let typeOfDefn = null;

      let defnFile = this.$store.state.loadedFiles[this.selectedFileName][
        "file"
      ];

      if (defnFile[defnName]["allOf"]) {
        if (miscUtilities.isTaxonomyElement(defnFile, defnName)) {
          typeOfDefn = "TaxonomyElement";
        } else {
          typeOfDefn = "ObjWithInherit";
        }
        for (let i in defnFile[defnName]["allOf"]) {
          if (defnFile[defnName]["allOf"][i]["$ref"]) {
            temp_superClassList.push(
              defnFile[defnName]["allOf"][i]["$ref"].slice(
                defnFile[defnName]["allOf"][i]["$ref"].lastIndexOf("/") + 1
              )
            );
          } else {
            if (defnFile[defnName]["allOf"][i]["description"]) {
              defnDescrip = defnFile[defnName]["allOf"][i]["description"];
            }
            if (defnFile[defnName]["allOf"][i]["type"]) {
              defnType = defnFile[defnName]["allOf"][i]["type"];
            }
            if (defnFile[defnName]["allOf"][i]["enum"]) {
              defnEnum = defnFile[defnName]["allOf"][i]["enum"];
            }

            if (typeOfDefn == "ObjWithInherit") {
              if (defnFile[defnName]["allOf"][i]["properties"]) {
                defnObjChildren = Object.keys(defnFile[defnName]["properties"]);
              }
            }
          }
        }
      } else if (defnFile[defnName]["properties"]) {
        typeOfDefn = "Obj";
        if (defnFile[defnName]["type"]) {
          defnType = defnFile[defnName]["type"];
        }

        if (defnFile[defnName]["properties"]["description"]) {
          defnDescrip = defnFile[defnName]["properties"]["description"];
        }

        defnObjChildren = Object.keys(defnFile[defnName]["properties"]);
      } else {
        typeOfDefn = "Elem";
        if (defnFile[defnName]["description"]) {
          defnDescrip = defnFile[defnName]["description"];
        }

        if (defnFile[defnName]["type"]) {
          defnType = defnFile[defnName]["type"];
        }

        if (defnFile[defnName]["enum"]) {
          defnEnum = defnFile[defnName]["enum"];
        }
      }

      if (temp_superClassList.length == 0) {
        temp_superClassListStr = "None";
      } else {
        temp_superClassListStr = temp_superClassList.join(", ");
      }

      if (!defnEnum) {
        defnEnum = "None";
      } else {
        defnEnum = defnEnum.join(", ");
      }

      if (defnObjChildren) {
        defnObjChildren = defnObjChildren.join(", ");
      } else {
        defnObjChildren = "None";
      }

      if (typeOfDefn == "ObjWithInherit") {
        temp_ret_obj = [
          { Attributes: "Name", Values: defnName },
          { Attributes: "Type", Values: defnType },
          { Attributes: "Documentation", Values: defnDescrip },
          { Attributes: "Superclasses", Values: temp_superClassListStr },
          { Attributes: "Children", Values: defnObjChildren }
        ];
      } else if (typeOfDefn == "TaxonomyElement") {
        temp_ret_obj = [
          { Attributes: "Name", Values: defnName },
          { Attributes: "Type", Values: defnType },
          { Attributes: "Documentation", Values: defnDescrip },
          { Attributes: "Superclasses", Values: temp_superClassListStr }
        ];
      } else if (typeOfDefn == "Obj") {
        temp_ret_obj = [
          { Attributes: "Name", Values: defnName },
          { Attributes: "Type", Values: defnType },
          { Attributes: "Documentation", Values: defnDescrip },
          { Attributes: "Children", Values: defnObjChildren }
        ];
      } else if (typeOfDefn == "Elem") {
        temp_ret_obj = [
          { Attributes: "Name", Values: defnName },
          { Attributes: "Type", Values: defnType },
          { Attributes: "Enumeration", Values: defnEnum },
          { Attributes: "Documentation", Values: defnDescrip }
        ];
      }

      let arr = temp_ret_obj;

      return arr;
    },
    maxInheritance() {
      if (
        this.$store.state.currentFile.file[this.$store.state.isSelected][
          "allOf"
        ] !== undefined
      ) {
        if (
          this.$store.state.currentFile.file[this.$store.state.isSelected][
            "allOf"
          ].length > 1
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  },
  watch: {
    selectedFileName() {
      this.selectedDefnIndex = null;
      this.selectedSuperClassName = null;
      this.searchTerm = "";
    }
  }
};
</script>

<style>
.node-list {
  height: 250px;
  overflow-y: auto;
  background-color: white;
  border-top: 1px solid black;
  border-left: 1px solid black;
  border-right: 1px solid black;

  margin-bottom: 4px;
}

.node-in-list {
  list-style: none;
  border-bottom: 1px solid black;
}

.selected-node {
  background-color: #89cff0;
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
</style>
