<template>
  <b-button
    @click="!ready ? $emit('generate') : {}"
    :href="ready ? url : ''"
    :download="ready ? filename : ''"
    :variant="ready ? 'primary' : 'outline-primary'"
    :disabled="disabled"
  >
    <v-icon v-show="ready" name="download"></v-icon>
    <b-spinner v-show="spinner" small></b-spinner>
    {{ ready ? 'Download' : 'Generate' }} {{ type }} ({{ resolution }} Resolution)
  </b-button>
</template>

<script>
export default {
  props: ['ready', 'spinner', 'url', 'filename', 'type', 'resolution', 'disabled']
}
</script>
