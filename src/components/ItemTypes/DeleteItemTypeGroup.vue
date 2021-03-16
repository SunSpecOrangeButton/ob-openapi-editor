<template>
    <div>
        <div class="all-item-type-groups-container">
            <b-table 
                :fields="item_type_groups_fields" 
                :items="computedAllItemTypeGroups" 
                class="detailsTable" 
                ref="allItemTypeGroups"
                selectable 
                select-mode="single"
                @row-selected="onRowSelected"                
            >
                <template #cell(itemTypeGroupName)="row">
                    <div class="unit-row-value">
                        {{ row.item.itemTypeGroupName }}
                    </div>
                    <b-button v-if="row.item.itemTypeEnumOrUnit" class="unit-row-expand-details" size="sm" @click="row.toggleDetails">
                        <div v-if="row.item.itemTypeEnumOrUnit == 'units'">
                            {{ 'View Units' }}
                        </div>
                        <div v-else-if="row.item.itemTypeEnumOrUnit == 'enums'">
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
                    <b-card v-if="row.item.itemTypeEnumOrUnit">
                        <b-table :fields="returnEnumOrUnitLabel(row.item.itemTypeEnumOrUnit)" :items="row.item.itemTypeGroupEnumsOrUnits"></b-table>
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
            <b-button variant="danger" @click="deleteItemTypeGroup" size="sm" :disabled="isItemTypeGroupSelected">Delete Item Type</b-button>
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
        this.allItemTypeGroups = this.$store.state.loadedFiles[this.$store.state.selectedFileName]["item_type_groups"]
        this.allItemTypes = this.$store.state.loadedFiles[this.$store.state.selectedFileName]["item_types"]

    },
    data() {
        return {
            allItemTypeGroups: {},
            allItemTypes: {},
            item_type_groups_fields: [
                { key: "itemTypeGroupName", label: "Item Type Group"},
                { key: "itemTypeGroupBaseItemType", label: "Base Item Type"}
            ],
            unit_fields: [
                { key: "enumOrUnitID", label: "Unit ID" }, 
                { key: "enumOrUnitLabel", label: "Unit Label" }
            ],
            enum_fields: [
                { key: "enumOrUnitID", label: "Enum ID" }, 
                { key: "enumOrUnitLabel", label: "Enum Label" }                
            ],
            selectedItemTypeGroup: []            
        }
    },
    methods: {
        exitView() {
            this.$store.commit("showNoItemTypesViews")
        },
        getBaseItemType(itemTypeRef) {
            return itemTypeRef.slice(itemTypeRef.lastIndexOf('/') + 1)
        },
        formatUnitsOrEnums(itemTypeGroupGroup, itemTypeObj) {
            let ret_units_table = []
            let enumOrUnitID = null
            let enumOrUnitLabel = null
            let enumOrUnitDescription = null

            if ('units' in itemTypeObj) {
                for (let i in itemTypeObj['units']) {
                    if (itemTypeGroupGroup.includes(i)) {
                        enumOrUnitDescription = itemTypeObj['units'][i]['description']
                        let tmp_obj = {
                            enumOrUnitID: i, 
                            enumOrUnitLabel: itemTypeObj['units'][i]['label']          
                        }
                        ret_units_table.push(tmp_obj)
                    }
                }
            } else if ('enums' in itemTypeObj) {
                for (let i in itemTypeObj['enums']) {
                    if (itemTypeGroupGroup.includes(i)) {
                        enumOrUnitLabel = itemTypeObj['enums'][i]['label']
                        enumOrUnitDescription = itemTypeObj['enums'][i]['description']
                        let tmp_obj = {
                            enumOrUnitID: i, 
                            enumOrUnitLabel: itemTypeObj['enums'][i]['label']
                        }
                        ret_units_table.push(tmp_obj)
                    }
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
            if (itemTypeType == 'units') {
                return this.unit_fields
            } else if (itemTypeType == 'enums') {
                return this.enum_fields
            }
        },
        onRowSelected(items) {
            this.selectedItemTypeGroup = items
        },   
        deleteItemTypeGroup() {
            let payload = {
                "itemTypeGroupToDelete": this.selectedItemTypeGroup
            }
            this.$store.commit("deleteItemTypeGroup", payload)
        }                
    },
    computed: {
        computedAllItemTypeGroups() {
            let ret_arr = []
            let itemTypeGroupName = null
            let itemTypeGroupBaseItemType = null
            let itemTypeGroupDescription = null
            let itemTypeGroupEnumsOrUnits = null
            let itemTypeGroupGroup = null

            let itemTypeEnumOrUnit = null
            let itemTypeEnumsOrUnitsObj = {}

            for (let i in this.allItemTypeGroups) {
                itemTypeGroupName = i
                itemTypeGroupDescription = this.allItemTypeGroups[i]['description']
                itemTypeGroupBaseItemType = this.getBaseItemType(this.allItemTypeGroups[i]['type'])
                itemTypeEnumsOrUnitsObj = this.allItemTypes[itemTypeGroupBaseItemType]
                itemTypeGroupGroup = this.allItemTypeGroups[i]['group']


                if ("units" in itemTypeEnumsOrUnitsObj) {
                    itemTypeEnumOrUnit = "units"
                    itemTypeGroupEnumsOrUnits = this.formatUnitsOrEnums(itemTypeGroupGroup, itemTypeEnumsOrUnitsObj)
                } else if ("enums" in itemTypeEnumsOrUnitsObj) {
                    itemTypeEnumOrUnit = "enums"
                    itemTypeGroupEnumsOrUnits = this.formatUnitsOrEnums(itemTypeGroupGroup, itemTypeEnumsOrUnitsObj)
                } else {
                    itemTypeGroupEnumsOrUnits = null
                    itemTypeEnumOrUnit = null
                }

                ret_arr.push(
                    {
                        itemTypeGroupName: itemTypeGroupName,
                        itemTypeGroupBaseItemType: itemTypeGroupBaseItemType,
                        itemTypeGroupEnumsOrUnits: itemTypeGroupEnumsOrUnits,
                        itemTypeEnumOrUnit: itemTypeEnumOrUnit
                    }
                )
            }
            return ret_arr
        },
        isItemTypeGroupSelected() {
            if (this.selectedItemTypeGroup.length)
                return false
            else
                return true
        }
    }
}

</script>

<style>
.all-item-type-groups-container {
    border: 1px solid #cccccc;
    max-height: 565px;
    overflow-y: auto;
}

.all-item-type-groups-container table {
    margin-bottom: 0;
}
</style>