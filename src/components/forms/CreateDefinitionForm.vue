<template>
  <div class="create-element-container">
    <b-form>
      <b-form-group
        id="node-type-input-group"
        label="OB Definition type:"
        label-for="node-type-input"
      >
        <b-form-select
          id="node-type-input"
          v-model="definitionType"
          :options="OBDataTypes"
          :disabled="!preSubmit"
          :state="Boolean(definitionType)"
        ></b-form-select>
      </b-form-group>
      <b-form-group
        id="node-name-input-group"
        label="Definition name:"
        label-for="node-name-input"
      >
        <b-form-input
          id="node-name-input"
          v-model="definitionName"
          :disabled="!preSubmit"
          :state="Boolean(definitionName)"
        ></b-form-input>
      </b-form-group>
      <b-form-group
        id="node-description-input-group"
        label="Definition description:"
        label-for="node-description-input"
      >
        <b-form-input
          id="node-description-input"
          v-model="definitionDescription"
          :disabled="!preSubmit"
          :state="Boolean(definitionDescription)"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        id="node-usage-tips-input-group"
        label="Usage tips:"
        label-for="node-usage-tips-input"
      >
        <b-form-input
          id="node-usage-tips-input"
          v-model="selectedOBUsageTips"
          :disabled="!preSubmit"
        ></b-form-input>
      </b-form-group>

      <b-form-group
        id="node-sample-value-input-group"
        label="Sample value:"
        label-for="node-sample-value-input"
      >
        <b-form-textarea
          id="node-sample-value-input"
          v-model="selectedOBSampleValue"
          :state="Boolean(selectedOBSampleValue) ? validateSampleValueJSON(selectedOBSampleValue) : false"
          :disabled="!preSubmit"
        ></b-form-textarea>
      </b-form-group>

      <b-form-group
        id="node-item-type-input-group"
        label="OB Item Type:"
        label-for="node-item-type-input"
        v-if="
          definitionType == 'OB Taxonomy Element String' ||
            definitionType == 'OB Taxonomy Element Number' ||
            definitionType == 'OB Taxonomy Element Integer' ||
            definitionType == 'OB Taxonomy Element Boolean'
        "
      >
        <b-form-select
          id="node-item-type-input"
          v-model="selectedOBItemType"
          :options="OBItemTypes"
          :disabled="!preSubmit"
          :state="Boolean(selectedOBItemType)"
        ></b-form-select>
      </b-form-group>

      <span v-if="selectedOBItemType">
        <span v-if="selectedOBItemType.includes('solar-types')">
          <b-table
            :items="itemTypeUnits"
            id="detailsTable"
            ref="itemTypeUnitsTable"
          ></b-table>
        </span>
        <span v-else>
          <b-table
            :items="itemTypeUnits"
            id="detailsTable"
            ref="itemTypeUnitsTable"
          ></b-table>
        </span>
      </span>

      <span v-if="definitionType == 'OB Array'">
        <div>Choose array item:</div>
        <div>Select document to choose array item from:</div>
        <b-form-select
          v-model="selectedFileName"
          :options="getLoadedFiles"
          :select-size="4"
          id="select-form-files"
        ></b-form-select>
        <br />
        <div>Select definition to use as array item:</div>
        <b-form-input
            class="array-item-search-bar"
            v-model="arrayItemSearchTerm"
            placeholder="Search item names... (wildcard: * )"
          >
          </b-form-input>
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
          v-if="selectedDefnName"
        ></b-table>
      </span>

      <span id="edit-form-buttons">
        <b-button v-if="preSubmit" type="submit" @click.prevent="createElement"
          >Create</b-button
        >
        <b-button v-if="preSubmit" @click="showDetailedView">Cancel</b-button>
      </span>
    </b-form>
    <b-modal
      id="modal-create-node"
      title="Attention"
      ref="create-modal-warning"
      centered
      no-stacking
      v-model="submissionError"
    >
      <p>
        {{ submissionErrorMsg }}
      </p>
    </b-modal>
  </div>
</template>

<script>
import * as miscUtilities from "../../utils/miscUtilities";
import solarTypes from "@/assets/type_files/solar-types-units.json";
import utrTypes from "@/assets/type_files/utr-units.json";

