<template>
    <div class="edit-item-types-container">
        <b-form-group label="Choose Item Type Group to Edit:" label-for="select-edit-item-type-group">
            <b-form-select
                id="select-edit-item-type-group"
                v-model="itemTypeGroupToEdit"
                :options="allItemTypeGroupsComputed"
            ></b-form-select>
        </b-form-group>     
        <span v-if="itemTypeGroupToEdit">
            <b-form-group
                label="Item Type Name:"
                label-for="input-edit-item-type-group-base-item-type-name"
            >
                <b-form-input
                    id="input-edit-item-type-group-base-item-type-name"
                    v-model="baseItemType.ID"
                    disabled
                ></b-form-input>
            </b-form-group>

            <b-form-group
                label="Description:"
                label-for="input-edit-item-type-group-base-item-type-description"
            >
                <b-form-textarea
                    id="input-edit-item-type-group-base-item-type-description"
                    v-model="baseItemType.description"
                    rows="3"
                    max-rows="6"
                    disabled
                ></b-form-textarea>
            </b-form-group> 

            <b-form-group label="Type:" label-for="input-edit-item-type-group-base-item-type-type">
                <b-form-input
                id="input-edit-item-type-group-base-item-type-type"
                v-model="baseItemType.type"
                disabled
                ></b-form-input>
            </b-form-group>      
        </span>       
        <div v-show="itemTypeGroupToEdit">
            <span v-show="baseItemType.type != ''">
                <span v-if="baseItemType.type == 'units'">
                    Select units you want to include in your Item Type Group:
                </span>
                <span v-else-if="baseItemType.type == 'enums'">
                    Select enums you want to include in your Item Type Group:
                </span>     
                <b-table
                    :fields="returnItemTypeEnumsOrUnitsFields" 
                    :items="itemTypeEnumsOrUnits" 
                    selectable
                    selectable-mode="multi"
                    @row-selected="onRowSelected"
                    class="item-type-table"
                    ref="edit-item-type-group-select-enums-or-units-table"
                >
                    <template #cell(selected)="{ rowSelected }">
                        <template v-if="rowSelected">
                            <span aria-hidden="true">&check;</span>
                            <span class="sr-only">Selected</span>
                        </template>
                        <template v-else>
                            <span aria-hidden="true">&nbsp;</span>
                            <span class="sr-only">Not selected</span>
                        </template>      
                    </template>
                </b-table>
                <b-form @submit="onSubmit" @reset="onReset">
                    <b-form-group
                        label="Item Type Group Name:"
                        label-for="input-edit-item-type-group-name"
                    >
                        <b-form-input
                            id="input-edit-item-type-group-name"
                            v-model="updateItemTypeGroupForm.itemTypeGroupName"
                            disabled
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group
                        label="Edit Item Type Group Description:"
                        label-for="input-edit-item-type-group-description"
                    >
                        <b-form-textarea
                            id="input-edit-item-type-group-description"
                            v-model="updateItemTypeGroupForm.itemTypeGroupDescription"
                            rows="3"
                            max-rows="6"
                            :disabled="submitted"
                        ></b-form-textarea>
                    </b-form-group> 

                    <div class="center-items-container">
                        <b-button size="sm" type="submit" variant="primary" :disabled="submitted">
                            <span v-if="!submitted">Submit</span>
                            <span v-else>Submitted!</span>
                        </b-button>
                        <b-button size="sm" type="reset" variant="danger">Reset</b-button>
                    </div>
                </b-form>
            </span>
            <span v-show="baseItemType.type == ''">
                <div class="center-items-container">
                    <b-badge>
                        {{ 'No units/enums' }}
                    </b-badge>
                </div>
            </span>
        </div>          
        <div class="line-break">
        </div>          
        <div class="center-items-container">
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
            itemTypeGroupToEdit: '',
            currentGroupEnumsOrUnits: [],
            updateItemTypeGroupForm: {
                itemTypeGroupName: '',
                itemTypeGroupType: '',
                itemTypeGroupDescription: '',
                itemTypeGroupEnumsOrUnits: []
            },
            baseItemType: {
                'ID': '',
                'description': '',
                'type': '',
                'enumsOrUnits': []
            },            
            itemTypeTypes: [
                { text: 'Select type', value: ''},
                { text: 'Units', value: 'units'},
                { text: 'Enums', value: 'enums'}
            ],
            unitFields: [
                { key: 'selected', label: 'Selected'},
                { key: "enumOrUnitID", label: "Unit ID", thStyle: { width: "150px" } }, 
                { key: "enumOrUnitLabel", label: "Unit Label", thStyle: { width: "150px" } },
                { key: "enumOrUnitDescription", label: "Unit Description"}
            ],
            enumFields: [
                { key: 'selected', label: 'Selected'},
                { key: "enumOrUnitID", label: "Enum ID", thStyle: { width: "150px" } }, 
                { key: "enumOrUnitLabel", label: "Enum Label", thStyle: { width: "150px" } },
                { key: "enumOrUnitDescription", label: "Enum Description"}
            ],
            submitted: false           
        }
    },
    methods: {
        exitView() {
            this.$store.commit("showNoItemTypesViews")
        },
        getBaseItemType(itemTypeRef) {
            return itemTypeRef.slice(itemTypeRef.lastIndexOf('/') + 1)
        },
        onRowSelected(items) {
            this.updateItemTypeGroupForm.itemTypeGroupEnumsOrUnits = items
        },
        selectCurrentGroupEnumsOrUnits(enumsOrUnitsArr) {
            let index = null
            let enumsOrUnitsToSelectArr = []
            for (let i in enumsOrUnitsArr) {
                index = 0
                for (let j in this.baseItemType.enumsOrUnits) {
                    if (enumsOrUnitsArr[i] == this.baseItemType.enumsOrUnits[j]['enumOrUnitID']) {
                        enumsOrUnitsToSelectArr.push(index)
                        break
                    }
                    index++
                }
            }
            this.selectCurrentGroupEnumsOrUnitsHelper(enumsOrUnitsToSelectArr)
        },
        selectCurrentGroupEnumsOrUnitsHelper(indexes) {
            let myTable = this.$refs['edit-item-type-group-select-enums-or-units-table'].$el
            let tableBody = myTable.getElementsByTagName('tbody')[0]
            let tableRows = tableBody.getElementsByTagName('tr')
            indexes.forEach(idx => {
                tableRows[idx].click()
            })
        },
        onSubmit() {
            event.preventDefault()
            this.submitted = true
            let payload = {
                "itemTypeGroupName": this.updateItemTypeGroupForm.itemTypeGroupName,
                "itemTypeGroupDescription": this.updateItemTypeGroupForm.itemTypeGroupDescription,
                "itemTypeGroupGroup": this.updateItemTypeGroupForm.itemTypeGroupEnumsOrUnits,
                "baseItemTypeRef": this.createItemTypeGroupRef(this.baseItemType['ID'])
            }
            this.$store.commit("editItemTypeGroup", payload)
        },
        onReset() {
            this.updateItemTypeGroupForm.itemTypeGroupName = ''
            this.updateItemTypeGroupForm.itemTypeGroupType = ''
            this.updateItemTypeGroupForm.itemTypeGroupDescription = ''
            this.updateItemTypeGroupForm.itemTypeGroupEnumsOrUnits = []
            this.itemTypeGroupToEdit = ''

            this.baseItemType.ID = ''
            this.baseItemType.description = ''
            this.baseItemType.type = ''
            this.baseItemType.enumsOrUnits = []

            this.submitted = false
        },
        createItemTypeGroupRef(itemTypeName) {
            return "#/components/x-ob-units/" + itemTypeName
        }                          
    },
    computed: {
        allItemTypeGroupsComputed() {
            let ret_arr = []
            let itemTypeGroupName = ''
            for (let i in this.allItemTypeGroups) {
                itemTypeGroupName = i
                ret_arr.push(itemTypeGroupName)
            }

            return ret_arr.sort()
        },
        returnItemTypeEnumsOrUnitsFields() {
            if (this.baseItemType.type == 'enums') {
                return this.enumFields
            } else if (this.baseItemType.type == 'units') {
                return this.unitFields
            }
        },
        itemTypeEnumsOrUnits() {
            return this.baseItemType.enumsOrUnits
        },
        noSelectOnClickComputed() {
            if (this.submitted) {
                return true
            } else {
                return false
            }
        }        
    },
    watch: {
        itemTypeGroupToEdit() {
            if (this.itemTypeGroupToEdit) {
                this.finishedLoadingTable = false
                this.baseItemType.description = ''
                this.baseItemType.enumsOrUnits = []
                this.baseItemType.type = ''    
                this.baseItemType['ID'] = ''

                this.updateItemTypeGroupForm.itemTypeGroupName = this.itemTypeGroupToEdit
                this.updateItemTypeGroupForm.itemTypeGroupDescription = ''
                this.updateItemTypeGroupForm.itemTypeGroupEnumsOrUnits = []

                let enumOrUnitID = ''
                let enumOrUnitLabel = ''
                let enumOrUnitDescription = ''                

                let itemTypeGroupObj = this.allItemTypeGroups[this.itemTypeGroupToEdit]
                this.currentGroupEnumsOrUnits = itemTypeGroupObj['group']
                this.updateItemTypeGroupForm.itemTypeGroupDescription = itemTypeGroupObj['description']

                this.baseItemType['ID'] = this.getBaseItemType(itemTypeGroupObj['type'])
                let baseItemTypeGroupObj = this.allItemTypes[this.baseItemType['ID']]
                
                this.baseItemType.description = baseItemTypeGroupObj['description']

                if ('enums' in baseItemTypeGroupObj) {
                    this.baseItemType.type = 'enums'
                    for (let i in baseItemTypeGroupObj['enums']) {
                        enumOrUnitID = i
                        if ('label' in baseItemTypeGroupObj['enums'][i]) {
                            enumOrUnitLabel = baseItemTypeGroupObj['enums'][i]['label']
                        } else {
                            enumOrUnitLabel = ''
                        }

                        if ('description' in baseItemTypeGroupObj['enums'][i]) {
                            enumOrUnitDescription = baseItemTypeGroupObj['enums'][i]['description']
                        } else {
                            enumOrUnitDescription = ''
                        }                        

                        this.baseItemType.enumsOrUnits.push({
                            'enumOrUnitID': enumOrUnitID,
                            'enumOrUnitLabel': enumOrUnitLabel,
                            'enumOrUnitDescription': enumOrUnitDescription
                        })

                    }                    
                } else if ('units' in baseItemTypeGroupObj) {
                    this.baseItemType.type = 'units'                    
                    for (let i in baseItemTypeGroupObj['units']) {
                        enumOrUnitID = i
                        if ('label' in baseItemTypeGroupObj['units'][i]) {
                            enumOrUnitLabel = baseItemTypeGroupObj['units'][i]['label']
                        } else {
                            enumOrUnitLabel = ''
                        }

                        if ('description' in baseItemTypeGroupObj['units'][i]) {
                            enumOrUnitDescription = baseItemTypeGroupObj['units'][i]['description']
                        } else {
                            enumOrUnitDescription = ''
                        }     

                        this.baseItemType.enumsOrUnits.push({
                            'enumOrUnitID': enumOrUnitID,
                            'enumOrUnitLabel': enumOrUnitLabel,
                            'enumOrUnitDescription': enumOrUnitDescription
                        })  

                    }                    
                } 

                // wait until table has rendered, and then call click events to select current enums
                this.$nextTick(function () {
                    this.selectCurrentGroupEnumsOrUnits(this.currentGroupEnumsOrUnits)
                })                
            }
        }
    }
}

</script>

<style>

</style>