<template>
  <b-button
    v-b-popover.click.blur.topright.d250.v-info="{
      content: message
    }"
    size="sm"
    variant="outline-primary"
    style="padding-left: 0.2rem"
  >
    ?
  </b-button>
</template>
<script>
export default {
  props: {
    message: {
      type: String,
      required: true
    }
  }
}
</script>
