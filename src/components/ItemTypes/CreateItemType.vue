<template>
    <div class="edit-item-types-container">
        <b-form @submit="onSubmit" @reset="onReset">
            <b-form-group
                id="input-group-item-type-name"
                label="Item Type Name:"
                label-for="input-item-type-name"
            >
                <b-form-input
                    id="input-item-type-name"
                    v-model="form.itemTypeName"
                    required
                    :disabled="submitted"
                ></b-form-input>
            </b-form-group>

            <b-form-group
                id="input-group-item-type-description"
                label="Description:"
                label-for="input-item-type-description"
            >
                <b-form-textarea
                    id="input-item-type-description"
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
                    id="create-enums-or-units-table" 
                    class="item-type-table"
                    ref="create-enums-or-units-table-ref"
                >
                </b-table>
            </div>


            <span v-if="form.itemTypeType == 'units' && !submitted">
                Add units:
            </span>
            <span v-else-if="form.itemTypeType == 'enums' && !submitted">
                Add enums:
            </span>   
            <div id="add-enum-or-unit-container" v-if="form.itemTypeType && !submitted">
                <b-form @submit="addEnumOrUnit">
                    <div v-if="form.itemTypeType == 'units'">
                        <b-form-group
                            id="input-group-add-unit-id"
                            label="Unit ID:"
                            label-for="input-add-unit-id"
                        >
                            <b-form-input
                                id="input-add-unit-id"
                                v-model="enumsOrUnitsToAddForm.enumOrUnitID"
                                required
                            ></b-form-input>
                        </b-form-group>
                        <b-form-group
                            id="input-group-add-unit-label"
                            label="Unit Label:"
                            label-for="input-add-unit-label"
                        >
                            <b-form-input
                                id="input-add-unit-label"
                                v-model="enumsOrUnitsToAddForm.enumOrUnitLabel"
                                required
                            ></b-form-input>
                        </b-form-group>
                        <b-form-group
                            id="input-group-add-unit-description"
                            label="Unit Description:"
                            label-for="input-add-unit-description"
                        >
                            <b-form-input
                                id="input-add-unit-description"
                                v-model="enumsOrUnitsToAddForm.enumOrUnitDescription"
                            ></b-form-input>
                        </b-form-group>                                        
                    </div>

                    <div v-if="form.itemTypeType == 'enums'">
                        <b-form-group
                            id="input-group-add-enum-ID"
                            label="Enum ID:"
                            label-for="input-add-enum-ID"
                        >
                            <b-form-input
                                id="input-add-enum-ID"
                                v-model="enumsOrUnitsToAddForm.enumOrUnitID"
                                required
                            ></b-form-input>
                        </b-form-group>
                        <b-form-group
                            id="input-group-add-enum-label"
                            label="Enum Label:"
                            label-for="input-add-enum-label"
                        >
                            <b-form-input
                                id="input-add-enum-label"
                                v-model="enumsOrUnitsToAddForm.enumOrUnitLabel"
                                required
                            ></b-form-input>
                        </b-form-group>
                        <b-form-group
                            id="input-group-add-enum-description"
                            label="Enum Description:"
                            label-for="input-add-enum-description"
                        >
                            <b-form-input
                                id="input-add-enum-description"
                                v-model="enumsOrUnitsToAddForm.enumOrUnitDescription"
                            ></b-form-input>
                        </b-form-group>                    
                    </div>

                    <div class="center-items-container">
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

        <div class="line-break">
        </div>

        <div class="center-items-container">
            <b-button variant="danger" @click="exitView" size="sm">Back</b-button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            form: {
                'itemTypeName': '',
                'itemTypeType': '',
                'itemTypeDescription': ''
            },
            itemTypeTypes: [
                { text: 'Select type', value: ''},
                { text: 'Units', value: 'units'},
                { text: 'Enums', value: 'enums'}
            ],
            addUnitFields: [
                { key: "enumOrUnitID", label: "Unit ID", thStyle: { width: "150px" } }, 
                { key: "enumOrUnitLabel", label: "Unit Label", thStyle: { width: "150px" } },
                { key: "enumOrUnitDescription", label: "Unit Description"}
            ],
            addEnumFields: [
                { key: "enumOrUnitID", label: "Enum ID", thStyle: { width: "150px" } }, 
                { key: "enumOrUnitLabel", label: "Enum Label", thStyle: { width: "150px" } },
                { key: "enumOrUnitDescription", label: "Enum Description"}
            ],            
            enumsOrUnitsToAdd: [],
            enumsOrUnitsToAddForm: {
                'enumOrUnitID': '',
                'enumOrUnitLabel': '',
                'enumOrUnitDescription': ''
            },
            selectedEnumOrUnit: [],
            submitted: false
        }
    },
    methods: {
        exitView() {
            this.$store.commit("showNoItemTypesViews")
        },
        onSubmit(event) {
            event.preventDefault()
            let payload = {
                "itemTypeName" : this.form.itemTypeName,
                "itemTypeType": this.form.itemTypeType,
                "itemTypeDescription": this.form.itemTypeDescription,
                "itemTypeEnumsOrUnits": this.enumsOrUnitsToAdd
            }
            this.submitted = true
            this.$store.commit("createItemType", payload);
        },
        onReset(event) {
            this.form.itemTypeName = ''
            this.form.itemTypeType = ''
            this.form.itemTypeDescription = ''
            this.enumsOrUnitsToAdd = []
            this.enumsOrUnitsToAddForm.enumOrUnitID = ''
            this.enumsOrUnitsToAddForm.enumOrUnitLabel = ''
            this.enumsOrUnitsToAddForm.enumOrUnitDescription = ''
            this.submitted = false
        },
        addEnumOrUnit() {
            if (this.enumsOrUnitsToAddForm.enumOrUnitID && this.enumsOrUnitsToAddForm.enumOrUnitLabel) {
                event.preventDefault()
                this.enumsOrUnitsToAdd.push(
                    {
                        'enumOrUnitID': this.enumsOrUnitsToAddForm.enumOrUnitID,
                        'enumOrUnitLabel': this.enumsOrUnitsToAddForm.enumOrUnitLabel,
                        'enumOrUnitDescription': this.enumsOrUnitsToAddForm.enumOrUnitDescription
                    }
                )
                this.enumsOrUnitsToAddForm.enumOrUnitID = ''
                this.enumsOrUnitsToAddForm.enumOrUnitLabel = ''
                this.enumsOrUnitsToAddForm.enumOrUnitDescription = ''                
            }
        },
        removeEnumOrUnit() {
            if (this.selectedEnumOrUnit.length) {
                let counter = 0
                for (let i = 0; i < this.enumsOrUnitsToAdd.length; i++) {
                    if (this.selectedEnumOrUnit[0]['enumOrUnitID'] == this.enumsOrUnitsToAdd[i]['enumOrUnitID']) {
                        break
                    } else {
                        counter++
                    }
                }
                this.enumsOrUnitsToAdd.splice(counter, 1)
            }
        },
        returnEnumOrUnitFields(itemTypeType) {
            if (itemTypeType == 'units') {
                return this.addUnitFields
            } else if (itemTypeType == 'enums') {
                return this.addEnumFields
            }
        },
        onRowSelected(items) {
            this.selectedEnumOrUnit = items
        }
    },
    computed: {
        enumOrUnitToAddComputed() {
            return this.enumsOrUnitsToAdd
        },
        // if item type is selected in form, display table and unit/enum creation form
        creatingItemType() {
            return this.form.itemTypeType
        }
    },
    watch: {
        'form.itemTypeType'() {
            // this.enumsOrUnitsToAdd = []
            this.enumsOrUnitsToAddForm.enumOrUnitID = ''
            this.enumsOrUnitsToAddForm.enumOrUnitLabel = ''
            this.enumsOrUnitsToAddForm.enumOrUnitDescription = ''
            this.enumsOrUnitsToAdd = []
            this.enumsOrUnitsToAddForm.enumOrUnitID = ''
            this.enumsOrUnitsToAddForm.enumOrUnitLabel = ''
            this.enumsOrUnitsToAddForm.enumOrUnitDescription = ''
        }
    }
}

</script>

<style>
.center-items-container {
    display: flex;
    justify-content: center;
    align-items: center;
}

.line-break {
    height: 15px;
}

ul > li {
    display: inline-block;
}

.item-type-table {
    background-color: white;
}

#add-enum-or-unit-container {
    border: #cccccc solid 1px;
    padding: 5px;

}

.enum-or-unit-table-container {
    word-break: break-word;
}

</style>