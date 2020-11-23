<template>
  <div class="ob-tree-container">
    <div
      class="node-wrapper"
      @click="toggleSelect"
      :style="isSelected ? 'background-color: #89CFF0;' : ''"
    >
      <div class="element-div" :style="indent">
        <span @click="toggleExpandDefn">
          <span v-if="isObj">
            <v-icon
              v-if="expandDefn"
              name="minus-square"
              class="icon-expandable clickable"
            />
            <v-icon
              v-if="!expandDefn"
              name="plus-square"
              class="icon-expandable clickable"
              style="cursor: pointer"
            />
          </span>

          <span v-if="isTaxonomyElement">
            <v-icon
              name="circle"
              class="taxonomy-element-icon-expandable clickable"
              style="cursor: pointer"
            />
          </span>

          <span v-if="isArray && arrayItemType == 'Object'">
            <v-icon
              v-if="expandDefn"
              name="minus-square"
              class="icon-expandable clickable"
            />
            <v-icon
              v-if="!expandDefn"
              name="plus-square"
              class="icon-expandable clickable"
              style="cursor: pointer"
            />
          </span>

          <span v-if="isArray && arrayItemType == 'Taxonomy Element'">
            <v-icon
              name="circle"
              class="taxonomy-element-icon-expandable clickable"
              style="cursor: pointer"
            />
          </span>
        </span>

        <span
          :class="{
            subClassSignifier: subClassedNode,
            importedNodeSignifier: importedNode
          }"
        >
          <span v-if="isArray">
            {{ shortenName + " " }}[ {{ arrayItemNameFromRef }} ]
          </span>
          <span v-else>
            {{ shortenName }}
          </span>
        </span>
        <span class="primary-view-icon" v-if="(isObj || isArray) && $store.state.viewerMode == 'Edit Mode' && isTopLevel && isSelected">
            <span @click=addViewObj(name)>
              <v-icon
                name="plus"
                style="cursor: pointer"
                v-if="!viewObjFinal"
              />
            </span>
            <v-icon
              name="regular/eye"
              style="cursor: pointer"
              v-if="viewObjFinal"
            />             
        </span>
        <span class="primary-view-icon" v-if="$store.state.viewerMode == 'View Mode' && viewObjFinal && isTopLevel && isSelected" @click=removeViewObj(name)>
            <v-icon
              name="times"
              style="cursor: pointer; color:red"
            />        
        </span>
      </div>
    </div>

    <span v-if="children">
      <span v-for="(arr, index) in sortedObjects">
        <!-- object -->
        <UploadOBTree
          v-if="expandDefn && arr[3] == 'Object'"
          :name="arr[0]"
          :children="arr[1].properties"
          :depth="depth + 1"
          :nodeDescription="arr[1].description"
          :isObj="true"
          :parent="name"
          :parent_trail="defnRefParentTrail(arr[0], parent_trail)"
          type="object"
          :ref="defnRef(arr[0], file.fileName)"
          :nameRef="defnRef(arr[0], file.fileName)"
          :file="file"
          :isTaxonomyElement="false"
          :subClassedNode="arr[2]"
          :referenceFile="arr[4]"
          :isLocal="arr[5]"
          :viewObj="false"
          :isTopLevel="false"
        ></UploadOBTree>

        <!-- array -->

        <UploadOBTree
          v-else-if="expandDefn && arr[2] == 'Array'"
          :name="arr[0]"
          :children="getArrayItemAsChildren(arr[3], arr[5], arr[0])"
          :depth="depth + 1"
          :expandAllObjects="expandAllObjects"
          :nodeDescription="arr[1].description"
          :isObj="false"
          parent="root"
          :parent_trail="defnRefParentTrail(arr[0], parent_trail)"
          type="array"
          :ref="defnRef(arr[0], file.fileName)"
          :nameRef="defnRef(arr[0], file.fileName)"
          :file="file"
          :isArray="true"
          :arrayItemRef="arr[5]"
          :arrayItemType="getArrItemType(arr[5])"
          :referenceFile="arr[3]"
          :isLocal="arr[4]"
          :viewObj="false"
          :isTopLevel="false"
        ></UploadOBTree>

        <!-- taxonomy element -->
        <UploadOBTree
          v-else-if="expandDefn && arr[3] == 'TaxonomyElement'"
          :isObj="false"
          :name="arr[0]"
          :children="subClassChildren(file.file, arr[4], arr[1], arr[5])"
          :depth="depth + 1"
          :nodeDescription="getNodeDescription(arr[1])"
          :parent="name"
          :parent_trail="defnRefParentTrail(arr[0], parent_trail)"
          type="object"
          :ref="defnRef(arr[0], file.fileName)"
          :nameRef="defnRef(arr[0], file.fileName)"
          :file="file"
          :isTaxonomyElement="true"
          :subClassedNode="arr[2]"
          :referenceFile="arr[5]"
          :isLocal="arr[6]"
          :isArrayItem="isArray"
          :viewObj="false"
          :isTopLevel="false"
        >
        </UploadOBTree>

        <!-- allOf Obj -->
        <UploadOBTree
          v-else-if="expandDefn && arr[3] == 'ObjWithInherit'"
          :name="arr[0]"
          :children="subClassChildren(file.file, arr[4], arr[1], arr[5])"
          :depth="depth + 1"
          :nodeDescription="getNodeDescription(arr[1])"
          :isObj="true"
          :parent="name"
          :parent_trail="defnRefParentTrail(arr[0], parent_trail)"
          type="object"
          :ref="defnRef(arr[0], file.fileName)"
          :nameRef="defnRef(arr[0], file.fileName)"
          :file="file"
          :isTaxonomyElement="false"
          :subClassedNode="arr[2]"
          :referenceFile="arr[5]"
          :isLocal="arr[6]"
          :isArrayItem="isArray"
          :viewObj="false"
          :isTopLevel="false"
        ></UploadOBTree>

        <!-- for primitives -->
        <UploadOBTree
          v-else-if="
            expandDefn &&
              !(
                arr[3] == 'ObjWithInherit' ||
                arr[3] == 'TaxonomyElement' ||
                arr[3] == 'Object'
              )
          "
          :isObj="false"
          :name="arr[0]"
          :depth="depth + 1"
          :nodeDescription="getNodeDescription(arr[1])"
          :parent="name"
          :parent_trail="defnRefParentTrail(arr[0], parent_trail)"
          type="element"
          :ref="defnRef(arr[0], file.fileName)"
          :nameRef="defnRef(arr[0], file.fileName)"
          :file="file"
          :isTaxonomyElement="false"
          :subClassedNode="arr[2]"
          :referenceFile="arr[3]"
          :isLocal="arr[4]"
          :isArrayItem="isArray"
          :viewObj="false"
          :isTopLevel="false"
        >
        </UploadOBTree>
      </span>
    </span>
  </div>
