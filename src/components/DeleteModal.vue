<template>
  <div>
    <b-modal
      id="delete-modal"
      centered
      :static="true"
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
        <b-spinner
          v-show="deleting"
          small
        />
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
      deleting: false,
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
      this.deleting = false
      if (typeof (this.cb) === 'function') this.cb(new Error('User cancelled'))
    },
    async remove () {
      this.deleting = true
      await this.delFun(this.object)
      this.$bvModal.hide('delete-modal')
      this.deleting = false
      if (typeof (this.cb) === 'function') this.cb()
    },
    async show (data, delFun, cb) {
      this.type = data.type
      this.object = data.object
      this.verb = data.verb || 'delete'
      this.delFun = delFun
      this.cb = cb
      this.$bvModal.show('delete-modal')
    }
  }
}
</script>
