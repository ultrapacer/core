<template>
  <div>
    <b-modal
      ref="modal"
      centered
      :static="true"
      hide-header-close
      :no-close-on-esc="this.$status.processing"
      :no-close-on-backdrop="this.$status.processing"
      @hidden="clear"
      @cancel="clear"
      @ok="handleOk"
    >
      <template #modal-title>
        {{ verb | capitalize }} {{ type | capitalize }}?
      </template>
      <p>Are you sure you want to {{ verb }} the following {{ type }}?</p>
      <p><b>{{ object.name }}</b></p>
      <template #modal-ok>
        {{ verb | capitalize }} {{ type }}
      </template>
    </b-modal>
  </div>
</template>

<script>
export default {
  filters: {
    capitalize: function (value) {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  },
  data () {
    return {
      delFun: null,
      model: {},
      object: {},
      type: '',
      verb: 'delete'
    }
  },
  methods: {
    handleOk (bvModalEvt) {
      bvModalEvt.preventDefault()
      this.remove()
    },
    clear () {
      this.$status.processing = false
      if (typeof (this.cb) === 'function') this.cb(new Error('User cancelled'))
    },
    async remove () {
      this.$status.processing = true
      await this.delFun(this.object)
      this.$refs.modal.hide()
      if (typeof (this.cb) === 'function') await this.cb()
      this.$status.processing = false
    },
    async show (data, delFun, cb) {
      this.type = data.type
      this.object = data.object
      this.verb = data.verb || 'delete'
      this.delFun = delFun
      this.cb = cb
      this.$refs.modal.show()
    }
  }
}
</script>
