<template>
  <div id="load-in-defn-edit-view-container">
    <div id="load-in-defn-container">
      <div>Select document:</div>
      <b-form-select
        v-model="selectedFile"
        :options="getLoadedFiles"
        :select-size="4"
        id="select-form-files"
      ></b-form-select>
      <b-form-group
        id="node-selector-input-label"
        label="Search for definition:"
        label-for="node-selector-input"
      >
        <b-form-input
          v-model="searchTerm"
          placeholder="Search for definition... (wildcard: *)"
        ></b-form-input>
      </b-form-group>
      <div>Select definition to load in:</div>
      <div id="load-in-defn-file-defns-container">
        <span v-if="selectedFile">
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
        id="loadInDefnDetailsTable"
        ref="loadInDefnDetailTable"
        v-if="selectedDefnName"
      ></b-table>
    </div>
    <div id="load-in-defn-footer">
      <span id="edit-form-buttons">
        <b-button
          @click="loadInDefinition"
          :disabled="!selectedDefnName"
          size="sm"
          variant="primary"
          >Load In</b-button
        >
        <b-button @click="showDetailedView" size="sm">Back</b-button>
      </span>
    </div>
  </div>
</template>

<script>
import * as miscUtilities from "../../utils/miscUtilities";

export default {
  data() {
    return {
      selectedFile: null,
      selectedDefnIndex: null,
      selectedDefnName: null,
      searchTerm: ""
    };
  },
  created() {},
  methods: {
    showDetailedView() {
      this.$store.commit("showDetailedView");
    },
    selectDefn(index, name) {
      this.selectedDefnIndex = index;
      this.selectedDefnName = name;
    },
    loadInDefinition() {
      this.$store.commit({
        type: "loadInDefinition",
        defnFile: this.selectedFile,
        defnName: this.selectedDefnName
      });
    }
  },
  computed: {
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
    fileElements() {
      let fileElements = Object.keys(
        this.$store.state.loadedFiles[this.selectedFile]["file"]
      );

      return fileElements
        .filter(node => {
          return miscUtilities.wildcardSearch(node.toLowerCase(), this.searchTerm.toLowerCase());
        })
        .sort();
    },
    defnDetails() {
      let temp_ret_obj = null;

      let defnName = this.selectedDefnName;
      let defnType = "";
      let defnDescrip = "Documentation not available";
      let defnEnum = "";
      let temp_superClassList = [];
      let temp_superClassListStr = "";
      let defnObjChildren = "";
      let typeOfDefn = null;

      let defnFile = this.$store.state.loadedFiles[this.selectedFile]["file"];

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
    }
  },
  watch: {
    "$store.state.showLoadInDefinitionForm"() {
      this.selectedFile = null;
      this.selectedDefnIndex = null;
      this.selectedDefnName = null;
    },
    selectedFile() {
      this.searchTerm = "";
      this.selectedDefnIndex = null;
      this.selectedDefnName = null;
    }
  }
};
</script>

<style>
#load-in-defn-edit-view-container {
  display: grid;
  height: 100%;
  grid-template-rows: 1fr 50px;
}

#load-in-defn-container {
  padding-top: 9px;
  overflow-y: auto;
  grid-row: 1 / 2;
  padding-left: 15px;
  padding-right: 15px;
}

#load-in-defn-file-defns-container {
  height: 250px;
  overflow-y: auto;
  background-color: white;
  border-top: 1px solid black;
  border-left: 1px solid black;
  border-right: 1px solid black;
  margin-bottom: 4px;
}

#defn-from-file {
  list-style: none;
  border-bottom: 1px solid black;
}

#select-form-files {
  margin-bottom: 10px;
}

#load-in-defn-footer {
  grid-row: 2 / 3;
  display: flex;
  justify-content: center;
  align-items: center;
  border: #d3d3d3 solid 1px;
}
</style>
