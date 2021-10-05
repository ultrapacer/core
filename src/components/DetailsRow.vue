<template>
  <b-row>
    <b-col
      :cols="sizes.cols || 4"
      :sm="sizes.sm || 3"
      :lg="sizes.lg || 3"
      :xl="sizes.xl || 2"
      class="text-right pr-0"
    >
      {{ description }}{{ description ? ':' : '' }}
    </b-col>
    <b-col>
      <slot name="value">
        <b>{{ value }}</b>
      </slot>
    </b-col>
  </b-row>
</template>

<script>
export default {
  props: {
    description: {
      type: String,
      required: true
    },
    value: {
      type: String,
      default: ''
    },
    sizes: {
      type: Object,
      default: () => { return {} }
    }
  }
}
</script>
