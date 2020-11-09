<template>
  <div class="ob-editor-container">
    <div class="element-selector-body" ref="treeContainer">
      <div class="file-load-tabs">
        <b-card no-body class="rounded-0" id="no-body-card">
          <b-tabs
            v-model="$store.state.currentTabIndexFileEditor"
            card
            id="start-tabs"
          >
            <template v-slot:tabs-end>
              <b-nav-item @click="showAddFileModal = true" href="#">
                <b>+</b>
              </b-nav-item>
            </template>
            <template v-slot:empty>
              <div class="text-center text-muted">
                There are no open files<br />
                Import a new file using the <b>+</b> button above.
              </div>
            </template>
            <b-tab
              v-for="(item, index) in fileTabs"
              :key="'dyn-tab-' + index"
              :title="item.fileName"
            >
              <template v-slot:title>
                <strong>{{ item.fileName }}</strong>
                <span @click="$bvModal.show('modal-close-file-warning')">
                  <v-icon name="times" id="tab-close" />
                </span>
              </template>
              <span v-if="$store.state.currentFile">
                <div class="tree-search" v-if="$store.state.viewerMode == 'Edit Mode'">
                  <b-form-input
                    class="tree-search-bar"
                    v-model="treeSearchTerm"
                    placeholder="Search element names... (wildcard: * )"
                  >
                  </b-form-input>
                </div>
                <span :key="$store.state.refreshKey">
                  <span v-for="arr in sortedObjects">
                    <!-- obj node -->
                    <UploadOBTree
                      v-if="arr[2] == 'Object'"
                      :name="arr[0]"
                      :children="arr[1].properties"
                      :depth="0"
                      :expandAllObjects="expandAllObjects"
                      :nodeDescription="arr[1].description"
                      :isObj="true"
                      parent="root"
                      :parent_trail="defnRefParentTrailStart(arr[0], item.fileName)"
                      type="object"
                      :ref="defnRef(arr[0], item.fileName)"
                      :nameRef="defnRef(arr[0], item.fileName)"
                      :file="computedFile"
                      :isTaxonomyElement="false"
                      :referenceFile="arr[3]"
                      :isLocal="arr[4]"
                      :viewObj="arr[5]"
                      :isTopLevel="true"
                    ></UploadOBTree>

                    <UploadOBTree
                      v-else-if="arr[2] == 'Array'"
                      :name="arr[0]"
                      :children="getArrayItemAsChildren(arr[3], arr[5], arr[0])"
                      :depth="0"
                      :expandAllObjects="expandAllObjects"
                      :nodeDescription="arr[1].description"
                      :isObj="false"
                      parent="root"
                      :parent_trail="defnRefParentTrailStart(arr[0], item.fileName)"
                      type="array"
                      :ref="defnRef(arr[0], item.fileName)"
                      :nameRef="defnRef(arr[0], item.fileName)"
                      :file="computedFile"
                      :isArray="true"
                      :arrayItemRef="arr[5]"
                      :arrayItemType="getArrItemType(arr[5])"
                      :referenceFile="arr[3]"
                      :isLocal="arr[4]"
                      :viewObj="false"
                      :isTopLevel="true"
                    ></UploadOBTree>

                    <!-- taxonomy element -->
                    <UploadOBTree
                      v-else-if="arr[2] == 'TaxonomyElement'"
                      :isObj="false"
                      :name="arr[0]"
                      :children="subClassChildren(arr[4], arr[3], arr[1], arr[0])"
                      :depth="0"
                      :expandAllObjects="expandAllObjects"
                      :nodeDescription="getNodeDescription(arr[1])"
                      parent="root"
                      :parent_trail="defnRefParentTrailStart(arr[0], item.fileName)"
                      type="object"
                      :ref="defnRef(arr[0], item.fileName)"
                      :nameRef="defnRef(arr[0], item.fileName)"
                      :file="computedFile"
                      :isTaxonomyElement="true"
                      :referenceFile="arr[4]"
                      :isLocal="arr[5]"
                      :viewObj="false"
                      :isTopLevel="true"
                    >
                    </UploadOBTree>

                    <!-- allOf Obj -->
                    <UploadOBTree
                      v-else-if="arr[2] == 'ObjWithInherit'"
                      :name="arr[0]"
                      :children="subClassChildren(arr[4], arr[3], arr[1], arr[0])"
                      :depth="0"
                      :expandAllObjects="expandAllObjects"
                      :nodeDescription="getNodeDescription(arr[1])"
                      :isObj="true"
                      parent="root"
                      :parent_trail="defnRefParentTrailStart(arr[0], item.fileName)"
                      type="object"
                      :ref="defnRef(arr[0], item.fileName)"
                      :nameRef="defnRef(arr[0], item.fileName)"
                      :file="computedFile"
                      :isTaxonomyElement="false"
                      :referenceFile="arr[4]"
                      :isLocal="arr[5]"
                      :viewObj="false"
                      :isTopLevel="true"
                    ></UploadOBTree>

                    <UploadOBTree
                      v-else
                      :isObj="false"
                      :name="arr[0]"
                      :depth="0"
                      :expandAllObjects="expandAllObjects"
                      :nodeDescription="getNodeDescription(arr[1])"
                      parent="root"
                      :parent_trail="defnRefParentTrailStart(arr[0], item.fileName)"
                      type="string"
                      :ref="defnRef(arr[0], item.fileName)"
                      :nameRef="defnRef(arr[0], item.fileName)"
                      :file="computedFile"
                      :isTaxonomyElement="false"
                      :referenceFile="arr[2]"
                      :isLocal="arr[3]"
                      :viewObj="false"
                      :isTopLevel="true"
                    >
                    </UploadOBTree>
                  </span>
                </span>
                <div class="load-more-btn-container">
                  <b-button @click="loadMore" v-if="showLoadMore"
                    >Load more</b-button
                  >
                </div>
              </span>
            </b-tab>
          </b-tabs>
        </b-card>
        <div id="modal-container">
          <b-modal id="modal-center" v-model="showAddFileModal">
            <template v-slot:modal-header>
              <div id="modal-header-">
                <h5 id="modal-header-inline">Load Schema</h5>
                <v-icon
                  name="info-circle"
                  id="info-circle-"
                  v-b-popover.hover.right="
                    'Choose an OB OpenAPI Definition File from your own system or load a Master File from View/Edit Dependency. '
                  "
                />
              </div>
            </template>
            <template v-slot:modal-footer>
              <div class="w-100">
                <b-button
                  variant="primary"
                  class="float-right"
                  @click="loadFile"
                  :disabled="!file"
                  v-if="tabIndexFileUpload == 0"
                >
                  Open
                </b-button>
                <b-button
                  variant="primary"
                  class="float-right"
                  @click="createFile"
                  v-if="tabIndexFileUpload == 1"
                >
                  Create
                </b-button>
                <b-button
                  variant="primary"
                  class="float-right"
                  @click="loadDependencyFile"
                  :disabled="!file"
                  v-if="tabIndexFileUpload == 2"
                >
                  Open
                </b-button>
                <b-button
                  variant="danger"
                  class="float-right"
                  @click="cancelLoadModal"
                >
                  Cancel
                </b-button>
              </div>
            </template>
            <div id="modal-tabs-container">
              <b-tabs
                content-class="mt-3"
                id="modal-tabs"
                no-fade
                v-model="tabIndexFileUpload"
              >
                <div id="modal-tabs-inside">
                  <b-tab title="From Local" active>
                    <div class="tab-container">
                      <div id="file-selector-container">
                        <b-form-file
                          v-model="file"
                          :state="Boolean(file)"
                          placeholder="Choose your OpenAPI Schema File..."
                          v-if="!file"
                        ></b-form-file>
                        <span id="selected-file-txt" v-else>
                          Selected file:
                          <strong>
                            {{ file ? file.name : "" }}
                          </strong>
                        </span>
                        <br />
                        <span id="unSelectFile-btn" v-if="file">
                          <b-button @click="unSelectFile">
                            Unselect File
                          </b-button>
                        </span>
                      </div>
                      <div class="error-container">
                        <b-alert
                          id="file-duplicate-error"
                          v-model="fileAlreadyOpened"
                          variant="danger"
                          dismissible
                        >
                          File already opened. Cannot open the same file twice.
                        </b-alert>
                        <b-alert
                          id="missing-ref-error"
                          v-model="showMissingRefsErr"
                          variant="danger"
                          dismissible
                        >
                          <p>
                            Missing references:
                            <strong>{{ missingRefsRequired }}</strong
                            ><br />
                            Load in missing files first to load this file in.
                          </p>
                        </b-alert>
                      </div>
                    </div>
                  </b-tab>
                  <b-tab title="Create New File">
                    <div id="new-file-form">
                      <b-form-group
                        id="new-file-input-group-1"
                        label="Definition file title:"
                        label-for="new-file-input-1"
                      >
                        <b-form-input
                          id="new-file-input-1"
                          v-model="newFileForm.fileTitle"
                          placeholder="Enter title for your new definition file"
                        ></b-form-input>
                      </b-form-group>

                      <b-form-group
                        id="new-file-input-group-2"
                        label="Definition File Description:"
                        label-for="new-file-input-2"
                      >
                        <b-form-input
                          id="new-file-input-2"
                          v-model="newFileForm.fileDescription"
                          placeholder="Enter description for your new definition file"
                        ></b-form-input>
                      </b-form-group>

                      <b-form-group
                        id="new-file-input-group-3"
                        label="Definition Filename:"
                        label-for="new-file-input-3"
                      >
                        <b-form-input
                          id="new-file-input-3"
                          v-model="newFileForm.fileName"
                          placeholder="Enter filename for your new definition file."
                        ></b-form-input>
                      </b-form-group>
                    </div>
                  </b-tab>
                  <b-tab title="View/Edit Dependency">
                    <div class="database-selector-container">
                      <div class="database-selector-list">
                        <li
                          v-for="(value, name, index) in dbList"
                          id="db-in-list"
                          @click="selectDBFile(index, name)"
                          :class="{ 'selected-node': index == selectedIndex }"
                        >
                          <span id="db-list-name">
                            {{ name }}
                          </span>
                        </li>
                      </div>
                      <div class="database-selector-list-information">
                        <span v-if="selectedDependencyInfo">
                          <p>{{ selectedDependencyInfo }}</p>
                          <!-- <b-form-checkbox
                                            v-model="readOnly"
                                            name="checkbox-2"
                                            value="true"
                                            unchecked-value="false"
                                        >
                                            Read only
                                        </b-form-checkbox> -->
                        </span>
                      </div>
                    </div>
                  </b-tab>
                </div>
              </b-tabs>
            </div>
          </b-modal>
        </div>
      </div>
    </div>
    <div class="element-selector-footer">
      <b-button
        variant="primary"
        size="sm"
        @click="toggleExpandAll"
        :disabled="!$store.state.currentFile"
        v-if="$store.state.viewerMode == 'Edit Mode'"
      >
        <span v-if="expandAllObjects">
          Collapse All
        </span>
        <span v-else-if="!expandAllObjects">
          Expand All
        </span>
      </b-button>
      <b-button
        variant="primary"
        size="sm"
        @click="showCreateDefinitionForm"
        :disabled="!$store.state.currentFile"
        v-if="$store.state.viewerMode == 'Edit Mode'"
        >Create New Definition</b-button
      >
      <b-button
        variant="primary"
        size="sm"
        @click="showLoadInDefinitionForm"
        :disabled="!$store.state.currentFile"
        v-if="$store.state.viewerMode == 'Edit Mode'"
        >Load In Definition</b-button
      >
    </div>
    <div class="element-editor-header">
      <div class="editor-header">
        <h4 v-if="$store.state.showDetailedView">Detailed View</h4>
        <h4 v-if="$store.state.showEditNodeView">
          Edit <strong>{{ $store.state.isSelected }}</strong>
        </h4>
        <h4 v-show="$store.state.showCreateDefinitionForm">
          Create Definition
        </h4>
        <h4 v-if="$store.state.showLoadInDefinitionForm">Load In Definition</h4>
      </div>
      <div class="download-button-container">
        <b-button
          variant="primary"
          v-b-modal.export-modal
          @click="exportModalOpened('sampleJSON')"
          :disabled="!$store.state.currentFile"
          size="sm"
          v-if="$store.state.viewerMode == 'Edit Mode'"
          >Create Sample JSON</b-button
        >
        <b-button
          variant="primary"
          v-b-modal.export-modal
          @click="exportModalOpened('taxonomy')"
          :disabled="!$store.state.currentFile"
          size="sm"
          v-if="$store.state.viewerMode == 'Edit Mode'"
          >Save As</b-button
        >
      </div>
    </div>
    <div class="element-editor-body">
      <DetailedNodeView v-if="$store.state.showDetailedView" />
      <EditDefinition v-if="$store.state.showEditNodeView" />
      <CreateDefinitionForm v-show="$store.state.showCreateDefinitionForm" />
      <LoadInDefinition v-if="$store.state.showLoadInDefinitionForm" />
    </div>

    <!-- Modals -->
    <div class="element-editor-footer"></div>
    <ExportFormModal />
    <span id="modal-container">
      <b-modal id="modal-close-file-warning">
        <template v-slot:modal-title>
          Close File?
        </template>
        <template v-slot:modal-footer>
          <div class="w-100">
            <b-button
              class="float-right"
              variant="primary"
              @click="closeTabWarning()"
              >OK</b-button
            >
            <b-button
              class="float-right"
              @click="$bvModal.hide('modal-close-file-warning')"
              >Cancel</b-button
            >
          </div>
        </template>
        <template v-slot:default>
          Are you sure you want to close the file? Any changes not exported will
          not be saved. Make sure this file is not being referenced in another
          loaded files or it may cause errors.
        </template>
      </b-modal>
    </span>
  </div>
