import Vue from "vue";
import Vuex from "vuex";
import * as JSONEditor from "../utils/JSONEditor.js";
import * as miscUtilities from "../utils/miscUtilities";
import FileSaver from "file-saver";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    uploadedOASFileOriginal: null,
    schemaFile: null,
    allNodesFlat: [],
    allObjNodesFlat: [],
    selectorFile: null,
    isSelected: null,
    nodeName: null,
    nodeType: null,
    nodeParent: null,
    nodeParentTrail: null,
    nodeDescription: null,
    nodeEnum: null,
    nameRef: null,
    showEditNodeView: false,
    showDetailedView: true,
    listOfDefinitionElements: [],
    selectDefinitionNode: false,
    showCreateDefinitionForm: false,
    showLoadInDefinitionForm: false,
    nodeToAddToObject: "",
    nodeToAddListType: "",
    superClassToRemoveFromObject: "",
    refreshCreateDefn: false,
    isSubClassedNode: false,

    // controls if the ExportFormModal is showing or not
    exportModalOpened: false,
    xbrlFlat: [],

    //tracks whether you are in the OAS tab or the XBRL tab
    inOASTab: true,
    inXBRLTab: false,

    treeSearchTerm: "",

    //tabs update
    fileTabs: [],
    currentTabIndexFileEditor: null,
    currentFile: null,

    //taxonomy element update
    isTaxonomyElement: false,

    // get rid of master Files. just have loadedFiles, which will include master files you can't delete

    masterFiles: {},
    loadedFiles: {},
    selectedFileName: "",
    selectedDefnRefFile: null,

    fileToExport: null,
    fileToExportName: "",
    exportModalHeader: "",

    defnIsLocal: null,

    activeEditingView: "EditDefinitionFormDisabled",

    // after abbrev update

    nodeOBType: "",
    nodeOBUnit: "",
    nodeOBEnum: "",
    nodeOBUsageTips: "",
    nodeOBSampleValue: {},

    // viewer mode option, can either be 'View Mode' or 'Edit Mode'
    viewerMode: 'View Mode',
    viewObjs: [],

    // refresh key is needed to re-render element list when switching between edit and view modes
    refreshKey: null
  },
  mutations: {
    /*
      Add sample value to object
    */
    addSampleValue(state, sampleValue) {
      state.nodeOBSampleValue = sampleValue
      // check if it is an allOf obj or a regular obj
      // should move function to JSONEditor
      // should use type to check if allOf, Obj or TaxElem
      if (state.currentFile.file[state.isSelected]["allOf"]) {
        for (let i in state.currentFile.file[state.isSelected]["allOf"]) {
          if (state.currentFile.file[state.isSelected]["allOf"][i]["type"]) {
            state.currentFile.file[state.isSelected]["allOf"][i]["x-ob-sample-value"] = sampleValue;
          }
        }
      } else {
        state.currentFile.file[state.isSelected]["x-ob-sample-value"] = sampleValue;
      }
    },
    /*
      Add usage tips to object
    */
    addUsageTips(state, usageTips) {
      state.nodeOBUsageTips = usageTips
      // check if it is an allOf obj or a regular obj
      // should move function to JSONEditor
      // should use type to check if allOf, Obj or TaxElem
      if (state.currentFile.file[state.isSelected]["allOf"]) {
        for (let i in state.currentFile.file[state.isSelected]["allOf"]) {
          if (state.currentFile.file[state.isSelected]["allOf"][i]["type"]) {
            state.currentFile.file[state.isSelected]["allOf"][i]["x-ob-usage-tips"] = usageTips;
          }
        }
      } else {
        state.currentFile.file[state.isSelected]["x-ob-usage-tips"] = usageTips;
      }
    },

    /* 
      Add enumeration to object
    */
    addEnumToObject(state, _enum) {
      JSONEditor.addEnum(state.currentFile.file, state.isSelected, _enum);
      state.nodeEnum = state.currentFile.file[state.isSelected]["enum"];
      for (let i in state.currentFile.file[state.isSelected]["allOf"]) {
        if (state.currentFile.file[state.isSelected]["allOf"][i]["type"]) {
          if (state.currentFile.file[state.isSelected]["allOf"][i]["enum"]) {
            state.nodeEnum =
              state.currentFile.file[state.isSelected]["allOf"][i]["enum"];
          }
        }
      }
    },

    /*
      Remove enumeration from object
    */
    removeEnumFromObject(state, _enum) {
      JSONEditor.removeEnum(state.currentFile.file, state.isSelected, _enum);

      //check if empty enum array to set nodeEnum to null, will not react automatically for some reason
      for (let i in state.currentFile.file[state.isSelected]["allOf"]) {
        if (state.currentFile.file[state.isSelected]["allOf"][i]["type"]) {
          if (!state.currentFile.file[state.isSelected]["allOf"][i]["enum"]) {
            state.nodeEnum = null;
          }
        }
      }
    },

    /*
      Add member to object
    */
    addNodeToObject(state, payload) {
      let parentDefnName = payload.parentName;
      let childDefnName = payload.defnToAddName;
      let childRefFile = state.loadedFiles[payload.referenceFileName];
      let workingFile = state.currentFile;

      JSONEditor.addChildToObject(
        workingFile,
        parentDefnName,
        childDefnName,
        childRefFile
      );
    },

    /*
      Edit definition 
    */
    editNode(state, payload) {
      JSONEditor.editNode(
        state.currentFile.file,
        payload.nodeName,
        payload.nodeDescription
      );
      state.nodeDescription = payload.nodeDescription;
    },

    /*
      Add Inheritance
    */
    addSuperClass(state, payload) {
      let workingFile = state.currentFile.file;
      let subClassName = state.isSelected;
      let superClassName = payload.superClassName;
      let superClassRefFileName = payload.superClassRefFileName;

      JSONEditor.addSuperClass(
        workingFile,
        subClassName,
        superClassName,
        superClassRefFileName,
        state.loadedFiles
      );
    },

    /*
      Remove Inheritance
    */
    removeSuperClass(state, superClassName) {
      JSONEditor.removeSuperClass(
        state.currentFile.file,
        state.isSelected,
        superClassName
      );
    },

    /*
      Tree view handling
    */
    toggleSelectDefinitionNode(state) {
      state.selectDefinitionNode = false;
    },
    selectNode(state, payload) {
      state.isSelected = payload.nodeName;
      state.nodeName = payload.nodeName;
      state.nodeParent = payload.nodeParent;
      state.nodeParentTrail = payload.nodeParentTrail;

      state.nodeType = payload.nodeType;
      state.nodeDescription = payload.nodeDescription;
      state.nameRef = payload.nameRef;
      state.isSubClassedNode = payload.isSubClassedNode;
      state.isTaxonomyElement = payload.isTaxonomyElement;
      state.selectedFileName = payload.selectedFileName;
      state.defnIsLocal = payload.isLocal;

      state.selectedDefnRefFile = payload.referenceFile;
      state.activeEditingView = "EditDefinitionFormDisabled";

      if (state.selectedDefnRefFile[state.isSelected]["allOf"]) {
        for (let i in state.selectedDefnRefFile[state.isSelected]["allOf"]) {
          if (state.selectedDefnRefFile[state.isSelected]["allOf"][i]["type"]) {
            if (
              state.selectedDefnRefFile[state.isSelected]["allOf"][i]["enum"]
            ) {
              state.nodeEnum =
                state.selectedDefnRefFile[state.isSelected]["allOf"][i]["enum"];
            } else {
              state.nodeEnum = null;
            }

            if (
              state.selectedDefnRefFile[state.isSelected]["allOf"][i][
              "x-ob-item-type"
              ]
            ) {
              state.nodeOBType =
                state.selectedDefnRefFile[state.isSelected]["allOf"][i][
                "x-ob-item-type"
                ];
            } else {
              state.nodeOBType = "";
            }

            if (
              state.selectedDefnRefFile[state.isSelected]["allOf"][i][
              "x-ob-unit"
              ]
            ) {
              state.nodeOBUnit =
                state.selectedDefnRefFile[state.isSelected]["allOf"][i][
                "x-ob-unit"
                ];
            } else {
              state.nodeOBUnit = "";
            }

            if (
              state.selectedDefnRefFile[state.isSelected]["allOf"][i][
              "x-ob-enum"
              ]
            ) {
              state.nodeOBEnum =
                state.selectedDefnRefFile[state.isSelected]["allOf"][i][
                "x-ob-enum"
                ];
            } else {
              state.nodeOBEnum = "";
            }

            if (
              state.selectedDefnRefFile[state.isSelected]["allOf"][i][
              "x-ob-usage-tips"
              ]
            ) {
              state.nodeOBUsageTips =
                state.selectedDefnRefFile[state.isSelected]["allOf"][i][
                "x-ob-usage-tips"
                ];
            } else {
              state.nodeOBUsageTips = "";
            }

            if (
              state.selectedDefnRefFile[state.isSelected]["allOf"][i][
              "x-ob-sample-value"
              ]
            ) {
              state.nodeOBSampleValue =
                state.selectedDefnRefFile[state.isSelected]["allOf"][i][
                "x-ob-sample-value"
                ];
            } else {
              state.nodeOBSampleValue = {};
            }
          }
        }
      } else if (state.selectedDefnRefFile[state.isSelected]["type"] == "object") {
        if (
          state.selectedDefnRefFile[state.isSelected][
          "x-ob-usage-tips"
          ]
        ) {
          state.nodeOBUsageTips =
            state.selectedDefnRefFile[state.isSelected][
            "x-ob-usage-tips"
            ];
        } else {
          state.nodeOBUsageTips = "";
        }
      } else if (state.selectedDefnRefFile[state.isSelected]["type"] == "array") {
        if (
          state.selectedDefnRefFile[state.isSelected][
          "x-ob-usage-tips"
          ]
        ) {
          state.nodeOBUsageTips =
            state.selectedDefnRefFile[state.isSelected][
            "x-ob-usage-tips"
            ];
        } else {
          state.nodeOBUsageTips = "";
        }
      } else {
        state.nodeEnum = null;
        state.nodeOBEnum = "";
        state.nodeOBType = "";
        state.nodeOBUnit = "";
        state.nodeOBUsageTips = "";
      }
    },

    /*
      Editor view handling
    */
    showDetailedView(state) {
      state.showEditNodeView = false;
      state.showDetailedView = true;
      state.showCreateDefinitionForm = false;
      state.showLoadInDefinitionForm = false;
    },

    /* 
      JSON file handling
    */
    updateOriginalJSONFile(state, json_str) {
      // uploadedOASFileOriginal is used for exporting
      // schemaFile is used for referencing the schema object in uploadedOASFileOriginal
      // schemaFile is used for referencing the definition object in schema in uploadedOASFileOriginal

      state.uploadedOASFileOriginal = JSON.parse(json_str);
      state.schemaFile = state.uploadedOASFileOriginal.components.schemas;

      // replace all instances of schemaFile with schemaFile. schemaFile is no longer needed as we took out the definition obj.
      // state.schemaFile = state.schemaFile
      JSONEditor.createArrayOfAllElementDefinitions(
        state.schemaFile,
        state.listOfDefinitionElements
      );
    },
    deleteNode(state, payload) {
      if (state.nodeParent == "root") {
        JSONEditor.deleteAllNodes(payload.currentFile, state.nodeName);
      } else {
        JSONEditor.deleteNode(
          payload.currentFile,
          payload.nodeName,
          payload.parent
        );
      }
    },
    toggleSelectNode(state) {
      state.isSelected = false;
    },
    showEditNodeView(state) {
      state.showDetailedView = false;
      state.showEditNodeView = true;
      state.selectDefinitionNode = true;
    },

    showCreateDefinitionForm(state) {
      state.showCreateDefinitionForm = true;
      state.showDetailedView = false;
      state.showCreateNodeObjectView = false;
      state.showEditNodeView = false;
      state.showLoadInDefinitionForm = false;
    },
    showLoadInDefinitionForm(state) {
      state.showLoadInDefinitionForm = true;
      state.showDetailedView = false;
      state.showCreateNodeObjectView = false;
      state.showEditNodeView = false;
      state.showCreateDefinitionForm = false;
    },
    createNodeElement(state, payload) {
      let node_attr = {
        type: payload.nodeType,
        description: payload.nodeElementDescription
      };
      Vue.set(
        state.schemaFile.definitions.properties,
        payload.nodeName,
        node_attr
      );
    },
    exportFile(state, payload) {
      let jsonFileToExport = new Blob(
        [JSON.stringify(payload.file, null, 2)],
        { type: "application/json" }
      );
      FileSaver.saveAs(jsonFileToExport, payload.filename + ".json");
    },
    selectNone(state) {
      state.isSelected = null;
      state.nodeName = null;
      state.nodeType = null;
      state.nodeDescription = null;
      state.nameRef = null;
    },
    createNodeObject(state, payload) {
      JSONEditor.createNodeObject(
        state.schemaFile,
        payload.objectName,
        payload.objectDescription,
        payload.elementForms
      );
    },

    createDefinition(state, payload) {
      let defn_attr = {};

      if (payload.definitionType == "OB Object") {
        defn_attr = {
          type: "object",
          description: payload.definitionDescription,
          properties: {}
        };
      } else if (payload.definitionType == "OB Taxonomy Element String") {
        defn_attr = {
          allOf: [
            {
              $ref:
                "Master-Solar-Taxonomy.json#/components/schemas/TaxonomyElementString"
            },
            {
              type: "object",
              description: payload.definitionDescription,
              "x-ob-item-type": payload.OBItemType,
              "x-ob-unit": payload.OBUnits,
              "x-ob-enum": payload.OBEnum,
              "x-ob-usage-tips": payload.OBUsageTips,
              "x-ob-sample-value": payload.OBSampleValue
            }
          ]
        };
      } else if (payload.definitionType == "OB Taxonomy Element Number") {
        defn_attr = {
          allOf: [
            {
              $ref:
                "Master-Solar-Taxonomy.json#/components/schemas/TaxonomyElementNumber"
            },
            {
              type: "object",
              description: payload.definitionDescription,
              "x-ob-item-type": payload.OBItemType,
              "x-ob-unit": payload.OBUnits,
              "x-ob-enum": payload.OBEnum,
              "x-ob-usage-tips": payload.OBUsageTips,
              "x-ob-sample-value": payload.OBSampleValue
            }
          ]
        };
      } else if (payload.definitionType == "OB Taxonomy Element Integer") {
        defn_attr = {
          allOf: [
            {
              $ref:
                "Master-Solar-Taxonomy.json#/components/schemas/TaxonomyElementInteger"
            },
            {
              type: "object",
              description: payload.definitionDescription,
              "x-ob-item-type": payload.OBItemType,
              "x-ob-unit": payload.OBUnits,
              "x-ob-enum": payload.OBEnum,
              "x-ob-usage-tips": payload.OBUsageTips,
              "x-ob-sample-value": payload.OBSampleValue
            }
          ]
        };
      } else if (payload.definitionType == "OB Taxonomy Element Boolean") {
        defn_attr = {
          allOf: [
            {
              $ref:
                "Master-Solar-Taxonomy.json#/components/schemas/TaxonomyElementBoolean"
            },
            {
              type: "object",
              description: payload.definitionDescription,
              "x-ob-item-type": payload.OBItemType,
              "x-ob-unit": payload.OBUnits,
              "x-ob-enum": payload.OBEnum,
              "x-ob-usage-tips": payload.OBUsageTips,
              "x-ob-sample-value": payload.OBSampleValue
            }
          ]
        };
      } else if (payload.definitionType == "OB Array") {
        defn_attr = {
          type: "array",
          items: {
            $ref:
              payload.arrayItemFileName +
              "#/components/schemas/" +
              payload.arrayItemDefnName
          }
        };
      }

      Vue.set(state.currentFile.file, payload.definitionName, defn_attr);
    },
    // Refreshes form inputs when trying to hit add definition after already adding a defn
    refreshCreateDefnInputs(state, refreshBool) {
      state.refreshCreateDefn = refreshBool;
    },
    setFileToExport(state, payload) {
      state.fileToExport = payload.fileToExport;
      state.fileToExportName = payload.fileToExportName;
      state.exportModalHeader = payload.exportModalHeader;
    },
    setShowExportModal(state, payload) {
      state.exportModalOpened = payload;
    },
    clearEditorView(state) {
      state.showDetailedView = false;
      state.showEditNodeView = false;
      state.showCreateDefinitionForm = false;
      state.isSelected = null;
      state.nameRef = null;
    },

    // when user loads in a file, it is put into the loadedFile object
    // problem: what if someone loads in a file, references it in a new fiile, then unloads the old file. now the new file cant reference the old
    loadFile(state, file) {
      state.loadedFiles[file.fileName] = file;
    },
    removeFile(state, fileName) {
      if (
        !(
          fileName == "Master-Solar-Taxonomy.json" ||
          fileName == "Master-OB-OpenAPI.json"
        )
      ) {
        delete state.loadedFiles[fileName];
      }
    },
    loadInDefinition(state, payload) {
      let defnName = payload.defnName;
      let defnFile = payload.defnFile;
      let currentFile = state.currentFile.file;

      JSONEditor.loadInDefinition(currentFile, defnName, defnFile);
    },
    editItemType(state, payload) {

      state.nodeOBType = payload.OBItemType;
      state.nodeOBUnit = payload.OBUnits;
      state.nodeOBEnum = payload.OBEnum;
      for (let i in state.currentFile.file[state.isSelected]["allOf"]) {
        if (state.currentFile.file[state.isSelected]["allOf"][i]["type"]) {
          Vue.set(
            state.currentFile.file[state.isSelected]["allOf"][i],
            "x-ob-item-type",
            payload.OBItemType
          );
          Vue.set(
            state.currentFile.file[state.isSelected]["allOf"][i],
            "x-ob-unit",
            payload.OBUnits
          );
          Vue.set(
            state.currentFile.file[state.isSelected]["allOf"][i],
            "x-ob-enum",
            payload.OBEnum
          );
        }
      }
    },
    changeViewerMode(state, mode) {
      state.viewerMode = mode
    },
    // params:
    // el: name of element to add or remove
    // mode: 'init' or 'create_cookie'; init is for reading cookies when the app inits
    addViewObj(state, params) {
      state.viewObjs.push(params['el'])
      if (params['mode'] == 'create_cookie') 
        miscUtilities.createCookie('viewObjs', JSON.stringify(state.viewObjs), 500)
    },
    removeViewObj(state, params) {
      for (let i = 0; i < state.viewObjs.length; i++) {
        if (params['el'] == state.viewObjs[i]) {
          state.viewObjs.splice(i, 1)
          break;
        }
      }
      miscUtilities.createCookie('viewObjs', JSON.stringify(state.viewObjs), 500)
    },

    // rerenders node list
    reRenderList(state) {
      state.refreshKey = Math.floor((Math.random() * 100) + 1).toString()
    },
  }
});
