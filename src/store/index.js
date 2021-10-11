import Vue from "vue";
import Vuex from "vuex";
import * as JSONEditor from "../utils/JSONEditor.js";
import * as miscUtilities from "../utils/miscUtilities";
import FileSaver from "file-saver";
import { version } from "../../package.json";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    appVersion: version || 0,
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

    // right pane state while in editing mode
    activeEditingView: "EditDefinitionFormDisabled",
    // right pane state for views
    activeEditorView: null,
    // view state for Item Types Editor
    activeItemTypesView: null,

    // after abbrev update

    nodeOBType: "",
    nodeOBUsageTips: "",
    nodeOBSampleValue: {},

    // viewer mode option, can either be 'View Mode' or 'Edit Mode'
    viewerMode: 'View Mode',
    viewObjs: [],

    // refresh key is needed to re-render element list when switching between edit and view modes
    refreshKey: null,

    // units added to obtaxonomy update
    nodeEnumsOrUnitsObj: null,
    nodeOBItemTypeGroupName: null,
    nodeOBItemTypeGroupObj: {}
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
      Change Name
    */
    changeName(state, payload) {
      JSONEditor.changeName(
        state.currentFile.file,
        payload.nodeName,
        payload.newNodeName
      )
      state.nodeName = payload.newNodeName
      Vue.delete(state.currentFile.file, payload.nodeName)
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

      state.nodeEnumsOrUnitsObj = null
      state.nodeOBType = ''
      state.nodeOBItemTypeGroupName = ''
      state.nodeOBItemTypeGroupObj = {}

      if (state.selectedDefnRefFile[state.isSelected]["allOf"]) {
        for (let i in state.selectedDefnRefFile[state.isSelected]["allOf"]) {
          if (state.selectedDefnRefFile[state.isSelected]["allOf"][i]["type"]) {
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

            if ("x-ob-item-type-group" in state.selectedDefnRefFile[state.isSelected]["allOf"][i]
              && state.selectedDefnRefFile[state.isSelected]["allOf"][i]["x-ob-item-type-group"]) {
                state.nodeOBItemTypeGroupName = state.selectedDefnRefFile[state.isSelected]["allOf"][i]["x-ob-item-type-group"]
              } else {
                state.nodeOBItemTypeGroupName = ''
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
        state.nodeOBType = "";
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
        state.nodeOBType = "";
      } else {
        state.nodeOBType = "";
        state.nodeOBUsageTips = "";
      }

      // set nodeEnumsOrUnitsObj
      if (state.nodeOBType && state.loadedFiles[state.selectedFileName]["item_types"]) {
        state.nodeEnumsOrUnitsObj = state.loadedFiles[state.selectedFileName]["item_types"][state.nodeOBType]
      }

      // set node item type group obj
      if (state.nodeOBItemTypeGroupName && state.loadedFiles[state.selectedFileName]["item_type_groups"]) {
        state.nodeOBItemTypeGroupObj = state.loadedFiles[state.selectedFileName]["item_type_groups"][state.nodeOBItemTypeGroupName]
      }
    },

    /*
      Editor view handling
    */
    showDetailedView(state) {
      state.activeEditorView = "DetailedNodeView"
    },
    showEditNodeView(state) {
      state.activeEditorView = "EditDefinition"
      state.selectDefinitionNode = true;
    },
    showCreateDefinitionForm(state) {
      state.activeEditorView = "CreateDefinitionForm"
    },
    showLoadInDefinitionForm(state) {
      state.activeEditorView = "LoadInDefinition"
    },
    showEditItemTypesMain(state) {
      state.activeEditorView = "EditItemTypesMain"
    },
    showNoView(state) {
      state.activeEditorView = null
    },

    // show state for Item Types Editor
    // todo: consolidate into one function you pass the string to
    showCreateItemType(state) {
      state.activeItemTypesView = "CreateItemType"
    },
    showCreateItemTypeGroup(state) {
      state.activeItemTypesView = "CreateItemTypeGroup"
    },
    showEditItemType(state) {
      state.activeItemTypesView = "EditItemType"
    },
    showEditItemTypeGroup(state) {
      state.activeItemTypesView = "EditItemTypeGroup"
    },
    showViewAllItemTypes(state) {
      state.activeItemTypesView = "ViewAllItemTypes"
    },
    showViewAllItemTypeGroups(state) {
      state.activeItemTypesView = "ViewAllItemTypeGroups"
    },
    showNoItemTypesViews(state) {
      state.activeItemTypesView = null
    },
    showDeleteItemType(state) {
      state.activeItemTypesView = "DeleteItemType"
    },
    showDeleteItemTypeGroup(state) {
      state.activeItemTypesView = "DeleteItemTypeGroup"
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
    // todo: refactor createDefinition, remove repeated code around definition type
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
                "#/components/schemas/TaxonomyElementString"
            },
            {
              type: "object",
              description: payload.definitionDescription,
              "x-ob-item-type": payload.OBItemType,
              "x-ob-item-type-group": payload.OBItemTypeGroup,
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
                "#/components/schemas/TaxonomyElementNumber"
            },
            {
              type: "object",
              description: payload.definitionDescription,
              "x-ob-item-type": payload.OBItemType,
              "x-ob-item-type-group": payload.OBItemTypeGroup,
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
                "#/components/schemas/TaxonomyElementInteger"
            },
            {
              type: "object",
              description: payload.definitionDescription,
              "x-ob-item-type": payload.OBItemType,
              "x-ob-item-type-group": payload.OBItemTypeGroup,
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
                "#/components/schemas/TaxonomyElementBoolean"
            },
            {
              type: "object",
              description: payload.definitionDescription,
              "x-ob-item-type": payload.OBItemType,
              "x-ob-item-type-group": payload.OBItemTypeGroup,
              "x-ob-usage-tips": payload.OBUsageTips,
              "x-ob-sample-value": payload.OBSampleValue
            }
          ]
        };
      } else if (payload.definitionType == "OB Array") {
        let ref = ''
        if (state.currentFile.fileName == payload.arrayItemFileName) {
          ref = "#/components/schemas/" + payload.arrayItemDefnName
        } else {
          ref = payload.arrayItemFileName + "#/components/schemas/" + payload.arrayItemDefnName
        }

        defn_attr = {
          type: "array",
          items: {
            $ref: ref
          }
        };
      }

      Vue.set(state.currentFile.file, payload.definitionName, defn_attr);
    },
    createItemType(state, payload) {
      let finalItemTypeObj = {}
      let finalEnumsOrUnits = {}
      finalItemTypeObj['description'] = payload.itemTypeDescription

      payload.itemTypeEnumsOrUnits.forEach( enumOrUnitObj => {
        finalEnumsOrUnits[enumOrUnitObj['enumOrUnitID']] = {
          "label": enumOrUnitObj['enumOrUnitLabel'],
          "description": enumOrUnitObj['enumOrUnitDescription']
        }
      })

      if (payload.itemTypeType == 'units') {
        finalItemTypeObj['units'] = finalEnumsOrUnits
      } else if (payload.itemTypeType == 'enums') {
        finalItemTypeObj['enums'] = finalEnumsOrUnits
      }

      Vue.set(state.currentFile.item_types, payload.itemTypeName, finalItemTypeObj)

    },
    // edits the item type in the definiton file under obj 'x-ob-item-type'
    editItemTypeDefn(state, payload) {
      let finalEdittedItemTypeObj = {}
      let finalEnumsOrUnits = {}

      finalEdittedItemTypeObj['description'] = payload.itemTypeDescription
      payload.itemTypeEnumsOrUnits.forEach( enumOrUnitObj => {
        finalEnumsOrUnits[enumOrUnitObj['enumOrUnitID']] = {
          "label": enumOrUnitObj['enumOrUnitLabel'],
          "description": enumOrUnitObj['enumOrUnitDescription']
        }
      })

      if (payload.itemTypeType == 'units') {
        finalEdittedItemTypeObj['units'] = finalEnumsOrUnits
      } else if (payload.itemTypeType == 'enums') {
        finalEdittedItemTypeObj['enums'] = finalEnumsOrUnits
      }
      Vue.set(state.currentFile.item_types, payload.itemTypeName, finalEdittedItemTypeObj)

    },
    createItemTypeGroup(state, payload) {
      let finalItemTypeGroupObj = {}
      let finalEnumsOrUnits = []

      if (payload.itemTypeGroupGroup.length) {
        payload.itemTypeGroupGroup.forEach( enumOrUnitObj => {
          finalEnumsOrUnits.push(enumOrUnitObj['enumOrUnitID'])
        })
      }

      finalItemTypeGroupObj = {
        "type": payload.baseItemTypeRef,
        "description": payload.itemTypeGroupDescription,
        "group" : finalEnumsOrUnits
      }

      Vue.set(state.currentFile.item_type_groups, payload.itemTypeGroupName, finalItemTypeGroupObj)
    },
    editItemTypeGroup(state, payload) {
      let finalEdittedItemTypeGroupObj = {}
      let finalEnumsOrUnits = []

      if (payload.itemTypeGroupGroup.length) {
        payload.itemTypeGroupGroup.forEach( enumOrUnitObj => {
          finalEnumsOrUnits.push(enumOrUnitObj['enumOrUnitID'])
        })
      }

      finalEdittedItemTypeGroupObj = {
        "type": payload.baseItemTypeRef,
        "description": payload.itemTypeGroupDescription,
        "group" : finalEnumsOrUnits
      }

      Vue.set(state.currentFile.item_type_groups, payload.itemTypeGroupName, finalEdittedItemTypeGroupObj)
    },
    deleteItemType(state, payload) {
      Vue.delete(state.currentFile.item_types, payload.itemTypeToDelete[0]["itemType"])


    },
    deleteItemTypeGroup(state, payload) {
      Vue.delete(state.currentFile.item_type_groups, payload.itemTypeGroupToDelete[0]["itemTypeGroupName"])


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
      state.activeEditorView = null
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
      let defnNameToLoad = payload.defnName;
      let defnFileToLoadFrom = state.loadedFiles[payload.defnFile]["file"]
      let currentFile = state.currentFile.file;

      JSONEditor.loadInDefinition(currentFile, defnNameToLoad, defnFileToLoadFrom);
    },
    changeItemType(state, payload) {

      state.nodeOBType = payload.OBItemType;

      for (let i in state.currentFile.file[state.isSelected]["allOf"]) {
        if (state.currentFile.file[state.isSelected]["allOf"][i]["type"]) {
          Vue.set(
            state.currentFile.file[state.isSelected]["allOf"][i],
            "x-ob-item-type",
            payload.OBItemType
          )
          state.nodeEnumsOrUnitsObj = state.loadedFiles[state.selectedFileName]["item_types"][state.nodeOBType]

          // if item group for element does not match
          if ("x-ob-item-type-group" in state.currentFile.file[state.isSelected]["allOf"][i]
            && state.currentFile.file[state.isSelected]["allOf"][i]["x-ob-item-type-group"]) {
              let currentItemTypeGroup = state.currentFile.file[state.isSelected]["allOf"][i]["x-ob-item-type-group"]
              if (!state.loadedFiles[state.selectedFileName]["item_type_groups"][currentItemTypeGroup]['type'].includes(payload.OBItemType)) {
                Vue.set(
                  state.currentFile.file[state.isSelected]["allOf"][i],
                  "x-ob-item-type-group",
                  ''
                )
                state.nodeOBItemTypeGroupName = ''
                state.nodeOBItemTypeGroupObj = {}
              }
            }
        }
      }
    },
    changeItemTypeGroup(state, payload) {
      state.nodeOBItemTypeGroupName = payload.OBItemTypeGroupName
      state.nodeOBItemTypeGroupObj = {}
      if (payload.OBItemTypeGroupName) {
        state.nodeOBItemTypeGroupObj = state.loadedFiles[state.selectedFileName]["item_type_groups"][state.nodeOBItemTypeGroupName]
      }

      for (let i in state.currentFile.file[state.isSelected]["allOf"]) {
        if (state.currentFile.file[state.isSelected]["allOf"][i]["type"]) {
          Vue.set(
            state.currentFile.file[state.isSelected]["allOf"][i],
            "x-ob-item-type-group",
            payload.OBItemTypeGroupName
          )          
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