export default {
  created() {
    let solar_types = []
    let utr_types = []
    Object.keys(solarTypes).forEach(key => {
      solar_types.push(key);
    });
    Object.keys(utrTypes).forEach(key => {
      utr_types.push(key);
    });
    solar_types.sort()
    utr_types.sort()
    this.OBItemTypes = this.OBItemTypes.concat(solar_types).concat(utr_types)

  },
  data() {
    return {
      definitionName: null,
      definitionType: null,
      definitionDescription: null,
      preSubmit: true,
      submissionError: false,
      submissionErrorMsg: "",
      OBDataTypes: [
        "OB Object",
        "OB Array",
        "OB Taxonomy Element String",
        "OB Taxonomy Element Number",
        "OB Taxonomy Element Integer",
        "OB Taxonomy Element Boolean"
      ],
      arrayItemSearchTerm: "",
      selectedFileName: null,
      selectedDefnIndex: null,
      selectedDefnName: null,

      OBItemTypes: [],
      selectedOBItemType: null,
      selectedOBUnits: null,
      selectedOBEnum: null,
      selectedOBUsageTips: "",
      selectedOBSampleValue: null
    };
  },
  methods: {
    validateSampleValueJSON() {
      try {
        JSON.parse(this.selectedOBSampleValue);
        return true;
      } catch(error) {
        return false;
      }
    },
    showDetailedView() {
      this.definitionName = null;
      this.definitionType = null;
      this.definitionDescription = null;
      this.selectedOBItemType = null;
      this.preSubmit = true;
      this.$store.commit("showDetailedView");
    },
    createElement() {
      if(!this.definitionType) {
        this.submissionErrorMsg = "Please select a definition type.";
        this.submissionError = true;
        return;
      } else if(!this.definitionName) {
        this.submissionErrorMsg = "Please enter a definition name.";
        this.submissionError = true;
        return;
      } else if(!this.definitionDescription) {
        this.submissionErrorMsg = "Please enter a definition description.";
        this.submissionError = true;
        return;
      } else if(this.definitionType === "OB Array" && (!this.selectedFileName || !this.selectedDefnName)) {
        this.submissionErrorMsg = "Please select a file and an array item.";
        this.submissionError = true;
        return;
      } else if(this.definitionType.substring(0,19) === "OB Taxonomy Element" && !this.selectedOBItemType) {
        this.submissionErrorMsg = "Please select an OB Item Type."
        this.submissionError = true;
        return;
      } else if(!this.selectedOBSampleValue || !this.validateSampleValueJSON()) {
        this.submissionErrorMsg = "Invalid SampleValue JSON."
        this.submissionError = true;
        return;
      }
      
      let payload = {
        definitionName: this.definitionName,
        definitionType: this.definitionType,
        definitionDescription: this.definitionDescription,
        arrayItemDefnName: this.selectedDefnName,
        arrayItemFileName: this.selectedFileName,
        OBItemType: this.selectedOBItemType,
        OBUnits: this.selectedOBUnits,
        OBEnum: this.selectedOBEnum,
        OBUsageTips: this.selectedOBUsageTips,
        OBSampleValue: JSON.parse(this.selectedOBSampleValue)
      };
      this.preSubmit = false;

      this.$store.commit("createDefinition", payload);
    },
    selectDefn(index, definitionName) {
      this.selectedDefnIndex = index;
      this.selectedDefnName = definitionName;
      this.showErrorInfinite = false;
      this.showErrorConflict = false;
    }
  },
  computed: {
    itemTypeUnits() {
      this.selectedOBUnits = '';
      this.selectedOBEnum = '';
      let retArr = [];
      if (this.selectedOBItemType) {
        if (this.selectedOBItemType.includes("solar-types")) {
          this.selectedOBEnum = solarTypes[this.selectedOBItemType];

          retArr = [{ Attributes: "OB Enum", Values: this.selectedOBEnum }];
        } else {
          this.selectedOBUnits = utrTypes[this.selectedOBItemType];

          retArr = [{ Attributes: "OB Units", Values: this.selectedOBUnits }];
        }
      }

      return retArr
    },
    fileElements() {
      if (this.selectedFileName) {
        let fileElements = Object.keys(
          this.$store.state.loadedFiles[this.selectedFileName]["file"]
        ).sort();

        return fileElements
          .filter(node => {
            return miscUtilities.wildcardSearch(node.toLowerCase(), this.arrayItemSearchTerm.toLowerCase());
          });
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

      let defnName = this.selectedDefnName;
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
    }
  },
  watch: {
    "$store.state.showCreateDefinitionForm"() {
      this.definitionName = null;
      this.definitionType = null;
      this.definitionDescription = null;
      this.selectedOBItemType = null;
      this.selectedFileName = null;
      this.selectedDefnIndex = null;
      this.selectedDefnName = null;
      this.selectedOBUsageTips = "";
      this.selectedOBSampleValue = JSON.stringify({"Decimals":"","EndTime":"","Precision":"","StartTime":"","Unit":"","Value":""}, null, 2);
    },
    "$store.state.isSelected"() {
      this.definitionType = null;
      this.definitionName = null;
      this.definitionDescription = null;
      this.selectedOBUsageTips = "";
      this.selectedOBSampleValue = JSON.stringify({"Decimals":"","EndTime":"","Precision":"","StartTime":"","Unit":"","Value":""}, null, 2);
      if (!this.preSubmit) {
        this.preSubmit = true;
      }
    },
    "$store.state.refreshCreateDefn"() {
      if (this.$store.state.refreshCreateDefn == true) {
        this.definitionType = null;
        this.definitionName = null;
        this.definitionDescription = null;
        this.selectedOBItemType = null;
        this.selectedFileName = null;
        this.selectedDefnIndex = null;
        this.selectedDefnName = null;
        this.selectedOBUsageTips = "";
        this.selectedOBSampleValue = JSON.stringify({"Decimals":"","EndTime":"","Precision":"","StartTime":"","Unit":"","Value":""}, null, 2);
        if (!this.preSubmit) {
          this.preSubmit = true;
        }
        this.$store.commit("refreshCreateDefnInputs", false);
      }
    },
    selectedFileName() {
      this.selectedDefnIndex = null;
      this.selectedDefnName = null;
      this.searchTerm = "";
    }
  }
};
</script>

<style>
#edit-form-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
}

.create-element-container {
  padding-left: 15px;
  padding-right: 15px;
}

.array-item-search-bar {
  margin-top: 5px;
  margin-bottom: 10px;
}
</style>