</template>

<script>
import * as miscUtilities from "../utils/miscUtilities";

export default {
  props: [
    "name",
    "children",
    "depth",
    "expandAllObjects",
    "parent_name",
    "nodeDescription",
    "isObj",
    "parent",
    "parent_trail",
    "type",
    "nameRef",
    "subClassedNode",
    "importedNode",
    "file",
    "isTaxonomyElement",
    "referenceFile",
    "isLocal",
    "isArray",
    "arrayItemRef",
    "arrayItemType",
    "viewObj",
    "isTopLevel",
    "topLevelExpand"
  ],
  name: "UploadOBTree",
  data() {
    return {
      expandObject: true,
      expandArray: true,
      expandElement: false,
      isObject: Boolean(this.children),
      parents: this.parent,
      sortedObjLen: null,
      expandDefn: false,
      viewObjFinal: false
    };
  },
  created() {
    if (this.topLevelExpand) {
      this.expandDefn = true;
    }
    if (this.isTaxonomyElement || this.isArray) {
      this.expandDefn = false;
    }
    // needed because we cannot mutate prop viewObj
    if (this.viewObj) {
      this.viewObjFinal = true
    }

  },
  computed: {
    arrayItemNameFromRef() {
      return this.arrayItemRef.slice(this.arrayItemRef.lastIndexOf("/") + 1);
    },
    shortenName() {
      if (this.name.length > 54) {
        return this.name.slice(0, 54).concat("...");
      } else {
        return this.name;
      }
    },
    indent() {
      return { "padding-left": `${this.depth * 50}px` };
    },
    modalNodeID() {
      return "modal-add-child-" + this.$store.state.nodeCount;
    },
    isSelected() {
      return this.$store.state.nameRef == this.nameRef;
    },
    toolTipID() {
      return "tooltip-id-" + this.name + "-" + this.parent_name;
    },
    sortedObjects() {
      let obj_lst = [];
      let obj_lst_SC = [];
      let el_lst = [];
      let el_lst_SC = [];
      let superClass_lst = [];
      let subClass_obj = {};
      let immutable_OB = [
        "Value",
        "Unit",
        "Decimals",
        "Precision",
        "TaxonomyElement"
      ];
      let nodeType = "";
      let immutable_lst = [];
      let immutable_lst_SC = [];
      let fromSuperClass = false;
      let defnRef = "";
      let defnRefTrail = "";
      let isLocal = true;
      let refFileContext = "LOCAL";
      let isTaxonomyElement = false;

      let arr_lst = [];
      let arr_item = "";

      let fileReference = this.file;

      if (this.children) {
        Object.keys(this.children).forEach(key => {
          isLocal = true;
          fileReference = this.referenceFile;
          refFileContext = "LOCAL";
          isTaxonomyElement = false;

          if (!this.children[key]["referenceFile"]) {
            defnRef = miscUtilities.getDefnRef(
              fileReference,
              key,
              this.name,
              this.$store.state.loadedFiles,
              this.children
            );
            refFileContext = miscUtilities.getRefFileContext(defnRef);
            if (refFileContext != "LOCAL") {
              fileReference = this.$store.state.loadedFiles[refFileContext][
                "file"
              ];
              isLocal = false;
            }
          } else {
            fileReference = this.children[key]["referenceFile"];
            refFileContext = miscUtilities.getRefFileContext(
              this.children[key]["$ref"]
            );

            if (!fileReference[key] || refFileContext != "LOCAL") {
              fileReference = this.$store.state.loadedFiles[refFileContext][
                "file"
              ];
              isLocal = false;
            }

          }

          fromSuperClass = false;
          superClass_lst = [];
          if ("fromSuperClass" in this.children[key]) {
            fromSuperClass = true;
          }

          if (fileReference[key]["type"] == "object") {
            nodeType = "Object";

            if (fromSuperClass) {
              if (isLocal) {
                obj_lst_SC.push([
                  key,
                  fileReference[key],
                  fromSuperClass,
                  nodeType,
                  fileReference,
                  isLocal
                ]);
              } else {
                obj_lst_SC.push([
                  key,
                  fileReference[key],
                  fromSuperClass,
                  nodeType,
                  fileReference,
                  isLocal
                ]);
              }
            } else {
              if (isLocal) {
                obj_lst.push([
                  key,
                  fileReference[key],
                  fromSuperClass,
                  nodeType,
                  fileReference,
                  isLocal
                ]);
              } else {
                obj_lst.push([
                  key,
                  fileReference[key],
                  fromSuperClass,
                  nodeType,
                  fileReference,
                  isLocal
                ]);
              }
            }
          } else if (fileReference[key]["allOf"]) {
            for (let i in fileReference[key]["allOf"]) {
              if (fileReference[key]["allOf"][i]["$ref"]) {
                superClass_lst.push(fileReference[key]["allOf"][i]["$ref"]);
              } else {
                subClass_obj = fileReference[key]["allOf"][i];
              }
            }

            nodeType = false;

            for (let i in superClass_lst) {
              if (
                superClass_lst[i].includes(
                  "#/components/schemas/TaxonomyElement"
                )
              ) {
                isTaxonomyElement = true;
              }
            }

            if (isTaxonomyElement) {
              nodeType = "TaxonomyElement";
              if (fromSuperClass) {
                el_lst_SC.push([
                  key,
                  subClass_obj,
                  fromSuperClass,
                  nodeType,
                  superClass_lst,
                  fileReference,
                  isLocal
                ]);
              } else {
                el_lst.push([
                  key,
                  subClass_obj,
                  fromSuperClass,
                  nodeType,
                  superClass_lst,
                  fileReference,
                  isLocal
                ]);
              }
            } else {
              nodeType = "ObjWithInherit";
              if (fromSuperClass) {
                obj_lst_SC.push([
                  key,
                  subClass_obj,
                  fromSuperClass,
                  nodeType,
                  superClass_lst,
                  fileReference,
                  isLocal
                ]);
              } else {
                obj_lst.push([
                  key,
                  subClass_obj,
                  fromSuperClass,
                  nodeType,
                  superClass_lst,
                  fileReference,
                  isLocal
                ]);
              }
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
              fromSuperClass,
              fileReference,
              isLocal
            ]);
          }
        });

        obj_lst.sort();
        obj_lst_SC.sort();

        el_lst.sort();
        el_lst_SC.sort();

        immutable_lst.sort();

        let retArr = el_lst
          .concat(el_lst_SC)
          .concat(obj_lst)
          .concat(obj_lst_SC)
          .concat(arr_lst)
          .concat(immutable_lst);
        this.sortedObjLen = retArr.length;

        return retArr;
      }
    }
  },
  methods: {
    toggleExpandDefn() {
      this.expandDefn = !this.expandDefn;
    },
    getArrayItemAsChildren(file, arrayItemRef, key) {
      return miscUtilities.getArrayItemAsChildren(
        file,
        arrayItemRef,
        key,
        this.$store.state.loadedFiles
      );
    },
    getArrItemType(arrItemRef) {
      return miscUtilities.getArrayItemType(
        arrItemRef,
        this.$store.state.loadedFiles,
        this.$store.state.currentFile
      );
    },
    toggleSelect() {
      this.$store.commit("toggleSelectDefinitionNode");
      this.$store.commit("showDetailedView");

      this.$store.commit({
        type: "selectNode",
        nodeName: this.name,
        nodeParent: this.parent,
        nodeParentTrail: this.parent_trail,
        nodeType: this.type,
        nameRef: this.nameRef,
        nodeDescription: this.nodeDescription,
        isSubClassedNode: this.subClassedNode,
        isTaxonomyElement: this.isTaxonomyElement,
        selectedFileName: this.file.fileName,
        referenceFile: this.referenceFile,
        isLocal: this.isLocal
      });
    },
    objectRef(nodeName, fileName) {
      return fileName + "-" + nodeName;
    },

    isNodeObject(child_name) {
      if (this.file.file[child_name]) {
        if (
          (this.file.file[child_name]["type"] == "object" ||
            this.file.file[child_name]["allOf"]) &&
          !miscUtilities.isTaxonomyElement(file.file, child_name)
        ) {
          return true;
        } else {
          return false;
        }
      }
    },

    //returns children object from referenced (no unreferenced objects will be found, because this is below top level)
    returnNodeChildren(child_name, child_obj) {
      let temp_child_obj = {};

      let superClass_lst = [];
      if (this.file.file[child_name]["properties"]) {
        temp_child_obj = JSON.parse(
          JSON.stringify(this.file.file[child_name]["properties"])
        );
        if (child_obj["fromSuperClass"]) {
          Object.keys(temp_child_obj).forEach(key => {
            temp_child_obj[key].fromSuperClass = true;
          });
        }

        return temp_child_obj;
      } else {
        // return children merging superClassed objects / elements with obj's children
        // child_name is the name of the object, just need to return merge of children + superclass children
        for (let i in this.file.file[child_name]["allOf"]) {
          if (this.file.file[child_name]["allOf"][i]["properties"]) {
            temp_child_obj = JSON.parse(
              JSON.stringify(
                this.file.file[child_name]["allOf"][i]["properties"]
              )
            );
            if (child_obj["fromSuperClass"]) {
              Object.keys(temp_child_obj).forEach(key => {
                temp_child_obj[key].fromSuperClass = true;
              });
            }
          } else {
            superClass_lst.push(this.file.file[child_name]["allOf"][i]["$ref"]);
          }
        }
        return {
          ...temp_child_obj,
          ...miscUtilities.getSuperClassChildren(
            this.file.file,
            superClass_lst,
            temp_child_obj
          )
        };
      }
    },
    fromSuperClass(childNode) {
      if (childNode["fromSuperClass"]) {
        return true;
      } else {
        return false;
      }
    },
    getNodeDescription(nodeObj) {
      return nodeObj["description"];
    },
    subClassChildren(file, superClassRef, subClassObj, referenceFile) {
      if (referenceFile) {
        return miscUtilities.getSuperClassChildren(
          referenceFile,
          superClassRef,
          subClassObj,
          referenceFile,
          null,
          this.$store.state.loadedFiles
        );
      } else {
        return miscUtilities.getSuperClassChildren(
          file,
          superClassRef,
          subClassObj,
          referenceFile,
          null,
          this.$store.state.loadedFiles
        );
      }
    },
    defnRef(nodeName, fileName) {
      let defnRef = miscUtilities.generateUniqueRef(
        nodeName,
        fileName,
        this.name
      );
      return defnRef;
    },
    defnRefParentTrail(nodeName, parent_trail) {
      return nodeName + "-" + parent_trail;
    },
    addViewObj(el) {
      this.viewObjFinal = true
      this.$store.commit("addViewObj", {
        'el': el,
        'mode': 'create_cookie'
      });
    },
    removeViewObj(el) {
      this.viewObjFinal = false
      this.$store.commit("removeViewObj", {
        'el': el,
        'mode': 'create_cookie'
      });
      this.$store.commit("reRenderList")
    }
  },
  watch: {
    expandAllObjects() {
      if (this.expandAllObjects == true) {
        this.expandDefn = true;
      } else {
        this.expandDefn = false;
      }
    }
  }
};
</script>

<style>
.checkbox-s {
  margin-left: 8px;
}

.icon-expandable {
  margin-bottom: 3px;
}

.taxonomy-element-icon-expandable {
  margin-bottom: 3px;
  padding: 6px;
}

.options {
  display: inline-flex;
  justify-content: space-between;
  width: 46px;
  padding-left: 9px;
  bottom: -6px;
  visibility: hidden;
}

.element-div:hover .options {
  visibility: visible;
}

.element-div {
  margin-bottom: -8px;
  margin-left: 15px;
}

.element-div:focus {
  color: red;
}

.clickable {
  cursor: pointer;
}

.node-wrapper {
  border-bottom: #d3d3d3 solid 1px;
  height: 25px;
}

.subClassSignifier {
  font-style: italic;
}

.importedNodeSignifier {
  font-style: italic;
  font-weight: bold;
}

.primary-view-icon {
  display:block;
  padding-right: 125px;
  float: right;
}

/* .node-wrapper:hover .primary-view-icon { 
  display: block;
} */
</style>
