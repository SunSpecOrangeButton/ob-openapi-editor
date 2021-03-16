<template>
    <div>
        <div class="all-item-types-container">
            <b-table 
                :fields="fields" 
                selectable 
                select-mode="single"
                @row-selected="onRowSelected"
                :items="computedAllItemTypes" 
                class="detailsTable" 
                ref="allItemTypes"
                >
                <template #cell(description)="row">
                    <div class="unit-row-value">
                        {{ row.item.description }}
                    </div>
                    <b-button v-if="row.item.unitOrEnum" class="unit-row-expand-details" size="sm" @click="row.toggleDetails">
                        <div v-if="row.item.unitOrEnum == 'unit'">
                            {{ 'View Units' }}
                        </div>
                        <div v-else-if="row.item.unitOrEnum == 'enum'">
                            {{ 'View Enums' }}
                        </div>
                    </b-button>
                    <div v-else>
                        <b-badge>
                            {{ 'No units/enums'}}
                        </b-badge>
                    </div>
                </template>

                <template #row-details="row">
                    <b-card id="unit-row-expand-details-card" v-if="row.item.unitOrEnum">
                        <b-table :fields="returnEnumOrUnitLabel(row.item.unitOrEnum)" :items="row.item.itemUnitsOrEnums"></b-table>
                        <div id="hide-unit-table-btn">
                            <b-button size="sm" class="unit-table-hide-btn" @click="row.toggleDetails">Hide</b-button>
                        </div>
                    </b-card>
                </template>
            </b-table>
        </div>
        <div class="line-break">
        </div>       
        <div class="center-items-container">
            <b-button variant="danger" @click="deleteItemType" size="sm" :disabled="!isItemTypeSelectedComputed">Delete Item Type</b-button>
        </div>
        <div class="line-break">
        </div>       
        <div class="back-btn-container">
            <b-button variant="danger" @click="exitView" size="sm">Back</b-button>
        </div>
    </div>
</template>

<script>
export default {
    created() {
        this.allItemTypes = this.$store.state.loadedFiles[this.$store.state.selectedFileName]["item_types"]
    },
    data() {
        return {
            allItemTypes: {},
            fields: [
                { key: "itemType", label: "OB Item Type" },
                { key: "description", label: "Description" }
            ],
            unit_fields: [
                { key: "enumOrUnitID", label: "Unit ID" }, 
                { key: "enumOrUnitLabel", label: "Unit Label" }
            ],
            enum_fields: [
                { key: "enumOrUnitID", label: "Enum ID" }, 
                { key: "enumOrUnitLabel", label: "Enum Label" }                
            ],
            selectedItemType: []
        }
    },
    methods: {
        exitView() {
            this.$store.commit("showNoItemTypesViews")
        },
        formatUnitsOrEnums(units_obj, unitsOrEnums) {
            let ret_units_table = []
            let enumOrUnitID = null
            let enumOrUnitLabel = null
            let enumOrUnitDescription = null

            if (unitsOrEnums == 'unit') {
                for (let i in units_obj) {
                    enumOrUnitDescription = units_obj[i]['description']
                    let tmp_obj = {
                        enumOrUnitID: i, 
                        enumOrUnitLabel: units_obj[i]['label']          
                    }
                    ret_units_table.push(tmp_obj)
                }
            } else if (unitsOrEnums == 'enum') {
                for (let i in units_obj) {
                    enumOrUnitLabel = units_obj[i]['label']
                    enumOrUnitDescription = units_obj[i]['description']
                    let tmp_obj = {
                        enumOrUnitID: i, 
                        enumOrUnitLabel: units_obj[i]['label']
                    }
                    ret_units_table.push(tmp_obj)
                }

            }

            ret_units_table.sort(function(a, b) {
                var nameA = a.enumOrUnitID.toUpperCase(); // ignore upper and lowercase
                var nameB = b.enumOrUnitID.toUpperCase(); // ignore upper and lowercase
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }

                // names must be equal
                return 0;
            });
            return ret_units_table
        },
        returnEnumOrUnitLabel(itemTypeType) {
            if (itemTypeType == 'unit') {
                return this.unit_fields
            } else if (itemTypeType == 'enum') {
                return this.enum_fields
            }
        },
        onRowSelected(items) {
            this.selectedItemType = items
        }, 
        deleteItemType() {
            let payload = {
                'itemTypeToDelete': this.selectedItemType
            }
            this.$store.commit('deleteItemType', payload)
        }        
    },
    computed: {
        computedAllItemTypes() {
            let ret_arr = []
            let itemTypeName = null
            let itemTypeDescription = null
            let itemUnitsOrEnums = null
            let unitOrEnum = null
            for (let i in this.allItemTypes) {
                itemTypeName = i
                itemTypeDescription = this.allItemTypes[i]["description"]

                if ("units" in this.allItemTypes[i]) {
                    unitOrEnum = "unit"
                    itemUnitsOrEnums = this.formatUnitsOrEnums(this.allItemTypes[i]["units"], "unit")
                } else if ("enums" in this.allItemTypes[i]) {
                    unitOrEnum = "enum"
                    itemUnitsOrEnums = this.formatUnitsOrEnums(this.allItemTypes[i]["enums"], "enum")
                } else {
                    unitOrEnum = null
                    itemUnitsOrEnums = null
                }

                ret_arr.push(
                    {
                        itemType: itemTypeName,
                        description: itemTypeDescription,
                        "itemUnitsOrEnums": itemUnitsOrEnums,
                        "unitOrEnum": unitOrEnum
                    }
                )
            }

            ret_arr.sort(function(a, b) {
                var nameA = a.itemType.toUpperCase(); // ignore upper and lowercase
                var nameB = b.itemType.toUpperCase(); // ignore upper and lowercase
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }

                // names must be equal
                return 0;
            })
            return ret_arr
        },
        isItemTypeSelectedComputed() {
            if (this.selectedItemType.length)
                return true
            else   
                return false
        }
    }
}
</script>

<style>
.back-btn-container {
    display: flex;
    align-items: center;
    justify-content: center;
}

.all-item-types-container {
    border: 1px solid #cccccc;
    height: 565px;
    overflow-y: auto;
}

</style>