</template>

<script>
import UploadOBTree from "../components/UploadOBTree.vue";
import DetailedNodeView from "../components/DetailedNodeView.vue";
import CreateDefinitionForm from "../components/forms/CreateDefinitionForm.vue";
import ExportFormModal from "../components/forms/ExportFormModal";
import LoadInDefinition from "../components/EditDefinition/LoadInDefinition";
import EditDefinition from "../components/EditDefinition/EditDefinition";
import * as miscUtilities from "../utils/miscUtilities";
import * as JSONEditor from "../utils/JSONEditor.js";
import SolarTaxonomyMaster from "@/assets/master_files/Master-Solar-Taxonomy-040120.json";
import OBOpenAPIMaster from "@/assets/master_files/Master-OB-OpenAPI-030420.json";
import FileSaver from "file-saver";

export default {
  components: {
    UploadOBTree,
    DetailedNodeView,
    CreateDefinitionForm,
    ExportFormModal,
    EditDefinition,
    LoadInDefinition
  },
  created() {
    let viewObjsArr = JSON.parse(miscUtilities.readCookie('viewObjs'))
    for (let i in viewObjsArr) {
      this.$store.commit("addViewObj", {
        el: viewObjsArr[i],
        mode: 'init'
      });
    }
    this.$store.state.loadedFiles["Master-Solar-Taxonomy-040120.json"] = {
      fullFileForExport: SolarTaxonomyMaster,
      file: SolarTaxonomyMaster.components.schemas,
      fileName: "Master-Solar-Taxonomy-040120.json"
    };

    this.$store.state.loadedFiles["Master-OB-OpenAPI-030420.json"] = {
      fullFileForExport: OBOpenAPIMaster,
      file: OBOpenAPIMaster.components.schemas,
      fileName: "Master-OB-OpenAPI-030420.json"
    };

    this.file = this.$store.state.loadedFiles["Master-OB-OpenAPI-030420.json"];
    this.loadDependencyFile()
  },
  data() {
    return {
      file: null,
      expandAllObjects: true,
      detailedView: true,
      editorView: false,
      allNodesFlat: [],
      numOfElem: 50,
      showLoadMore: false,
      filteredCount: 0,
      tabs: [],
      tabCounter: 0,
      showAddFileModal: false,
      tabIndexFileUpload: null,
      tabIndexEditorView: null,
      readOnly: false,
      selectedIndex: null,
      selectedDependencyFileName: null,
      selectedDependencyInfo: null,
      dbList: {
        "Master-Solar-Taxonomy-040120.json": {
          information:
            "This is the latest release of the Orange Button Solar Taxonomy",
          fileName: "Master-Solar-Taxonomy-040120.json"
        },
        "Master-OB-OpenAPI-030420.json": {
          information:
            "This is the latest release of the Orange Button OpenAPI Master Document",
          fileName: "Master-OB-OpenAPI-030420.json"
        }
      },
      fileAlreadyOpened: false,
      currentTabIndex: null,
      newFileForm: {
        fileTitle: "",
        fileDescription: "",
        fileName: ""
      },
      missingRefsRequired: [],
      showMissingRefsErr: false,
      treeSearchTerm: ""
    };
  },
  methods: {
    getArrItemType(arrItemRef) {
      return miscUtilities.getArrayItemType(
        arrItemRef,
        this.$store.state.loadedFiles,
        this.$store.state.currentFile
      );
    },
    fileToJSON() {
      if (this.file) {
        let reader = new FileReader();
        reader.readAsText(this.file);
        reader.onload = () => {
          this.$store.commit("updateOriginalJSONFile", reader.result);
        };

        reader.onerror = function() {
          console.log(reader.error);
        };
      }
    },
    createFile() {
      let defnFileTitle = this.newFileForm.fileTitle;
      let defnFileDescription = this.newFileForm.fileDescription;
      let defnFileName = this.newFileForm.fileName;

      let check_duplicate_file = false;

      if (!defnFileTitle) {
        defnFileTitle = "Placeholder Title";
      }

      if (!defnFileDescription) {
        defnFileDescription = "Placeholder Description";
      }

      if (!defnFileDescription) {
        defnFileName = "OB-OpenAPI-DefnFile.json";
      }

      let newFileObj = JSONEditor.createNewDefnFile(
        defnFileTitle,
        defnFileDescription,
        defnFileName
      );

      for (let i in this.$store.state.fileTabs) {
        if (this.$store.state.fileTabs[i].fileName == newFileObj.fileName) {
          check_duplicate_file = true;
        }
      }

      if (check_duplicate_file) {
        this.fileAlreadyOpened = true;
      } else {
        this.$store.state.fileTabs.push(newFileObj);
        this.showAddFileModal = false;
        this.$store.state.loadedFiles[this.newFileForm.fileName] = newFileObj;
      }
    },

    fromSuperClass(childNode) {
      if (childNode["fromSuperClass"]) {
        return true;
      } else {
        return false;
      }
    },
    exportFile() {
      this.$store.commit("exportFile");
    },
    showCreateDefinitionForm() {
      this.$store.commit("selectNone");
      this.$store.commit("showCreateDefinitionForm");
      this.$store.commit("refreshCreateDefnInputs", true);
    },
    showLoadInDefinitionForm() {
      this.$store.commit("selectNone");
      this.$store.commit("showLoadInDefinitionForm");
    },
    toggleExpandAll() {
      this.expandAllObjects = !this.expandAllObjects;
    },
    objectRef(nodeName, fileName) {
      return fileName + "-" + nodeName + "-root";
    },
    setExportFile(fileToExportType) {
      let fileToExport = null;
      let exportModalHeader = "";
      if (fileToExportType === "taxonomy") {
        fileToExport = this.$store.state.currentFile.fullFileForExport;
        exportModalHeader = "Save as...";
      } else if (fileToExportType === "sampleJSON") {
        fileToExport = miscUtilities.getSampleJSON(this.$store.state.currentFile.fileName, this.$store.state);
        exportModalHeader = "Create Sample JSON";
      }
      this.$store.commit("setFileToExport", {
        fileToExport: fileToExport,
        fileToExportName: this.$store.state.currentFile.fileName,
        exportModalHeader: exportModalHeader
      });
    },
    exportModalOpened(fileToExportType) {
      this.setExportFile(fileToExportType);
      this.$store.commit("setShowExportModal", true);
    },
    // returns object containing all children of the superClass and subClass with no duplicates, while labeling objects/elements that are inherited for signifying
    subClassChildren(file, superClassRef, subClassObj, key) {
      return miscUtilities.getSuperClassChildren(
        file,
        superClassRef,
        subClassObj,
        null,
        key,
        this.$store.state.loadedFiles
      );
    },
    getArrayItemAsChildren(file, arrayItemRef, key) {
      return miscUtilities.getArrayItemAsChildren(
        file,
        arrayItemRef,
        key,
        this.$store.state.loadedFiles
      );
    },

    loadMore() {
      this.numOfElem += 50;
      if (this.numOfElem + 1 >= this.filteredCount) {
        this.showLoadMore = false;
      } else {
        this.showLoadMore = true;
      }
    },

    selectDBFile(index, name) {
      this.selectedIndex = index;
      this.selectedDependencyFileName = this.dbList[name]["fileName"];
      this.selectedDependencyInfo = this.dbList[name]["information"];
      this.file = this.$store.state.loadedFiles[name];
    },
    unSelectFile() {
      this.file = null;
      this.showMissingRefsErr = false;
      this.fileAlreadyOpened = false;
    },
    loadFile() {
      let refsRequired = [];
      this.missingRefsRequired = [];
      this.showMissingRefsErr = false;
      let file_obj = {
        fileName: this.file.name
      };

      let reader = new FileReader();
      let check_duplicate_file = false;

      reader.readAsText(this.file);
      reader.onload = () => {
        file_obj["fullFileForExport"] = JSON.parse(reader.result);
        file_obj["file"] = file_obj["fullFileForExport"].components.schemas;
        for (let i in this.$store.state.fileTabs) {
          if (this.$store.state.fileTabs[i].fileName == file_obj.fileName) {
            check_duplicate_file = true;
          }
        }

        if (check_duplicate_file) {
          this.fileAlreadyOpened = true;
        } else {
          this.$store.state.fileTabs.push(file_obj);
          this.showAddFileModal = false;
          this.$store.commit("loadFile", file_obj);
        }
      };
    },
    cancelLoadModal() {
      this.showAddFileModal = false;
    },
    closeTabWarning() {
      this.closeTab(this.$store.state.currentTabIndexFileEditor);
      this.$bvModal.hide("modal-close-file-warning");
    },
    closeTab(x) {
      this.$store.commit("removeFile", this.$store.state.currentFile.fileName);
      this.$store.state.currentFile = null;
      this.$store.state.fileTabs.splice(x, 1);
      this.$store.state.currentFile = this.$store.state.fileTabs[
        this.$store.state.currentTabIndexFileEditor
      ];
    },
    getNodeDescription(nodeObj) {
      return nodeObj["description"];
    },
    loadDependencyFile() {
      let check_duplicate_file = false;
      let file_obj = this.file;
      for (let i in this.$store.state.fileTabs) {
        if (this.$store.state.fileTabs[i].fileName == file_obj.fileName) {
          check_duplicate_file = true;
        }
      }

      if (check_duplicate_file) {
        this.fileAlreadyOpened = true;
      } else {
        this.$store.state.fileTabs.push(file_obj);
        this.showAddFileModal = false;
      }
    },
    defnRef(nodeName, fileName) {
      let defnRef =
        "root" + "-" + miscUtilities.generateUniqueRef(nodeName, fileName);
      return defnRef;
    },
    defnRefParentTrailStart(nodeName, fileName) {
      return miscUtilities.generateUniqueRef(nodeName, fileName, "root");
    },
    isViewObj(el) {
      if (this.$store.state.viewObjs.includes(el)) {
        return true
      } else {
        return false
      }
    }
  },
  watch: {
    treeSearchTerm() {
        this.$store.commit('reRenderList')
        this.$store.commit('clearEditorView')
    },
    tabIndexFileUpload() {
      this.selectedIndex = null;
      this.selectedDependencyFileName = null;
      this.selectedDependencyInfo = null;
      this.file = null;
      this.newFileForm.fileTitle = null;
      this.newFileForm.fileDescription = null;
      this.newFileForm.fileName = null;
    },
    "$store.state.currentTabIndexFileEditor"() {
      this.$store.state.currentFile = this.$store.state.fileTabs[
        this.$store.state.currentTabIndexFileEditor
      ];

      this.$store.state.showDetailedView = false;
      this.$store.state.showEditNodeView = false;
      this.$store.state.showCreateDefinitionForm = false;

      this.$store.state.isSelected = null;
      this.$store.state.nameRef = null;
    },
    file() {
      this.fileToJSON();
    },

    "$store.state.selectDefinitionNode"() {
      let yCoord = 0;
      let notRoot = false;
      let firstHyphenIndex = 0;
      let secondHyphenIndex = 0;
      let nameRefOfRoot = "";

      if (!this.$store.state.nameRef.includes("root-")) {
        notRoot = true;
        firstHyphenIndex = this.$store.state.nameRef.indexOf("-");
        secondHyphenIndex = this.$store.state.nameRef.indexOf(
          "-",
          firstHyphenIndex + 1
        );
        nameRefOfRoot =
          "root-" +
          this.$store.state.nameRef.slice(0, firstHyphenIndex + 1) +
          this.$store.state.nameRef.slice(secondHyphenIndex + 1);
      }

      if (this.$store.state.selectDefinitionNode == true && notRoot) {
        if (
          this.$store.state.selectDefinitionNode == true &&
          this.$store.state.nodeType != "object"
        ) {
          yCoord = this.$refs[nameRefOfRoot][0].$el.offsetTop;

          this.$refs.treeContainer.scrollTop = yCoord - 200;
          this.$store.commit("toggleSelectDefinitionNode");
          this.$store.state.nameRef = nameRefOfRoot;
        } else if (
          this.$store.state.selectDefinitionNode == true &&
          this.$store.state.nodeType == "object"
        ) {
          yCoord = this.$refs[nameRefOfRoot][0].$el.offsetTop;

          this.$refs.treeContainer.scrollTop = yCoord - 200;
          this.$store.state.nameRef = nameRefOfRoot;
          this.$store.commit("toggleSelectDefinitionNode");
        }
        this.$store.state.nodeParent = "root";
      }
    },

    "$store.state.inXBRLTab"() {
      this.numOfElem = 50;
      this.$store.state.treeSearchTerm = "";
      this.$store.state.showDetailedView = false;
      this.$store.state.nameRef = "";
      this.$store.state.showEditNodeView = false;
      this.$store.state.showCreateDefinitionForm = false;
    },

    showAddFileModal() {
      this.file = null;
      this.fileAlreadyOpened = false;
      this.showMissingRefsErr = false;
    },
    tabIndex() {
      this.readOnly = false;
      this.file = null;
      this.selectedIndex = null;
      this.selectedDependencyInfo = null;
      this.selectedDependencyFileName = null;
    },

    file() {
      if (this.file) {
        // console.log(this.file.name)
      } else {
        // console.log(this.file)
      }
    },
    selectedIndex() {
      this.readOnly = false;
    },
    filteredCount() {
      this.numOfElem = 50;
      if (this.numOfElem + 1 >= this.filteredCount) {
        this.showLoadMore = false;
      } else {
        this.showLoadMore = true;
      }
    }
  },
  computed: {
    fileTabs() {
      return this.$store.state.fileTabs;
    },
    sortedObjects() {
      let obj_lst = [];
      let el_lst = [];
      let arr_lst = [];
      let arr_item = "";
      let immutable_lst = [];
      let superClass_lst = [];
      let subClass_obj = {};
      let immutable_OB = [
        "Value",
        "Unit",
        "Decimals",
        "Precision",
        "TaxonomyElementString",
        "TaxonomyElementNumber",
        "TaxonomyElementInteger",
        "TaxonomyElementBoolean"
      ];
      let nodeType = "";
      let defnRef = "";
      let refFileContext = "LOCAL";
      let isLocal = true;

      let isTaxonomyElement = false;

      //file parameter is the local file
      //fileReference is the reference file
      let fileReference = this.$store.state.currentFile.file;

      if (fileReference) {
        Object.keys(fileReference).forEach(key => {
          isTaxonomyElement = false;
          isLocal = true;
          superClass_lst = [];
          fileReference = this.$store.state.currentFile.file;
          let isViewObj = this.isViewObj(key)

          defnRef = miscUtilities.getDefnRef(
            fileReference,
            key,
            null,
            this.$store.state.loadedFiles
          );

          refFileContext = miscUtilities.getRefFileContext(defnRef);

          if (refFileContext != "LOCAL") {
            fileReference = this.$store.state.loadedFiles[refFileContext][
              "file"
            ];
            isLocal = false;
          }

          if (fileReference[key]["type"] == "object") {
            nodeType = "Object";
            obj_lst.push([
              key,
              fileReference[key],
              nodeType,
              fileReference,
              isLocal,
              isViewObj
            ]);
          } else if (fileReference[key]["allOf"]) {
            for (let i in fileReference[key]["allOf"]) {
              if (fileReference[key]["allOf"][i]["$ref"]) {
                superClass_lst.push(fileReference[key]["allOf"][i]["$ref"]);
              } else {
                subClass_obj = fileReference[key]["allOf"][i];
              }
            }
            nodeType = "";

            // check if TaxonomyElement, if it only has 1 ref and that ref includes TaxonomyElement in string
            if (superClass_lst.length == 1) {
              for (let i in superClass_lst) {
                if (superClass_lst[i].includes("TaxonomyElement")) {
                  isTaxonomyElement = true;
                }
              }
            }

            if (isTaxonomyElement) {
              nodeType = "TaxonomyElement";
              el_lst.push([
                key,
                subClass_obj,
                nodeType,
                superClass_lst,
                fileReference,
                isLocal
              ]);
            } else {
              nodeType = "ObjWithInherit";
              obj_lst.push([
                key,
                subClass_obj,
                nodeType,
                superClass_lst,
                fileReference,
                isLocal
              ]);
            }
          } else if (fileReference[key]["type"] == "array") {
            nodeType = "Array";
            arr_item = fileReference[key]["items"]["$ref"];
            arr_lst.push([
              key,
              fileReference[key],
              nodeType,
              fileReference,
              isLocal,
              arr_item
            ]);
          } else {
            immutable_lst.push([
              key,
              fileReference[key],
              fileReference,
              isLocal
            ]);
          }
        });

        obj_lst.sort();
        el_lst.sort();
        immutable_lst.sort();
        arr_lst.sort();
        let returnArr = obj_lst
          .concat(arr_lst)
          .concat(el_lst)
          .concat(immutable_lst);

        if (this.$store.state.viewerMode == 'Edit Mode') {
          returnArr = returnArr.filter(node => {
              return miscUtilities.wildcardSearch(node[0].toLowerCase(), this.treeSearchTerm.toLowerCase());
          });
        } else if (this.$store.state.viewerMode == 'View Mode') {
          returnArr = returnArr.filter(node => {
              return miscUtilities.viewObjFilter(node[0], this.$store.state.viewObjs);
          });
        }
        this.filteredCount = returnArr.length;
        return returnArr.slice(0, this.numOfElem);
      }
    },
    computedFile() {
      return this.$store.state.currentFile;
    }
  }
};
</script>

