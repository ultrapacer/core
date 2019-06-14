<template>
  <div>
    <b-modal
      id="delete-modal"
      centered
      :static="true"
      v-bind:title="'Delete ' + type + '?'"
      @hidden="clear"
      @cancel="clear"
      @ok="handleOk"
    >
      <p>Are you sure you want to delete the following {{ type }}?</p>
      <p><b>{{ object.name }}</b></p>
      <template slot="modal-ok" slot-scope="{ ok }">
        <b-spinner v-show="deleting" small></b-spinner>
        Delete {{ type }}
      </template>
    </b-modal>
  </div>
</template>

<script>
export default {
  data () {
    return {
      deleting: false,
      delFun: null,
      model: {},
      object: {},
      type: ''
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
    async show (type, object, delFun, cb) {
      this.type = type
      this.object = object
      this.delFun = delFun
      this.cb = cb
      this.$bvModal.show('delete-modal')
    }
  }
}
</script>
