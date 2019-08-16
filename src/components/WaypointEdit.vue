<template>
  <div>
    <b-modal
      id="waypoint-edit-modal"
      centered
      :static="true"
      v-bind:title="(model._id ? 'Edit' : 'New') + ' Waypoint'"
      @hidden="clear"
      @cancel="clear"
      @ok="handleOk"
    >
      <form ref="waypointform" @submit.prevent="">
        <b-form-group label="Name">
          <b-form-input type="text" v-model="model.name" required>
          </b-form-input>
        </b-form-group>
        <b-form-group
          v-bind:label="'Location [' + units.dist + ']'"
          v-if="model.type != 'start' && model.type != 'finish'">
          <b-form-input
            type="number"
            step="0.01"
            v-model="model.locUserUnit"
            min="0.01"
            v-bind:max="locationMax"
            required>
          </b-form-input>
        </b-form-group>
        <b-form-group label="Type">
          <b-form-select
            type="text"
            v-model="model.type"
            :options="waypointTypeOptions"
            required>
          </b-form-select>
        </b-form-group>
        <b-form-group label="Priority">
          <b-form-select
            type="text"
            v-model="model.tier"
            :options="waypointTiers"
            required>
          </b-form-select>
        </b-form-group>
        <b-form-group label="Terrain Factor [%] Increase">
          <b-form-input
            type="number"
            v-model="model.terrainFactor"
            :placeholder="terrainFactorPlaceholder"
            min="0"
            step="0">
          </b-form-input>
        </b-form-group>
        <b-form-group label="Notes">
          <b-form-textarea rows="4" v-model="model.description">
          </b-form-textarea>
        </b-form-group>
      </form>
      <template slot="modal-footer" slot-scope="{ ok, cancel }">
        <div
          v-if="model._id && model.type !== 'start' && model.type !== 'finish'"
          style="text-align: left; flex: auto">
          <b-button size="sm" variant="danger" @click="remove">
            <b-spinner v-show="deleting" small></b-spinner>
            Delete
          </b-button>
        </div>
        <b-button variant="secondary" @click="cancel()">
          Cancel
        </b-button>
        <b-button variant="primary" @click="ok()">
          <b-spinner v-show="saving" small></b-spinner>
          Save Waypoint
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import api from '@/api'
import wputil from '../../shared/waypointUtilities'
import {tF} from '../../shared/normFactor'
export default {
  props: ['course', 'units', 'terrainFactors'],
  data () {
    return {
      deleting: false,
      model: {},
      saving: false,
      defaults: {
        type: 'aid',
        tier: 1
      }
    }
  },
  computed: {
    locationMax: function () {
      return Number((this.course.distance * this.units.distScale).toFixed(2)) -
        0.01
    },
    waypointTypeOptions: function () {
      if (this.model.type === 'start' || this.model.type === 'finish') {
        return [{
          value: this.model.type,
          text: this.$waypointTypes[this.model.type]
        }]
      } else {
        let arr = []
        Object.keys(this.$waypointTypes).forEach(key => {
          if (key !== 'start' && key !== 'finish') {
            arr.push({
              value: key,
              text: this.$waypointTypes[key]
            })
          }
        })
        return arr
      }
    },
    waypointTiers: function () {
      if (this.model.type === 'start') {
        return [{ value: 1, text: 'Major' }]
      } else if (this.model.type === 'finish') {
        return [{ value: 1, text: 'Major' }]
      } else {
        return [
          { value: 1, text: 'Major' },
          { value: 2, text: 'Minor' },
          { value: 3, text: 'Hidden' }
        ]
      }
    },
    terrainFactorPlaceholder: function () {
      var tFP = ''
      if (!this.model._id) return tFP
      tFP = tF(this.model.location, this.terrainFactors)
      tFP = ((tFP - 1) * 100).toFixed(0)
      return tFP
    }
  },
  methods: {
    async show (waypoint) {
      if (waypoint._id) {
        this.model = Object.assign({}, waypoint)
      } else {
        this.model = Object.assign({}, this.defaults)
      }
      if (this.model.location) {
        this.model.locUserUnit =
          (this.model.location * this.units.distScale).toFixed(2)
      }
      this.$bvModal.show('waypoint-edit-modal')
    },
    handleOk (bvModalEvt) {
      bvModalEvt.preventDefault()
      if (this.$refs.waypointform.reportValidity()) {
        this.save()
      }
    },
    async save () {
      if (this.saving) { return }
      this.saving = true
      if (this.model.type !== 'start' && this.model.type !== 'finish') {
        this.model.location = this.model.locUserUnit / this.units.distScale
      }
      wputil.updateLLA(this.model, this.course.points)
      if (this.model._id) {
        await api.updateWaypoint(this.model._id, this.model)
      } else {
        this.model._course = this.course._id
        await api.createWaypoint(this.model)
      }
      this.$emit('refresh', () => {
        this.saving = false
        this.clear()
        this.$bvModal.hide('waypoint-edit-modal')
      })
    },
    clear () {
      this.model = Object.assign({}, this.defaults)
    },
    async remove () {
      this.deleting = true
      this.$emit('delete', this.model, async (err) => {
        if (!err) {
          this.$bvModal.hide('waypoint-edit-modal')
        }
        this.deleting = false
      })
    }
  }
}
</script>