<style>
.ob-editor-container {
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 54px 1fr 50px;
  background-color: #f7f7f7;
}

.element-selector-body {
  grid-column: 1 / 2;
  grid-row: 1 / span 2;
  border: #d3d3d3 solid 1px;
  overflow-y: auto;
  overflow-x: auto;
  display: grid;
  background-color: white;
}

.enable-scroll {
}

.element-selector-footer {
  grid-column: 1 / 2;
  grid-row: 3 /4;
  border: #d3d3d3 solid 1px;
  padding-left: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.element-editor-header {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  border-top: #d3d3d3 solid 1px;
  border-right: #d3d3d3 solid 1px;
  border-left: #d3d3d3 solid 1px;
  padding-left: 15px;
  display: grid;
  grid-template-columns: .3fr .7fr;
}

.editor-header {
  display: flex;
  justify-content: left;
  align-items: center;
  grid-column: 1 / span 2;
  grid-row: 1 / 2;
  padding-top: 5px;
}

.download-button-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  padding-bottom: 4px;
  padding-top: 4px;
  padding-right: 15px;
}

.element-editor-body {
  grid-column: 2 / 3;
  grid-row: 2 / span 2;
  border: #d3d3d3 solid 1px;
  overflow-y: auto;
}

.element-editor-footer {
  grid-column: 2 / 3;
  grid-row: 3 /4;
  /* border: #d3d3d3 solid 1px; */
}

