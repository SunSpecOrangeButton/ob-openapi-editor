<!-- 
Child of EditDefinition, edit definition form
-->

<template>
  <div class="editor-function-container">
    <div class="editor-function-body-container">
      <b-form>
        <b-form-group
          label="Base OB Item Type:"
          label-for="change-item-type-group-base-item-type-input"
        >
          <b-form-select
            id="change-item-type-group-base-item-type-input"
            v-model="selectedOBItemType"
            :options="allItemTypes"
            disabled
          ></b-form-select>
        </b-form-group>

        <b-form-group
          label="Change Item Type Group:"
          label-for="change-item-type-group-base-item-type-group-input"
        >
          <b-form-select
            id="change-item-type-group-base-item-type-group-input"
            v-model="currentItemTypeGroup"
            :options="allPossibleItemTypeGroups"
          ></b-form-select>
        </b-form-group>

        <b-table 
            :fields="returnEnumOrUnitFields" 
            :items="itemTypeEnumsOrUnitsComputed" 
            id="change-item-type-enums-or-units-table" 
            class="item-type-table"
            ref="change-item-type-enums-or-units-table-ref"
        >
        </b-table>
        <!-- <span v-if="selectedOBItemType">
          <span v-if="selectedOBItemType.includes('solar-types')">
            <b-table
              :items="itemTypeUnits"
              class="detailsTable"
              ref="itemTypeUnitsTable"
            ></b-table>
          </span>
          <span v-else>
            <b-table
              :items="itemTypeUnits"
              class="detailsTable"
              ref="itemTypeUnitsTable"
            ></b-table>
          </span>
        </span> -->
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
import solarTypes from "@/assets/type_files/solar-types-units.json";
import utrTypes from "@/assets/type_files/utr-units.json";
export default {
  created() {
    this.allItemTypes = this.$store.state.loadedFiles[this.$store.state.selectedFileName]["item_types"]
    this.allItemTypeGroups = this.$store.state.loadedFiles[this.$store.state.selectedFileName]["item_type_groups"]
    this.selectedOBItemType = this.$store.state.nodeOBType;
    this.currentItemTypeGroup = this.$store.state.nodeOBItemTypeGroupName
    this.findPossibleItemTypeGroups()
  },
  data() {
    return {
    allItemTypes: {},
    allItemTypeGroups: {},
		selectedOBItemType: null,
		selectedOBItemTypeType: null,
		itemTypeEnumsOrUnits: [],
    hasSubmitted: false,
    currentItemTypeGroup: '',
		unit_fields: [
			{ key: "enumOrUnitID", label: "Unit ID" }, 
			{ key: "enumOrUnitLabel", label: "Unit Label" }
		],
		enum_fields: [
			{ key: "enumOrUnitID", label: "Enum ID" }, 
			{ key: "enumOrUnitLabel", label: "Enum Label" }                
    ],
    possibleItemTypeGroups: []      
  };
  },
  methods: {
    submitEdit() {
      this.$store.commit({
        type: "changeItemTypeGroup",
        OBItemTypeGroupName: this.currentItemTypeGroup,
      });
      this.hasSubmitted = true;
    },
    goPreviousView() {
      this.$store.state.activeEditingView = "EditDefinitionFormDisabled";
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
    returnEnumOrUnitFields() {
      if (this.selectedOBItemTypeType) {
        if (this.selectedOBItemTypeType == 'units') {
          return this.unit_fields
        } else if (this.selectedOBItemTypeType == 'enums') {
          return this.enum_fields
        }
      }   
    },
    itemTypeEnumsOrUnitsComputed() {
		  return this.itemTypeEnumsOrUnits
    },
    allPossibleItemTypeGroups() {
      return this.possibleItemTypeGroups
    }
  },
  watch: {
    currentItemTypeGroup() {
      let enumOrUnitID = ''
      let enumOrUnitLabel = ''
      let enumOrUnitDescription = ''   
      let currentItemTypeObj = this.allItemTypes[this.selectedOBItemType]
      this.itemTypeEnumsOrUnits = []

      if (this.currentItemTypeGroup) {
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

            this.itemTypeEnumsOrUnits.push({
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

            this.itemTypeEnumsOrUnits.push({
              'enumOrUnitID': enumOrUnitID,
              'enumOrUnitLabel': enumOrUnitLabel,
              'enumOrUnitDescription': enumOrUnitDescription
            })
          }
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
