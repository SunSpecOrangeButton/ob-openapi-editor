<template>
    <div class="edit-item-types-container">
        <b-form-group label="Choose Item Type to Edit:" label-for="input-edit-item-type-select-item-type">
            <b-form-select
                id="input-edit-item-type-select-item-type"
                v-model="itemTypeToEdit"
                :options="allItemTypesComputed"
            ></b-form-select>
        </b-form-group>        
        <div class="edit-item-types-container" v-if="itemTypeToEdit">
            <b-form @submit="onSubmit" @reset="onReset">
                <b-form-group
                    label="Item Type Name:"
                    label-for="input-edit-item-type-item-type-name"
                >
                    <b-form-input
                        id="input-edit-item-type-item-type-name"
                        v-model="form.itemTypeName"
                        required
                        disabled
                    ></b-form-input>
                </b-form-group>

                <b-form-group
                    label="Description:"
                    label-for="input-edit-item-type-item-type-description"
                >
                    <b-form-textarea
                        id="input-edit-item-type-item-type-description"
                        v-model="form.itemTypeDescription"
                        rows="3"
                        max-rows="6"
                        :disabled="submitted"
                    ></b-form-textarea>
                </b-form-group> 

                <b-form-group id="input-group-item-type-type" label="Type:" label-for="input-item-type-type">
                    <b-form-select
                    id="input-item-type-type"
                    v-model="form.itemTypeType"
                    :options="itemTypeTypes"
                    required
                    :disabled="submitted"
                    ></b-form-select>
                </b-form-group>

                <div class="enum-or-unit-table-container" v-if="form.itemTypeType">              
                    <b-table 
                        @row-selected="onRowSelected" 
                        selectable 
                        select-mode="single"
                        :fields="returnEnumOrUnitFields(form.itemTypeType)" 
                        :items="enumOrUnitToAddComputed" 
                        id="edit-item-type-create-enums-or-units-table" 
                        class="item-type-table"
                        ref="edit-item-type-create-enums-or-units-table-ref"
                    >
                    </b-table>
                </div>

                <div id="add-enum-or-unit-container" v-if="form.itemTypeType && !submitted">
                    <span v-if="form.itemTypeType == 'units'">
                        Add units:
                    </span>
                    <span v-else-if="form.itemTypeType == 'enums'">
                        Add enums:
                    </span>  
                    <b-form @submit="addEnumOrUnit">
                        <div v-if="form.itemTypeType == 'units'">
                            <b-form-group
                                label="Unit ID:"
                                label-for="input-edit-item-type-add-unit-id"
                            >
                                <b-form-input
                                    id="input-edit-item-type-add-unit-id"
                                    v-model="enumOrUnitToAddForm.enumOrUnitID"
                                    required
                                ></b-form-input>
                            </b-form-group>
                            <b-form-group
                                label="Unit Label:"
                                label-for="input-edit-item-type-add-unit-label"
                            >
                                <b-form-input
                                    id="input-edit-item-type-add-unit-label"
                                    v-model="enumOrUnitToAddForm.enumOrUnitLabel"
                                    required
                                ></b-form-input>
                            </b-form-group>
                            <b-form-group
                                label="Unit Description:"
                                label-for="input-edit-item-type-add-unit-description"
                            >
                                <b-form-input
                                    id="input-edit-item-type-add-unit-description"
                                    v-model="enumOrUnitToAddForm.enumOrUnitDescription"
                                ></b-form-input>
                            </b-form-group>                                        
                        </div>

                        <div v-if="form.itemTypeType == 'enums'">
                            <b-form-group
                                label="Enum ID:"
                                label-for="input-edit-item-type-add-enum-ID"
                            >
                                <b-form-input
                                    id="input-edit-item-type-add-enum-ID"
                                    v-model="enumOrUnitToAddForm.enumOrUnitID"
                                    required
                                ></b-form-input>
                            </b-form-group>
                            <b-form-group
                                label="Enum Label:"
                                label-for="input-edit-item-type-add-enum-label"
                            >
                                <b-form-input
                                    id="input-edit-item-type-add-enum-label"
                                    v-model="enumOrUnitToAddForm.enumOrUnitLabel"
                                    required
                                ></b-form-input>
                            </b-form-group>
                            <b-form-group
                                label="Enum Description:"
                                label-for="input-edit-item-type-add-enum-description"
                            >
                                <b-form-input
                                    id="input-edit-item-type-add-enum-description"
                                    v-model="enumOrUnitToAddForm.enumOrUnitDescription"
                                ></b-form-input>
                            </b-form-group>                    
                        </div>

                        <div class="center-items-container" v-if="form.itemTypeType">
                            <b-button type="submit" @click="addEnumOrUnit" size="sm" variant="primary">Add</b-button>
                            <b-button size="sm" @click="removeEnumOrUnit" variant="danger">Remove</b-button>
                        </div>
                        Select unit or enum in table and click Remove to remove.
                    </b-form>
                </div>

                <div class="line-break">
                </div>

                <div class="center-items-container">
                    <b-button size="sm" type="submit" variant="primary" :disabled="submitted">
                        <span v-if="!submitted">Submit</span>
                        <span v-else>Submitted!</span>
                    </b-button>
                    <b-button size="sm" type="reset" variant="danger">Reset</b-button>
                </div>
            </b-form>

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
            itemTypeToEdit: '',
            allItemTypes: null,
            form: {
                itemTypeName: '',
                itemTypeType: '',
                itemTypeDescription: '',
                itemTypeEnumsOrUnits: []
            },
            itemTypeTypes: [
                { text: 'Select type', value: ''},
                { text: 'Units', value: 'units'},
                { text: 'Enums', value: 'enums'}
            ],
            unitFields: [
                { key: "enumOrUnitID", label: "Unit ID", thStyle: { width: "150px" } }, 
                { key: "enumOrUnitLabel", label: "Unit Label", thStyle: { width: "150px" } },
                { key: "enumOrUnitDescription", label: "Unit Description"}
            ],
            enumFields: [
                { key: "enumOrUnitID", label: "Enum ID", thStyle: { width: "150px" } }, 
                { key: "enumOrUnitLabel", label: "Enum Label", thStyle: { width: "150px" } },
                { key: "enumOrUnitDescription", label: "Enum Description"}
            ],            
            enumOrUnitToAddForm: {
                'enumOrUnitID': '',
                'enumOrUnitLabel': '',
                'enumOrUnitDescription': ''
            },
            selectedEnumOrUnit: [],
            submitted: false
        }
    },
    methods: {
        onSubmit(event) {
            event.preventDefault()
            let payload = {
                "itemTypeName" : this.form.itemTypeName,
                "itemTypeType": this.form.itemTypeType,
                "itemTypeDescription": this.form.itemTypeDescription,
                "itemTypeEnumsOrUnits": this.form.itemTypeEnumsOrUnits
            }
            this.submitted = true
            this.$store.commit("editItemTypeDefn", payload);
        },
        onReset(event) {
            this.form.itemTypeName = '',
            this.form.itemTypeType = ''
            this.form.itemTypeDescription = ''
            this.form.itemTypeEnumsOrUnits = []

            this.enumOrUnitToAddForm.enumOrUnitID = ''
            this.enumOrUnitToAddForm.enumOrUnitLabel = ''
            this.enumOrUnitToAddForm.enumOrUnitDescription = ''

            this.itemTypeToEdit = ''

            this.submitted = false

        },        
        exitView() {
            this.$store.commit("showNoItemTypesViews")
        },
        returnEnumOrUnitFields(itemTypeType) {
            if (itemTypeType == 'units') {
                return this.unitFields
            } else if (itemTypeType == 'enums') {
                return this.enumFields
            }
        },
        onRowSelected(items) {
            this.selectedEnumOrUnit = items
        },
        addEnumOrUnit() {
            if (this.enumOrUnitToAddForm.enumOrUnitID && this.enumOrUnitToAddForm.enumOrUnitLabel) {
                event.preventDefault()
                let tmp_enumOrUnitToAddObj =                     {
                    'enumOrUnitID': this.enumOrUnitToAddForm.enumOrUnitID,
                    'enumOrUnitLabel': this.enumOrUnitToAddForm.enumOrUnitLabel,
                    'enumOrUnitDescription': this.enumOrUnitToAddForm.enumOrUnitDescription
                }
                this.form.itemTypeEnumsOrUnits.push(tmp_enumOrUnitToAddObj)

                this.enumOrUnitToAddForm.enumOrUnitID = ''
                this.enumOrUnitToAddForm.enumOrUnitLabel = ''
                this.enumOrUnitToAddForm.enumOrUnitDescription = ''                
            }
        },
        removeEnumOrUnit() {
            if (this.selectedEnumOrUnit.length) {
                let counter = 0
                for (let i = 0; i < this.form.itemTypeEnumsOrUnits.length; i++) {
                    if (this.selectedEnumOrUnit[0]['enumOrUnitID'] == this.form.itemTypeEnumsOrUnits[i]['enumOrUnitID']) {
                        break
                    } else {
                        counter++
                    }
                }
                this.form.itemTypeEnumsOrUnits.splice(counter, 1)
            }
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
        enumOrUnitToAddComputed() {
            return this.form.itemTypeEnumsOrUnits
        }
    },
    watch: {
        itemTypeToEdit() {
            if (this.itemTypeToEdit) {
                this.form.itemTypeName = ''
                this.form.itemTypeType = ''
                this.form.itemTypeDescription = ''
                this.form.itemTypeEnumsOrUnits = []

                let enumOrUnitID = ''
                let enumOrUnitLabel = ''
                let enumOrUnitDescription = ''

                let currentItemTypeObj = this.allItemTypes[this.itemTypeToEdit]

                this.form.itemTypeName = this.itemTypeToEdit

                if ("description" in currentItemTypeObj)
                    this.form.itemTypeDescription = currentItemTypeObj["description"]

                // refactor: repeated code
                if ("enums" in currentItemTypeObj) {
                    this.form.itemTypeType = 'enums'
                    for (let i in currentItemTypeObj['enums']) {
                        enumOrUnitID = i
                        if ('label' in currentItemTypeObj['enums'][i]) {
                            enumOrUnitLabel = currentItemTypeObj['enums'][i]['label']
                        } else {
                            enumOrUnitLabel = ''
                        }

                        if ('description' in currentItemTypeObj['enums'][i]) {
                            enumOrUnitDescription = currentItemTypeObj['enums'][i]['description']
                        } else {
                            enumOrUnitDescription = ''
                        }                        

                        this.form.itemTypeEnumsOrUnits.push({
                            'enumOrUnitID': enumOrUnitID,
                            'enumOrUnitLabel': enumOrUnitLabel,
                            'enumOrUnitDescription': enumOrUnitDescription
                        })
                    }
                } else if ("units" in currentItemTypeObj) {
                    this.form.itemTypeType = 'units' 
                    for (let i in currentItemTypeObj['units']) {
                        enumOrUnitID = i
                        if ('label' in currentItemTypeObj['units'][i]) {
                            enumOrUnitLabel = currentItemTypeObj['units'][i]['label']
                        } else {
                            enumOrUnitLabel = ''
                        }

                        if ('description' in currentItemTypeObj['units'][i]) {
                            enumOrUnitDescription = currentItemTypeObj['units'][i]['description']
                        } else {
                            enumOrUnitDescription = ''
                        }     

                        this.form.itemTypeEnumsOrUnits.push({
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
.edit-item-type-create-enums-or-units-table {
    word-break: break-word;
}
</style>