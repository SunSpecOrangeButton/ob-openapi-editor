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
        label="Sample:"
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
          :options="allItemTypesComputed"
          :disabled="!preSubmit"
          :state="Boolean(selectedOBItemType)"
        ></b-form-select>
      </b-form-group>

      <b-form-group
        label="Item Type Group:"
        label-for="create-def-item-type-group-input"
        v-if="selectedOBItemType"
      >
        <b-form-select
          id="create-def-item-type-group-input"
          v-model="selectedItemTypeGroup"
          :options="allPossibleItemTypeGroups"
        ></b-form-select>
      </b-form-group>

      <!-- <div class="enum-or-unit-table-container" v-if="selectedOBItemTypeType">              
        <b-table 
            @row-selected="onRowSelected" 
            selectable 
            select-mode="single"
            :fields="returnEnumOrUnitFields(selectedOBItemTypeType)" 
            :items="itemTypeEnumsOrUnitsComputed" 
            class="item-type-table"
        >
        </b-table>
      </div> -->

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
        <b-button v-if="preSubmit" @click="exitView">Cancel</b-button>
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

export default {
  created() {
    this.allItemTypes = this.$store.state.loadedFiles[this.$store.state.selectedFileName]["item_types"]
    this.allItemTypeGroups = this.$store.state.loadedFiles[this.$store.state.selectedFileName]["item_type_groups"]
  },
  data() {
    return {
      allItemTypes: null,
      selectedOBItemTypeType: null,
      selectedOBItemTypeDescription: null,
      selectedOBItemTypeEnumsOrUnits: [],
      selectedItemTypeGroup: '',
      possibleItemTypeGroups: [],
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

      selectedOBItemType: null,
      selectedOBUsageTips: "",
      selectedOBSampleValue: null,
      unitFields: [
          { key: "enumOrUnitID", label: "Unit ID", thStyle: { width: "150px" } }, 
          { key: "enumOrUnitLabel", label: "Unit Label", thStyle: { width: "150px" } },
          { key: "enumOrUnitDescription", label: "Unit Description"}
      ],
      enumFields: [
          { key: "enumOrUnitID", label: "Enum ID", thStyle: { width: "150px" } }, 
          { key: "enumOrUnitLabel", label: "Enum Label", thStyle: { width: "150px" } },
          { key: "enumOrUnitDescription", label: "Enum Description"}
      ],         
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
    onRowSelected(items) {
        this.selectedEnumOrUnit = items
    },    
    exitView() {
      this.definitionName = null;
      this.definitionType = null;
      this.definitionDescription = null;
      this.selectedOBItemType = null;
      this.preSubmit = true;
      this.$store.commit("showNoView");
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
        OBItemTypeGroup: this.selectedItemTypeGroup,
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
    },
    returnEnumOrUnitFields(itemTypeType) {
      if (itemTypeType == 'units') {
          return this.unitFields
      } else if (itemTypeType == 'enums') {
          return this.enumFields
      }
    },
    findPossibleItemTypeGroups() {
      for (let i in this.allItemTypeGroups) {
        if (this.allItemTypeGroups[i]['type'].includes(this.selectedOBItemType)) {
          this.possibleItemTypeGroups.push(i)
        }
      }
      this.possibleItemTypeGroups.push({value: '', text: 'None'})
    }
  },
  computed: {
    allItemTypesComputed() {
      let ret_arr = []
      let itemTypeName = ''
      for (let i in this.allItemTypes) {
          itemTypeName = i
          ret_arr.push(itemTypeName)
      }

      return ret_arr.sort()
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
    },
    itemTypeEnumsOrUnitsComputed() {
      return this.selectedOBItemTypeEnumsOrUnits
    },
    allPossibleItemTypeGroups() {
      return this.possibleItemTypeGroups
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
    },
    selectedOBItemType() {
      if (this.selectedOBItemType) {
        this.selectedOBItemTypeType = ''
        this.selectedOBItemTypeDescription = ''
        this.selectedOBItemTypeEnumsOrUnits = []

        let enumOrUnitID = ''
        let enumOrUnitLabel = ''
        let enumOrUnitDescription = ''

        let currentItemTypeObj = this.allItemTypes[this.selectedOBItemType]
        this.findPossibleItemTypeGroups()
        if ("description" in currentItemTypeObj)
            this.selectedOBItemTypeDescription = currentItemTypeObj["description"]

          // refactor: repeated code
        if ("enums" in currentItemTypeObj) {
          this.selectedOBItemTypeType = 'enums'
          for (let i in currentItemTypeObj['enums']) {
            enumOrUnitID = i
            if ('label' in currentItemTypeObj['enums'][i]) {
                enumOrUnitLabel = currentItemTypeObj['enums'][i]['label']
            } else {
                enumOrUnitLabel = ''
            }

            if ('description' in currentItemTypeObj['enums'][i]) {
                enumOrUnitDescription = currentItemTypeObj['enums'][i]['description']
            } else {
                enumOrUnitDescription = ''
            }                        

            this.selectedOBItemTypeEnumsOrUnits.push({
                'enumOrUnitID': enumOrUnitID,
                'enumOrUnitLabel': enumOrUnitLabel,
                'enumOrUnitDescription': enumOrUnitDescription
            })
          }
        } else if ("units" in currentItemTypeObj) {
          this.selectedOBItemTypeType = 'units' 
          for (let i in currentItemTypeObj['units']) {
            enumOrUnitID = i
            if ('label' in currentItemTypeObj['units'][i]) {
                enumOrUnitLabel = currentItemTypeObj['units'][i]['label']
            } else {
                enumOrUnitLabel = ''
            }

            if ('description' in currentItemTypeObj['units'][i]) {
                enumOrUnitDescription = currentItemTypeObj['units'][i]['description']
            } else {
                enumOrUnitDescription = ''
            }     

            this.selectedOBItemTypeEnumsOrUnits.push({
                'enumOrUnitID': enumOrUnitID,
                'enumOrUnitLabel': enumOrUnitLabel,
                'enumOrUnitDescription': enumOrUnitDescription
            })
          }
        }
        console.log(this.possibleItemTypeGroups)
      }
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
