<template>
  <div>
    <b-modal
      ref="modal"
      centered
      :static="true"
      :title="(model._id ? 'Edit' : 'New') + ' Waypoint'"
      @hidden="clear"
      @cancel="clear"
      @ok="handleOk"
    >
      <form
        ref="waypointform"
        @submit.prevent=""
      >
        <b-input-group
          v-b-popover.hover.bottomright.d250.v-info="
            'Name: name for the waypoint, such as aid station name or landmark description'
          "
          prepend="Name"
          class="mb-2"
          size="sm"
        >
          <b-form-input
            v-model="model.name"
            type="text"
            required
          />
        </b-input-group>
        <b-input-group
          v-if="model.type != 'start' && model.type != 'finish'"
          v-b-popover.hover.bottomright.d250.v-info="
            'Location: distance along course for this waypoint'
          "
          prepend="Location"
          :append="$units.dist"
          class="mb-2"
          size="sm"
        >
          <b-form-input
            v-model="model.locUserUnit"
            type="number"
            step="0.01"
            min="0.01"
            :max="locationMax"
            required
          />
        </b-input-group>
        <b-input-group
          v-b-popover.hover.bottomright.d250.v-info="
            'Type: type of waypoint.\nNote that \'Aid Station\' and \'Water Source\' both include delay for plans.'
          "
          prepend="Type"
          class="mb-2"
          size="sm"
        >
          <b-form-select
            v-model="model.type"
            type="text"
            :options="waypointTypeOptions"
            required
          />
        </b-input-group>
        <b-input-group
          v-b-popover.hover.bottomright.d250.v-info="
            'Priority: how important the waypoint is, as follows:\n - Major: always appears on segment breakdown, map, and profile\n - Minor: only appears in tables, map, and profile when its major segment is expanded\n - Minor: never appears in tables, map, or profile (used for terrain factor only)'
          "
          prepend="Priority"
          class="mb-2"
          size="sm"
        >
          <b-form-select
            v-model="model.tier"
            type="text"
            :options="waypointTiers"
            required
          />
        </b-input-group>
        <b-input-group
          v-b-popover.hover.bottomright.d250.v-info="
            'Terrain factor: terrain-based pace adjustment, basically anything that is too small to appear in elevation data. Requires course knowledge. Guidelines:\n - Paved surface: 0%\n - Smooth fire road: 2-4%\n - Smooth singletrack: 5-10%\n - Rocky singletrack: 10-20%\n - Technical trail: 20%+'
          "
          prepend="Terrain factor"
          append="% (increase)"
          class="mb-2"
          size="sm"
        >
          <b-form-input
            v-model="model.terrainFactor"
            type="number"
            :placeholder="terrainFactorPlaceholder"
            min="0"
            step="0"
          />
        </b-input-group>
        <b-input-group
          v-b-popover.hover.bottomright.d250.v-info="
            'Notes: description of waypoint, crew access, supplies, etc.'
          "
          prepend="Notes"
          class="mb-2"
          size="sm"
        >
          <b-form-textarea
            v-model="model.description"
            rows="4"
          />
        </b-input-group>
      </form>
      <template #modal-footer="{ ok, cancel }">
        <div
          v-if="model._id && model.type !== 'start' && model.type !== 'finish'"
          style="text-align: left; flex: auto"
        >
          <b-button
            size="sm"
            variant="danger"
            @click="remove"
          >
            <b-spinner
              v-show="deleting"
              small
            />
            Delete
          </b-button>
        </div>
        <b-button
          variant="secondary"
          @click="cancel()"
        >
          Cancel
        </b-button>
        <b-button
          variant="primary"
          @click="ok()"
        >
          <b-spinner
            v-show="saving"
            small
          />
          Save Waypoint
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import api from '@/api'
import wputil from '../util/waypoints'
import { tF } from '../util/normFactor'
export default {
  props: {
    course: {
      type: Object,
      required: true
    },
    points: {
      type: Array,
      required: true
    },
    terrainFactors: {
      type: Array,
      required: true
    }
  },
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
      return Number(this.$units.distf(this.course.distance, 2)) -
        0.01
    },
    waypointTypeOptions: function () {
      if (this.model.type === 'start' || this.model.type === 'finish') {
        return [{
          value: this.model.type,
          text: this.$waypointTypes[this.model.type]
        }]
      } else {
        const arr = []
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
      let tFP = ''
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
          this.$units.distf(this.model.location, 2)
      }
      this.$refs.modal.show()
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
        this.model.location = this.model.locUserUnit / this.$units.distScale
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
        this.$refs.modal.hide()
      })
    },
    clear () {
      this.model = Object.assign({}, this.defaults)
    },
    async remove () {
      this.deleting = true
      this.$emit('delete', this.model, async (err) => {
        if (!err) {
          this.$refs.modal.hide()
        }
        this.$emit('setUpdateFlag')
        this.deleting = false
      })
    }
  }
}
</script>
