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
  props: ['object', 'type', 'cb'],
  data () {
    return {
      model: {},
      deleting: false
    }
  },
  watch: {
    object: function (val) {
      if (val.hasOwnProperty('name')) {
        this.$bvModal.show('delete-modal')
      }
    }
  },
  methods: {
    handleOk (bvModalEvt) {
      bvModalEvt.preventDefault()
      this.remove()
    },
    clear () {
      this.$emit('cancel', this.cb)
    },
    async remove () {
      this.deleting = true
      this.$emit('delete', this.object, async (err) => {
        if (!err) {
          this.$bvModal.hide('delete-modal')
        }
        this.deleting = false
        if (typeof (this.cb) === 'function') this.cb()
      })
    }
  }
}
</script>
