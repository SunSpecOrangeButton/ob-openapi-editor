<!-- 
Component for removing inheritance from objects
-->

<template>
  <div class="editor-function-container">
    <div class="editor-function-body-container">
      <p>Choose superclass to remove from object:</p>
      <div class="superclass-list">
        <li
          v-for="(superClassName, index) in superClassList"
          class="superclass-in-list"
          @click="superClassToRemove(index, superClassName)"
          :class="{ 'selected-superclass': index == selectedIndex }"
        >
          {{ superClassName }}
        </li>
      </div>
      <br />
      <b-table
        :items="defnDetails"
        id="add-member-detail-table"
        ref="add-member-detail-table"
        v-if="selectedSuperClass"
      ></b-table>
    </div>
    <div class="editor-function-footer-container">
      <b-button
        variant="primary"
        @click="removeSuperClass"
        :disabled="emptySuperClassList"
        size="sm"
      >
        Remove
      </b-button>
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
      selectedIndex: null,
      selectedSuperClass: "",
      definitionsInSuperClass: [],
      selectedElementDetails: [],
      emptySuperClassList: true,
      selectedSuperClassRefFile: ""
    };
  },
  methods: {
    superClassToRemove(index, superClassName) {
      this.selectedIndex = index;
      this.selectedSuperClass = superClassName;

      for (let i in this.$store.state.currentFile.file[
        this.$store.state.isSelected
      ]["allOf"]) {
        if (
          this.$store.state.currentFile.file[this.$store.state.isSelected][
            "allOf"
          ][i]["$ref"]
        ) {
          if (
            this.$store.state.currentFile.file[this.$store.state.isSelected][
              "allOf"
            ][i]["$ref"].includes(this.selectedSuperClass)
          ) {
            this.selectedSuperClassRefFile = this.$store.state.currentFile.fileName
            // this.selectedSuperClassRefFile = miscUtilities.getRefFileContext(
            //   this.$store.state.currentFile.file[this.$store.state.isSelected][
            //     "allOf"
            //   ][i]["$ref"]
            // );
          }
        }
      }
    },
    removeSuperClass() {
      this.$store.commit("removeSuperClass", this.selectedSuperClass);
      this.selectedSuperClass = "";
    },
    goPreviousView() {
      this.$store.state.activeEditingView = "EditDefinitionFormDisabled";
    }
  },
  computed: {
    superClassList() {
      let superClassList = [];
      if (this.$store.state.isSelected) {
        for (let i in this.$store.state.currentFile.file[
          this.$store.state.isSelected
        ]["allOf"]) {
          if (
            this.$store.state.currentFile.file[this.$store.state.isSelected][
              "allOf"
            ][i]["$ref"]
          ) {
            superClassList.push(
              this.$store.state.currentFile.file[this.$store.state.isSelected][
                "allOf"
              ][i]["$ref"].slice(
                this.$store.state.currentFile.file[
                  this.$store.state.isSelected
                ]["allOf"][i]["$ref"].lastIndexOf("/") + 1
              )
            );
          }
        }

        if (superClassList.length == 0) {
          this.emptySuperClassList = true;
        } else {
          this.emptySuperClassList = false;
        }

        return superClassList.sort();
      }
    },
    defnDetails() {
      let temp_ret_obj = null;

      let defnName = this.$store.state.isSelected;
      let superClass = this.selectedSuperClass;
      let defnType = "";
      let defnDescrip = "Documentation not available";
      let defnEnum = "";
      let temp_superClassList = [];
      let temp_superClassListStr = "";
      let defnObjChildren = "";
      let typeOfDefn = null;

      let defnFile = this.$store.state.loadedFiles[
        this.selectedSuperClassRefFile
      ]["file"];

      if (defnFile[superClass]["allOf"]) {
        if (miscUtilities.isTaxonomyElement(defnFile, superClass)) {
          typeOfDefn = "TaxonomyElement";
        } else {
          typeOfDefn = "ObjWithInherit";
        }
        for (let i in defnFile[superClass]["allOf"]) {
          if (defnFile[superClass]["allOf"][i]["$ref"]) {
            temp_superClassList.push(
              defnFile[superClass]["allOf"][i]["$ref"].slice(
                defnFile[superClass]["allOf"][i]["$ref"].lastIndexOf("/") + 1
              )
            );
          } else {
            if (defnFile[superClass]["allOf"][i]["description"]) {
              defnDescrip = defnFile[superClass]["allOf"][i]["description"];
            }

            if (defnFile[superClass]["allOf"][i]["type"]) {
              defnType = defnFile[superClass]["allOf"][i]["type"];
            }

            if (defnFile[superClass]["allOf"][i]["enum"]) {
              defnEnum = defnFile[superClass]["allOf"][i]["enum"];
            }

            if (typeOfDefn == "ObjWithInherit") {
              if (defnFile[superClass]["allOf"][i]["properties"]) {
                if (defnFile[superClass]["properties"]) {
                  defnObjChildren = Object.keys(
                    defnFile[superClass]["properties"]
                  );
                }
              }
            }
          }
        }
      } else if (defnFile[superClass]["properties"]) {
        typeOfDefn = "Obj";
        if (defnFile[superClass]["type"]) {
          defnType = defnFile[superClass]["type"];
        }

        if (defnFile[superClass]["properties"]["description"]) {
          defnDescrip = defnFile[superClass]["properties"]["description"];
        }

        defnObjChildren = Object.keys(defnFile[superClass]["properties"]);
      } else {
        typeOfDefn = "Elem";
        if (defnFile[superClass]["description"]) {
          defnDescrip = defnFile[superClass]["description"];
        }

        if (defnFile[superClass]["type"]) {
          defnType = defnFile[superClass]["type"];
        }

        if (defnFile[superClass]["enum"]) {
          defnEnum = defnFile[superClass]["enum"];
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
          { Attributes: "Name", Values: superClass },
          { Attributes: "Type", Values: defnType },
          { Attributes: "Documentation", Values: defnDescrip },
          { Attributes: "Superclasses", Values: temp_superClassListStr },
          { Attributes: "Children", Values: defnObjChildren }
        ];
      } else if (typeOfDefn == "TaxonomyElement") {
        temp_ret_obj = [
          { Attributes: "Name", Values: superClass },
          { Attributes: "Type", Values: defnType },
          { Attributes: "Documentation", Values: defnDescrip },
          { Attributes: "Superclasses", Values: temp_superClassListStr }
        ];
      } else if (typeOfDefn == "Obj") {
        temp_ret_obj = [
          { Attributes: "Name", Values: superClass },
          { Attributes: "Type", Values: defnType },
          { Attributes: "Documentation", Values: defnDescrip },
          { Attributes: "Children", Values: defnObjChildren }
        ];
      } else if (typeOfDefn == "Elem") {
        temp_ret_obj = [
          { Attributes: "Name", Values: superClass },
          { Attributes: "Type", Values: defnType },
          { Attributes: "Enumeration", Values: defnEnum },
          { Attributes: "Documentation", Values: defnDescrip }
        ];
      }

      let arr = temp_ret_obj;

      return arr;
    }
  }
};
</script>

<style>
.superclass-list {
  height: 250px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid black;
  margin-bottom: 4px;
}

.superclass-in-list {
  list-style: none;
  border-bottom: 1px solid black;
}

.selected-superclass {
  background-color: #89cff0;
}

.submit-button-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.remove-superclass-container {
  padding-left: 15px;
  padding-right: 15px;
}
</style>
