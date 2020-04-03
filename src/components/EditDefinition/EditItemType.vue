<!-- 
Child of EditDefinition, edit definition form
-->

<template>
  <div class="editor-function-container">
    <div class="editor-function-body-container">
      <b-form>
        <b-form-group
          id="node-item-type-input-group"
          label="OB Item Type:"
          label-for="node-item-type-input"
        >
          <b-form-select
            id="node-item-type-input"
            v-model="selectedOBItemType"
            :options="OBItemTypes"
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
    Object.keys(solarTypes).forEach(key => {
      this.OBItemTypes.push(key);
    });
    Object.keys(utrTypes).forEach(key => {
      this.OBItemTypes.push(key);
    });
    this.selectedOBItemType = this.$store.state.nodeOBType;
  },
  data() {
    return {
      definitionType: null,
      OBDataTypes: [
        "OB Object",
        "OB Array",
        "OB Taxonomy Element String",
        "OB Taxonomy Element Number",
        "OB Taxonomy Element Integer",
        "OB Taxonomy Element Boolean"
      ],
      OBItemTypes: [],
      selectedOBItemType: null,
      selectedOBUnits: null,
      selectedOBEnum: null,
      hasSubmitted: false
    };
  },
  methods: {
    submitEdit() {
      this.$store.commit({
        type: "editItemType",
        OBItemType: this.selectedOBItemType,
        OBUnits: this.selectedOBUnits,
        OBEnum: this.selectedOBEnum
      });
      this.hasSubmitted = true;
    },
    goPreviousView() {
      this.$store.state.activeEditingView = "EditDefinitionFormDisabled";
    }
  },
  computed: {
    itemTypeUnits() {
      this.selectedOBUnits = null;
      this.selectedOBEnum = null;
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

      return retArr;
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
