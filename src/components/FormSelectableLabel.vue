<template>
  <div
    role="group"
    class="input-group mb-2 input-group-sm"
  >
    <b-form-select
      v-model="val"
      class="input-group-prepend input-group-text"
      style="height:auto; width: auto; flex: inherit; background-color: rgb(233, 236, 239)"
      :options="options"
      size="sm"
      required
      small
      @change="change"
    />
    <div
      class="form-control input-group-sm"
      style="height: auto"
    >
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: [String, Number],
      required: true
    },
    options: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      val: null
    }
  },
  watch: {
    value: function (v) {
      this.val = v
    }
  },
  mounted () {
    this.val = this.value
  },
  methods: {
    change: function (v) {
      this.$emit('input', v)
    }
  }
}
</script>
