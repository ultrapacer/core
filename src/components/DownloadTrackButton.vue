<template>
  <b-button
    :href="ready ? url : ''"
    :download="ready ? filename : ''"
    :variant="ready ? 'primary' : 'outline-primary'"
    :disabled="disabled"
    @click="!ready ? $emit('generate') : {}"
  >
    <v-icon
      v-show="ready"
      name="download"
    />
    <b-spinner
      v-show="spinner"
      small
    />
    {{ ready ? 'Download' : 'Generate' }} {{ type }} ({{ resolution }} Resolution)
  </b-button>
</template>

<script>
export default {
  props: {
    ready: {
      type: Boolean,
      default: false
    },
    spinner: {
      type: Boolean,
      default: false
    },
    url: {
      type: String,
      default: ''
    },
    filename: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      required: true
    },
    resolution: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
}
</script>
