<!-- 
Is the parent of all the editing components
-->

<template>
  <div class="edit-node-container">
    <component :is="changeEditingView"></component>

    <span
      class="edit-form-buttons"
      v-if="$store.state.activeEditingView == 'EditDefinitionFormDisabled'"
    >
      <b-button class="edit-btn" variant="secondary" @click="editDefinition">Edit Description</b-button>
      <b-button
        class="edit-btn"
        v-if="
          $store.state.nodeType == 'object' && !$store.state.isTaxonomyElement
        "
        variant="secondary"
        @click="addMember"
      >Add member</b-button>
      <b-button
        class="edit-btn"
        v-if="$store.state.nodeType == 'object'"
        variant="secondary"
        @click="addInheritance"
      >Add Inheritance</b-button>
      <b-button
        class="edit-btn"
        v-if="$store.state.nodeType == 'object'"
        variant="secondary"
        @click="removeInheritance"
      >Remove Inheritance</b-button>
      <b-button
        class="edit-btn"
        v-if="
          $store.state.nodeType == 'element' || $store.state.isTaxonomyElement
        "
        variant="secondary"
        @click="changeItemType"
      >Change Item Type</b-button>
      <b-button
        class="edit-btn"
        v-if="
          $store.state.nodeType == 'element' || $store.state.isTaxonomyElement
        "
        variant="secondary"
        @click="changeItemTypeGroup"
      >Change Item Type Group</b-button>        
      <b-button class="edit-btn" variant="secondary" @click="editUsageTips">Edit Usage Tips</b-button>
      <b-button class="edit-btn" variant="secondary" v-if="this.$store.state.isTaxonomyElement" @click="editSampleValue">Edit Sample</b-button>
      <b-button class="edit-btn" variant="secondary" v-if="this.$store.state.isTaxonomyElement || $store.state.nodeType == 'object' || $store.state.nodeType == 'element'" 
        @click="changeName">Change Name</b-button>      
    </span>
    <div
      class="previous-view-button"
      v-if="$store.state.activeEditingView == 'EditDefinitionFormDisabled'"
    >
      <b-button variant="danger" @click="backToPrevView">Back</b-button>
    </div>
  </div>
</template>

<script>
import AddInheritance from "./AddInheritance.vue";
import AddMember from "./AddMember.vue";
import EditDefinitionForm from "./EditDefinitionForm.vue";
import EditDefinitionFormDisabled from "./EditDefinitionFormDisabled.vue";
import RemoveInheritance from "./RemoveInheritance.vue";
import AddEnum from "./AddEnum.vue";
import RemoveEnum from "./RemoveEnum.vue";
import ChangeItemType from "./ChangeItemType.vue";
import ChangeItemTypeGroup from "./ChangeItemTypeGroup.vue"
import EditUsageTips from "./EditUsageTips";
import EditSampleValue from "./EditSampleValue";
import ChangeName from "./ChangeName"

import * as JSONEditor from "../../utils/JSONEditor.js";
import * as miscUtilities from "../../utils/miscUtilities.js";

export default {
  components: {
    AddInheritance,
    AddMember,
    EditDefinitionForm,
    EditDefinitionFormDisabled,
    RemoveInheritance,
    AddEnum,
    RemoveEnum,
    ChangeItemType,
    ChangeItemTypeGroup,    
    EditUsageTips,
    EditSampleValue,
    ChangeName
  },
  data() {
    return {
      preSubmit: true,
      dataTypes: ["string", "number", "integer", "boolean", "array", "object"],
      addingChild: false,
      addingSubClass: false,
      removingInheritance: false,
      formChanged: false
    };
  },
  methods: {
    backToPrevView() {
      this.$store.commit("showDetailedView");
    },
    editNodeSubmit() {
      this.preSubmit = false;
      if (this.addingChild) {
        this.$store.commit("addNodeToObject");
        this.$store.commit("setAddNodeToObjectToNone");
      } else if (this.addingSubClass) {
        this.$store.commit("addSuperClass");
        this.$store.state.superClassToAddToObject = "";
      } else if (this.removingInheritance) {
      } else {
        this.$store.commit("editNode");
      }
    },
    addMember() {
      this.$store.state.activeEditingView = "AddMember";
    },
    addInheritance() {
      this.$store.state.activeEditingView = "AddInheritance";
    },
    removeInheritance() {
      this.$store.state.activeEditingView = "RemoveInheritance";
    },
    editDefinition() {
      this.$store.state.activeEditingView = "EditDefinitionForm";
    },
    addEnum() {
      this.$store.state.activeEditingView = "AddEnum";
    },
    removeEnum() {
      this.$store.state.activeEditingView = "RemoveEnum";
    },
    changeItemType() {
      this.$store.state.activeEditingView = "ChangeItemType";
    },
    changeItemTypeGroup() {
      this.$store.state.activeEditingView = "ChangeItemTypeGroup"
    },
    editUsageTips() {
      this.$store.state.activeEditingView = "EditUsageTips";
    },
    editSampleValue() {
      this.$store.state.activeEditingView = "EditSampleValue";
    },
    changeName() {
      this.$store.state.activeEditingView = "ChangeName";
    }
  },
  computed: {
    changeEditingView() {
      return this.$store.state.activeEditingView;
    }
  },
  watch: {
    "$store.state.isSelected"() {
      this.$store.state.activeEditingView = "EditDefinitionFormDisabled";
    }
  }
};
</script>

<style>
.previous-view-button {
  display: flex;
  justify-content: center;
  align-items: center;
}

.edit-form-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.edit-btn {
  margin-bottom: 10px;
}

.edit-node-container {
  height: 100%;
}
</style>
