<template>
  <b-form-input
    :id="id"
    ref="timeinput"
    v-model="formatted"
    v-mask="mask"
    type="text"
    :placeholder="placeholder"
    :required="required"
    :state="changed ? valid : null"
    @input="update"
    @change="change"
  />
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      default: ''
    },
    value: {
      type: Number,
      default: null
    },
    format: {
      type: String,
      default: 'mm:ss'
    },
    required: {
      type: Boolean,
      default: false
    },

    default: {
      type: Number,
      default: null
    },

    // used to scale input/output (for paces)
    scale: {
      type: Number,
      default: 1
    }

  },
  data () {
    return {
      formatted: '',
      changed: false
    }
  },
  computed: {
    mask: function () {
      // mask replaces letters (eg hh) with ##
      return this.format.replaceAll(/[A-Z]/ig, '#')
    },
    placeholder: function () {
      if (this.default) return this.$utils.time.sec2string(this.default, this.format)
      return this.format
    },
    val: function () {
      if (!this.formatted || this.formatted.length !== this.format.length) {
        return null
      } else {
        return this.$utils.time.string2sec(this.formatted, this.format)
      }
    },
    valid: function () {
      // neither if not required and empty:
      if (!this.formatted.length && !this.required) return null

      // valid if resulting number is really a number:
      return !(this.val === null || isNaN(this.val))
    }
  },
  watch: {
    value () {
      this.setFormatted()
    }
  },
  mounted () {
    this.setFormatted()
  },
  methods: {
    setFormatted () {
      this.formatted = this.value === this.default
        ? ''
        : this.$utils.time.sec2string(this.value * this.scale, this.format)
    },
    update () {
      if (this.valid !== false) {
        this.$refs.timeinput.setCustomValidity('')
        this.$emit('input', this.valueOrDefault())
      } else {
        this.$refs.timeinput.setCustomValidity(`Enter value as ${this.format}.`)
      }
    },
    change () {
      this.changed = true
      if (this.valid !== false) {
        this.$emit('change', this.valueOrDefault())
      }
    },
    valueOrDefault () {
      if (!this.formatted.length && this.default !== '') return this.default
      return this.val === null ? null : this.val / this.scale
    }
  }
}
</script>
