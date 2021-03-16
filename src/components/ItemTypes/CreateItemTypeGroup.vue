<template>
    <div class="edit-item-types-container">
        <b-form-group label="Choose Item Type to Create Group From:" label-for="input-create-item-type-grp-select-item-type">
            <b-form-select
                id="input-create-item-type-grp-select-item-type"
                v-model="baseItemType['ID']"
                :options="allItemTypesComputed"
                :disabled="submitted"
            ></b-form-select>
        </b-form-group>   

        <span v-if="baseItemType['ID']">
            <b-form-group
                label="Item Type Name:"
                label-for="input-create-item-type-grp-current-item-type-name"
            >
                <b-form-input
                    id="input-create-item-type-grp-current-item-type-name"
                    v-model="baseItemType.ID"
                    disabled
                ></b-form-input>
            </b-form-group>

            <b-form-group
                label="Description:"
                label-for="input-create-item-type-grp-current-item-type-description"
            >
                <b-form-textarea
                    id="input-create-item-type-grp-current-type-description"
                    v-model="baseItemType.description"
                    rows="3"
                    max-rows="6"
                    disabled
                ></b-form-textarea>
            </b-form-group> 

            <b-form-group label="Type:" label-for="input-create-item-type-grp-current-item-type-type">
                <b-form-input
                id="input-create-item-type-grp-current-item-type-type"
                v-model="baseItemType.type"
                disabled
                ></b-form-input>
            </b-form-group>      
        </span>

        <div class="edit-item-type-group-table-container" v-if="baseItemType['ID']">
            <span v-if="baseItemType.type != ''">
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
                    select-mode="multi"
                    @row-selected="onRowSelected"
                    id="edit-item-type-create-item-type-grp-table" 
                    class="item-type-table"
                    ref="edit-item-type-create-item-type-grp-table-ref"
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
                        label="Name new Item Type Group:"
                        label-for="input-create-item-type-grp-item-type-name"
                    >
                        <b-form-input
                            id="input-create-item-type-grp-item-type-name"
                            v-model="itemTypeGroupName"
                            required
                            :disabled="submitted"
                        ></b-form-input>
                    </b-form-group>

                    <b-form-group
                        label="Description for new Item Type Group:"
                        label-for="input-create-item-type-grp-item-type-description"
                    >
                        <b-form-textarea
                            id="input-create-item-type-grp-type-description"
                            v-model="itemTypeGroupDescription"
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
            <span v-else>
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
        this.allItemTypes = this.$store.state.loadedFiles[this.$store.state.selectedFileName]["item_types"]
    },    
    data() {
        return {
            allItemTypes: null,

            baseItemType: {
                'ID': '',
                'description': '',
                'type': '',
                'enumsOrUnits': []
            },

            itemTypeGroupName: '',
            itemTypeGroupDescription: '',

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
            selectedEnumsOrUnits: [],
            submitted: false       
        }
    },
    methods: {
        exitView() {
            this.$store.commit("showNoItemTypesViews")
        },
        onRowSelected(items) {
            this.selectedEnumsOrUnits = items
        },   
        onSubmit(event) {
            event.preventDefault()
            this.submitted = true
            let payload = {
                "itemTypeGroupName": this.itemTypeGroupName,
                "itemTypeGroupDescription": this.itemTypeGroupDescription,
                "itemTypeGroupGroup": this.selectedEnumsOrUnits,
                "baseItemTypeRef": this.createItemTypeGroupRef(this.baseItemType['ID'])
            }
            this.$store.commit("createItemTypeGroup", payload)
        },
        onReset(event) {
            this.baseItemType.ID = '' 
            this.baseItemType.description = ''
            this.baseItemType.type = ''
            this.baseItemType.enumsOrUnits = []

            this.itemTypeGroupName = ''
            this.itemTypeGroupDescription = ''

            this.submitted = false
        },
        createItemTypeGroupRef(itemTypeName) {
            return "#/components/x-ob-units/" + itemTypeName
        }
    },
    computed: {
        allItemTypesComputed() {
            let ret_arr = []
            let itemTypeName = ''
            for (let i in this.allItemTypes) {
                itemTypeName = i
                ret_arr.push(itemTypeName)
            }

            return ret_arr.sort()
        },
        itemTypeEnumsOrUnits() {
            return this.baseItemType.enumsOrUnits
        },
        returnItemTypeEnumsOrUnitsFields() {
            if (this.baseItemType.type == 'enums') {
                return this.enumFields
            } else if (this.baseItemType.type == 'units') {
                return this.unitFields
            }
        },
        isTableSelectable() {
            if (this.submitted) {
                return false
            } else {
                return true
            }
        }
    },
    watch: {
        "baseItemType.ID"() {
            if (this.baseItemType.ID) {
                this.baseItemType.description = ''
                this.baseItemType.enumsOrUnits = []
                this.baseItemType.type = ''

                this.selectedEnumsOrUnits = []

                let itemTypeObj = this.allItemTypes[this.baseItemType['ID']]

                let enumOrUnitID = ''
                let enumOrUnitLabel = ''
                let enumOrUnitDescription = ''

                if ('description' in itemTypeObj) {
                    this.baseItemType.description = itemTypeObj['description']
                }

                if ('enums' in itemTypeObj) {
                    this.baseItemType.type = 'enums'
                    for (let i in itemTypeObj['enums']) {
                        enumOrUnitID = i
                        if ('label' in itemTypeObj['enums'][i]) {
                            enumOrUnitLabel = itemTypeObj['enums'][i]['label']
                        } else {
                            enumOrUnitLabel = ''
                        }

                        if ('description' in itemTypeObj['enums'][i]) {
                            enumOrUnitDescription = itemTypeObj['enums'][i]['description']
                        } else {
                            enumOrUnitDescription = ''
                        }                        

                        this.baseItemType.enumsOrUnits.push({
                            'enumOrUnitID': enumOrUnitID,
                            'enumOrUnitLabel': enumOrUnitLabel,
                            'enumOrUnitDescription': enumOrUnitDescription
                        })
                    }
                } else if ('units' in itemTypeObj) {
                    this.baseItemType.type = 'units'
                    for (let i in itemTypeObj['units']) {
                        enumOrUnitID = i
                        if ('label' in itemTypeObj['units'][i]) {
                            enumOrUnitLabel = itemTypeObj['units'][i]['label']
                        } else {
                            enumOrUnitLabel = ''
                        }

                        if ('description' in itemTypeObj['units'][i]) {
                            enumOrUnitDescription = itemTypeObj['units'][i]['description']
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
            }
        }
    }
}

</script>

<style>

</style>