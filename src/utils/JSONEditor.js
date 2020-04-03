/*

JSONEditor.js contains functions related to manipulating OAS JSON files

*/

import Vue from "vue";
import Vuex from "vuex";
import * as miscUtilities from "./miscUtilities.js";
import newFileTemplate from "../assets/OB-OpenAPI-New-File-Template.json";

// Deletes all nodes recursively of the same node name
// used for deleting definition elements
export function deleteAllNodes(JSONFile, nodeName) {
  Object.keys(JSONFile).forEach(key => {
    if (key == nodeName) {
      Vue.delete(JSONFile, key);
    } else if (JSONFile[key].properties) {
      if (JSONFile[key]["properties"][nodeName]) {
        Vue.delete(JSONFile[key].properties, nodeName);
      }
    } else if (JSONFile[key]["allOf"]) {
      for (let i in JSONFile[key]["allOf"]) {
        if (JSONFile[key]["allOf"][i]["properties"]) {
          if (JSONFile[key]["allOf"][i]["properties"][nodeName]) {
            Vue.delete(JSONFile[key]["allOf"][i]["properties"], nodeName);
          }
        }
        if (JSONFile[key]["allOf"][i]["$ref"]) {
          let superClassName = JSONFile[key]["allOf"][i]["$ref"].slice(
            JSONFile[key]["allOf"][i]["$ref"].lastIndexOf("/") + 1,
            JSONFile[key]["allOf"][i]["$ref"].length
          );
          if (superClassName == nodeName) {
            Vue.delete(JSONFile[key]["allOf"], i);
          }
        }
      }
    }
  });
}

//Remove single node from object. Removes every instance of the node which is in the object
export function deleteNode(JSONFile, nodeName, parentName) {
  if (parentName == "root") {
    Vue.delete(JSONFile, nodeName);
    for (let i in JSONFile) {
      if (JSONFile[i]["properties"]) {
        if (JSONFile[i]["properties"][nodeName]) {
          Vue.delete(JSONFile[i]["properties"], nodeName);
        }
      } else if (JSONFile[i]["allOf"]) {
        for (let j in JSONFile[i]["allOf"]) {
          if (JSONFile[i]["allOf"][j]["$ref"]) {
            for (let k in JSONFile[i]["allOf"][j]["$ref"]) {
              let superClassSubStringIndex =
                JSONFile[i]["allOf"][j]["$ref"][k].lastIndexOf("/") + 1;
              let superClassSubString = JSONFile[i]["allOf"][j]["$ref"][
                k
              ].slice(superClassSubStringIndex);
              if (superClassSubString == nodeName) {
                Vue.delete(JSONFile[i]["allOf"][j]["$ref"], k);
              }
            }
          } else if (JSONFile[i]["allOf"][j]["properties"]) {
            if (JSONFile[i]["allOf"][j]["properties"][nodeName]) {
              Vue.delete(JSONFile[i]["allOf"][j]["properties"], nodeName);
            }
          }
        }
      }
    }
  } else {
    if (JSONFile[parentName]["properties"]) {
      Vue.delete(JSONFile[parentName]["properties"], nodeName);
    } else {
      for (let i in JSONFile[parentName]["allOf"]) {
        if (JSONFile[parentName]["allOf"][i]["properties"]) {
          Vue.delete(JSONFile[parentName]["allOf"][i]["properties"], nodeName);
        }
      }
    }
  }
}

//Edit node
export function editNode(JSONFile, nodeName, newDescription) {
  // console.log('in editNode json editor')
  let nodeEdit = {
    description: newDescription
  };
  if (miscUtilities.hasInheritance(JSONFile[nodeName])) {
    for (let i in JSONFile[nodeName]["allOf"]) {
      if (JSONFile[nodeName]["allOf"][i]["type"]) {
        JSONFile[nodeName]["allOf"][i]["description"] = newDescription;
      }
    }
  } else if (JSONFile[nodeName]["type"] == "object") {
    nodeEdit.properties = JSONFile[nodeName]["properties"];
    nodeEdit.type = "object";
    Vue.set(JSONFile, nodeName, nodeEdit);
  } else {
    Vue.set(JSONFile, nodeName, nodeEdit);
  }
}

//Create node
export function createNodeElement(
  JSONFile,
  nodeName,
  nodeType,
  nodeDescription
) {
  let node_attr = {
    type: nodeType,
    description: nodeDescription
  };
  Vue.set(JSONFile, nodeName, node_attr);
}

//Create object
export function createNodeObject(
  JSONFile,
  objectName,
  objectDescription,
  elementForms
) {
  let properties = {};
  for (let i in elementForms) {
    properties[elementForms[i].nodeName] = {
      type: elementForms[i].nodeType,
      description: elementForms[i].nodeDescription
    };
  }
  let obj_attr = {
    type: "object",
    description: objectDescription,
    properties: properties
  };
  Vue.set(JSONFile, objectName, obj_attr);
}

//create list of all element definitions into array for use in selecting elements in object creation.
export function createArrayOfAllElementDefinitions(JSONFile, array) {
  Object.keys(JSONFile).forEach(key => {
    if (!JSONFile[key].properties) {
      array.push(key);
    }
  });
}

