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
        <b-input-group
          prepend="Name"
          class="mb-2"
          size="sm"
          v-b-popover.hover.bottomright.d250.v-info="
            'Name: name for the waypoint, such as aid station name or landmark description'
          "
        >
          <b-form-input type="text" v-model="model.name" required>
          </b-form-input>
        </b-input-group>
        <b-input-group
          v-if="model.type != 'start' && model.type != 'finish'"
          prepend="Location"
          v-bind:append="units.dist"
          class="mb-2"
          size="sm"
          v-b-popover.hover.bottomright.d250.v-info="
            'Location: distance along course for this waypoint'
          "
        >
          <b-form-input
            type="number"
            step="0.01"
            v-model="model.locUserUnit"
            min="0.01"
            v-bind:max="locationMax"
            required>
          </b-form-input>
        </b-input-group>
        <b-input-group
          prepend="Type"
          class="mb-2"
          size="sm"
          v-b-popover.hover.bottomright.d250.v-info="
            'Type: type of waypoint.\nNote that \'Aid Station\' and \'Water Source\' both include delay for plans.'
          "
        >
          <b-form-select
            type="text"
            v-model="model.type"
            :options="waypointTypeOptions"
            required>
          </b-form-select>
        </b-input-group>
        <b-input-group
          prepend="Priority"
          class="mb-2"
          size="sm"
          v-b-popover.hover.bottomright.d250.v-info="
            'Priority: how important the waypoint is, as follows:\n - Major: always appears on segment breakdown, map, and profile\n - Minor: only appears in tables, map, and profile when its major segment is expanded\n - Minor: never appears in tables, map, or profile (used for terrain factor only)'
          "
        >
          <b-form-select
            type="text"
            v-model="model.tier"
            :options="waypointTiers"
            required>
          </b-form-select>
        </b-input-group>
        <b-input-group
          prepend="Terrain factor"
          append="% (increase)"
          class="mb-2"
          size="sm"
          v-b-popover.hover.bottomright.d250.v-info="
            'Terrain factor: terrain-based pace adjustment, basically anything that is too small to appear in elevation data. Requires course knowledge. Guidelines:\n - Paved surface: 0%\n - Smooth fire road: 2-4%\n - Smooth singletrack: 5-10%\n - Rocky singletrack: 10-20%\n - Technical trail: 20%+'
          "
        >
          <b-form-input
            type="number"
            v-model="model.terrainFactor"
            :placeholder="terrainFactorPlaceholder"
            min="0"
            step="0">
          </b-form-input>
        </b-input-group>
        <b-input-group
          prepend="Notes"
          class="mb-2"
          size="sm"
          v-b-popover.hover.bottomright.d250.v-info="
            'Notes: description of waypoint, crew access, supplies, etc.'
          "
        >
          <b-form-textarea rows="4" v-model="model.description">
          </b-form-textarea>
        </b-input-group>
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
import wputil from '../util/waypoints'
import {tF} from '../util/normFactor'
export default {
  props: ['course', 'points', 'units', 'terrainFactors'],
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
      wputil.updateLLA(this.model, this.points)
      if (this.model._id) {
        this.$ga.event('Waypoint', 'edit', this.course.public ? this.course.name : 'private')
        await api.updateWaypoint(this.model._id, this.model)
      } else {
        this.model._course = this.course._id
        this.$ga.event('Waypoint', 'create', this.course.public ? this.course.name : 'private')
        await api.createWaypoint(this.model)
      }
      this.$emit('refresh', () => {
        this.saving = false
        this.clear()
        this.$emit('setUpdateFlag')
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
        this.$emit('setUpdateFlag')
        this.deleting = false
      })
    }
  }
}
</script>
