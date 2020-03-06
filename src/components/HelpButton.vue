<template>
<b-button size="sm" variant="outline-primary"
  v-b-popover.click.blur.topright.d250.v-info="{
    content: message
  }"
  style="padding-left: 0.2rem">
  ?
</b-button>
</template>
<script>
export default {
  props: ['message']
}
</script>