.btn {
  margin-left: 5px;
}

.tabs-selector {
  min-height: 100%;
}

.tree-search {
  grid-row: 1 / 2;
  display: flex;
  align-items: center;
  padding-left: 15px;
  width: 559px;
}

.file-tabs {
}

.load-more-btn-container {
  margin-top: 5px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.modal-tabs-container {
}

#modal-center___BV_modal_body_ {
  padding: 0px;
}

#modal-center___BV_modal_header_ {
  border-bottom: none;
}

#modal-tabs-inside {
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 10px;
  height: 300px;
}

#modal-header- {
}

#modal-header-inline {
  display: inline-block;
}

#info-circle- {
  margin-left: 6px;
  margin-bottom: 5px;
  height: 18px;
  width: 18px;
}

.was-validated .custom-file-input:invalid ~ .custom-file-label,
.custom-file-input.is-invalid ~ .custom-file-label {
  border-color: #dee2e6 !important;
}

#selected-file-txt {
  display: flex;
  justify-content: center;
  align-items: center;
}

#readonly-checkbox {
  display: flex;
  justify-content: center;
  align-items: center;
}

.database-selector-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.database-selector-list {
  grid-column: 1 / 2;
  border: 1px solid black;
  margin: 10px;
  margin-top: 0px;
  height: 280px;
}

