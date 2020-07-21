<template>
  <b-modal id="export-modal" :title=$store.state.exportModalHeader v-model="$store.state.exportModalOpened" @show="resetModal">
    <template v-slot:modal-footer>
      <b-button
        size="sm"
        variant="primary"
        @click="
          exportFile();
        "
      >
        Save
      </b-button>
      <b-button
        size="sm"
        variant="danger"
        @click="
          closeExportModal();
        "
      >
        Cancel
      </b-button>
    </template>

    <b-form @submit.prevent='
      exportFile();
    '>
      <b-form-group
        id="export-form-filename"
        label="File name:*"
        label-for="export-input-filename"
      >
        <b-form-input
          id="export-input-filename"
          v-model="exportForm.filename"
          placeholder="Enter file name"
          required
        >
        </b-form-input>
      </b-form-group>
    </b-form>
    <p v-if="$store.state.currentFile">
      You have
      <strong>{{ $store.state.fileToExportName }}</strong> selected, this
      is the file that will be saved.
    </p>
    <p>**Will save as .json</p>
  </b-modal>
</template>

<script>
export default {
  data() {
    return {
      exportForm: {
        OASDescription: null,
        OASTitle: null,
        OASVersion: null,
        filename: null
      }
    };
  },
  methods: {
    exportFile() {
      for (let property in this.exportForm) {
        if (!this.exportForm[property]) {
          this.exportForm[property] = "left blank";
        }
      }
      let exportObj = {
        type: "exportFile",
        filename: this.exportForm.filename,
        file: this.$store.state.fileToExport,
        info: {
          description: "Description placeholder",
          title: "Title placeholder",
          version: "Version placeholder"
        }
      };

      this.$store.commit(exportObj);
      this.closeExportModal();
    },
    closeExportModal() {
      this.$store.commit("setShowExportModal", false);
    },
    resetModal() {
      for (let property in this.exportForm) {
        this.exportForm[property] = null;
      }
    }
  }
};
</script>

<style></style>