//add child to object whether element or object
//adding children to the top level object does not propagate throughout the reference objects
// if all non-top level elements/objects are references, do we need to add the child to anything other than the top level defn? probably not
export function addChildToObject(
  JSONFile,
  parentName,
  childName,
  childRefFile
) {
  let childObj = null;
  let parentFile = JSONFile.file;
  let parentFileName = JSONFile.fileName;

  let childFile = childRefFile.file;
  let childFileName = childRefFile.fileName;

  if (JSONFile.fileName == childFileName) {
    childObj = {
      $ref: "#/components/schemas/" + childName
    };

    if (JSONFile["file"][parentName]["allOf"]) {
      for (let i in JSONFile["file"][parentName]["allOf"]) {
        if (JSONFile["file"][parentName]["allOf"][i]["properties"]) {
          Vue.set(
            JSONFile["file"][parentName]["allOf"][i]["properties"],
            childName,
            childObj
          );
        }
      }
    } else {
      Vue.set(JSONFile["file"][parentName].properties, childName, childObj);
    }
  } else {
    childObj = {
      $ref: childFileName + "#/components/schemas/" + childName
    };

    if (JSONFile["file"][parentName]["allOf"]) {
      for (let i in JSONFile["file"][parentName]["allOf"]) {
        if (JSONFile["file"][parentName]["allOf"][i]["properties"]) {
          Vue.set(
            JSONFile["file"][parentName]["allOf"][i]["properties"],
            childName,
            childObj
          );
        }
      }
    } else {
      Vue.set(JSONFile["file"][parentName].properties, childName, childObj);
    }
  }
}

// add superClass to object, making that object a subclass
export function addSuperClass(
  workingFile,
  subClassName,
  superClassName,
  superClassRefFileName,
  loadedFiles
) {
  let refExists = false;
  let allOfArr = [];
  let allOfObj = {};

  if (workingFile[subClassName]["allOf"] !== undefined) {
    for (let i of JSONFile[workingFile].allOf) {
      if (
        i["ref"] ==
        superClassRefFileName + "#/components/schemas/" + superClassName
      ) {
        refExists = true;
      }
    }
    if (!refExists) {
      JSONFile[subClassName].allOf.push({
        $ref: superClassRefFileName + "#/components/schemas/" + superClassName
      });
    }
  } else {
    allOfArr.push({
      $ref: superClassRefFileName + "#/components/schemas/" + superClassName
    });
    allOfArr.push(JSON.parse(JSON.stringify(workingFile[subClassName])));
    allOfObj = {
      allOf: allOfArr
    };
    Vue.delete(workingFile, subClassName);
    Vue.set(workingFile, subClassName, allOfObj);
  }
}

export function removeSuperClass(JSONFile, subClassName, superClassName) {
  if (JSONFile[subClassName]["allOf"].length > 2) {
    for (let i in JSONFile[subClassName]["allOf"]) {
      if (JSONFile[subClassName]["allOf"][i]["$ref"]) {
        if (
          JSONFile[subClassName]["allOf"][i]["$ref"].includes(superClassName)
        ) {
          Vue.delete(JSONFile[subClassName]["allOf"], i);
        }
      }
    }
  } else {
    let temp_subClass_obj = {};
    for (let i in JSONFile[subClassName]["allOf"]) {
      if (JSONFile[subClassName]["allOf"][i]["type"]) {
        temp_subClass_obj = JSONFile[subClassName]["allOf"][i];
      }
    }
    Vue.set(JSONFile, subClassName, temp_subClass_obj);
  }
}

// add enumeration to definition element
export function addEnum(JSONFile, defnName, enumName) {
  let temp_enum = {};

  for (let i in JSONFile[defnName]["allOf"]) {
    if (JSONFile[defnName]["allOf"][i]["type"]) {
      if (JSONFile[defnName]["allOf"][i]["enum"]) {
        JSONFile[defnName]["allOf"][i]["enum"].push(enumName);
      } else {
        temp_enum = [enumName];
        Vue.set(JSONFile[defnName]["allOf"][i], "enum", temp_enum);
      }
    }
  }
}

// remove enumeration from definition element
export function removeEnum(JSONFile, defnName, enumName) {
  // console.log("remove enum: " + enumName)
  for (let i in JSONFile[defnName]["allOf"]) {
    if (JSONFile[defnName]["allOf"][i]["enum"]) {
      let enum_index = JSONFile[defnName]["allOf"][i]["enum"].indexOf(enumName);
      if (JSONFile[defnName]["allOf"][i]["enum"].length == 1) {
        Vue.delete(JSONFile[defnName]["allOf"][i], "enum");
      } else {
        Vue.delete(JSONFile[defnName]["allOf"][i]["enum"], enum_index);
      }
    }
  }
}

export function createNewDefnFile(title, description, fileName) {
  let returnNewFileObj = {};
  returnNewFileObj["fullFileForExport"] = newFileTemplate;
  returnNewFileObj["file"] =
    returnNewFileObj["fullFileForExport"].components.schemas;
  returnNewFileObj["fileName"] = fileName;

  returnNewFileObj["fullFileForExport"]["info"]["title"] = title;
  returnNewFileObj["fullFileForExport"]["info"]["description"] = description;

  return returnNewFileObj;
}

export function loadInDefinition(workingFile, defnName, refFile) {
  let defnObj = {
    $ref: refFile + "#/components/schemas/" + defnName
  };

  Vue.set(workingFile, defnName, defnObj);
}