.database-selector-list-information {
  grid-column: 2 / 3;
}

#db-in-list {
  list-style: none;
  border-bottom: 1px solid black;
}

#db-in-list {
  padding-left: 5px;
}

#file-duplicate-error {
  margin-top: 0px;
}

#missing-ref-error {
  margin-top: 0px;
}

.alert {
  margin-bottom: 0px !important;
}

.tab-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.tab-pane {
  height: 100%;
}

#unSelectFile-btn {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card-header {
  border-radius: 0px !important;
}

#no-body-card {
  border: none;
}

#tab-close {
  margin-bottom: 1px;
  margin-left: 6px;
  border-radius: 50%;
  height: 18px;
  width: 18px;
  padding: 2px;
}

#tab-close:hover {
  background-color: #dbdbdc;
}

.card-body {
  padding: 0px !important;
  padding-top: 5px !important;
}

#new-file-form {
  padding: 5px 25px 10px 25px;
}

.tree-search-bar {
  margin-top: 5px;
  margin-bottom: 10px;
}

.load-more-btn-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.nav-tabs .nav-link {
  border: 1px solid #e6e9ec !important;
}

.nav-tabs .nav-link.active,
.nav-tabs .nav-item.show .nav-link {
  color: #495057 !important;
  background-color: #fff !important;
  border-color: #d3d3d3 #d3d3d3 #fff !important;
}
</style>
