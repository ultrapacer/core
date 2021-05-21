<template>
  <div>
    <b-modal
      ref="modal"
      centered
      :static="true"
      :title="(model._id ? 'Edit' : 'New') + ' Waypoint'"
      hide-header-close
      :no-close-on-esc="this.$status.processing"
      :no-close-on-backdrop="this.$status.processing"
      @hidden="clear"
      @cancel="clear"
      @ok="handleOk"
    >
      <form
        ref="waypointform"
        @submit.prevent=""
      >
        <b-input-group
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
        <form-tip v-if="showTips">
          Required: name for the waypoint, such as aid station name or landmark description.
        </form-tip>
        <b-input-group
          v-if="model.type != 'start' && model.type != 'finish'"
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
            @change="updateLocation"
          />
        </b-input-group>
        <form-tip v-if="showTips">
          Required: distance along course for this waypoint.
        </form-tip>
        <b-input-group
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
        <form-tip v-if="showTips">
          Required: type of waypoint.
          Note that "Aid Station" and "Water Source" both include delays for plans.
        </form-tip>
        <b-input-group
          prepend="Visibility"
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
        <form-tip v-if="showTips">
          Required: when waypoint shows on maps/tables (see Docs).
        </form-tip>
        <b-input-group
          v-if="model.type !== 'finish'"
          prepend="Terrain"
          append="% (increase)"
          class="mb-2"
          size="sm"
        >
          <b-form-select
            v-model="model.terrainType"
            type="text"
            @change="changeTerrainType"
          >
            <b-form-select-option
              v-if="terrainTypePlaceholder && !model.terrainType"
              :value="null"
              selected
              hidden
            >
              {{ terrainTypePlaceholder }}
            </b-form-select-option>
            <b-form-select-option
              v-for="t in terrainTypes"
              :key="t.name"
              :value="t.name"
            >
              {{ t.name }}
            </b-form-select-option>
          </b-form-select>
          <b-form-input
            v-model="model.terrainFactor"
            type="number"
            :placeholder="terrainFactorPlaceholder"
            min="0"
            step="0"
          />
        </b-input-group>
        <form-tip v-if="showTips">
          Required: terrain-based pace adjustment, basically anything that is too small to appear in elevation data (see Docs).
        </form-tip>
        <b-input-group
          prepend="Notes"
          class="mb-2"
          size="sm"
        >
          <b-form-textarea
            v-model="model.description"
            rows="4"
          />
        </b-input-group>
        <form-tip v-if="showTips">
          Optional: description of waypoint, crew access, supplies, cut-off times, etc.
        </form-tip>
      </form>
      <template #modal-footer="{ ok, cancel }">
        <div
          style="text-align: left; flex: auto"
        >
          <b-button
            size="sm"
            variant="warning"
            @click="$refs.help.show()"
          >
            Docs
          </b-button>
          <b-button
            size="sm"
            variant="warning"
            @click="toggleTips()"
          >
            Tips
          </b-button>
        </div>
        <b-button
          v-if="model._id && model.type !== 'start' && model.type !== 'finish'"
          variant="danger"
          @click="remove"
        >
          Delete
        </b-button>
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
          Save
        </b-button>
      </template>
    </b-modal>
    <b-modal
      ref="help"
      :title="`Waypoint ${model._id ? 'Edit' : 'Create'} Help`"
      size="lg"
      scrollable
      ok-only
    >
      <help-doc class="documentation" />
    </b-modal>
  </div>
</template>

<script>
import api from '@/api'
import FormTip from './FormTip'
import HelpDoc from '@/docs/waypoint.md'
import wputil from '../util/waypoints'
export default {
  components: {
    HelpDoc,
    FormTip
  },
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
      model: {},
      defaults: {
        type: 'aid',
        tier: 1,
        terrainType: null,
        terrainFactor: null
      },
      terrainTypes: [
        { name: 'Paved', factor: 0 },
        { name: 'Fire road', factor: 4 },
        { name: 'Double track', factor: 8 },
        { name: 'Singletrack', factor: 12 },
        { name: 'Technical', factor: 20 },
        { name: 'Other', factor: '' }
      ],
      showTips: false
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
      if (this.model.type === 'start' || this.model.type === 'finish') {
        return [{ value: 1, text: 'Primary' }]
      } else {
        return [
          { value: 1, text: 'Primary' },
          { value: 2, text: 'Secondary' },
          { value: 3, text: 'Hidden' }
        ]
      }
    },
    terrainTypePlaceholder: function () {
      // 1 - use previous type specified
      // 2 - none (blank)
      if (!this.course.waypoints.length) return ''
      const wp = this.course.waypoints.filter(x =>
        x._id !== this.model._id &&
        x.location < this.model.location &&
        x.terrainType
      )
      if (wp.length) {
        return wp[wp.length - 1].terrainType
      } else {
        return ''
      }
    },
    terrainFactorPlaceholder: function () {
      // 1 - if a new type is specified, use default for that type
      // 2 - use previous type specified
      // 3 - none (blank)
      if (
        this.model.terrainType &&
        this.model.terrainType !== 'Other' &&
        this.model.terrainType !== this.model.terrainTypePlaceholder
      ) {
        const tt = this.terrainTypes.find(x => x.name === this.model.terrainType)
        if (tt) return String(tt.factor)
      }
      if (!this.course.waypoints.length) return ''
      const wp = this.course.waypoints.filter(x =>
        x._id !== this.model._id &&
        x.location < this.model.location &&
        x.terrainFactor !== null
      )
      if (wp.length) {
        return String(wp[wp.length - 1].terrainFactor)
      } else {
        return ''
      }
    }
  },
  methods: {
    async changeTerrainType (v) {
      if (v) {
        this.model.terrainFactor = this.terrainTypes.find(x => x.name === v).factor
      }
    },
    async show (waypoint) {
      this.showTips = false
      if (waypoint._id) {
        this.model = Object.assign({}, waypoint)
      } else {
        this.model = Object.assign({}, this.defaults)
      }
      this.model.locUserUnit = this.model.location ? this.$units.distf(this.model.location, 2) : ''
      this.$refs.modal.show()
    },
    handleOk (bvModalEvt) {
      bvModalEvt.preventDefault()
      if (this.$refs.waypointform.reportValidity()) {
        this.save()
      }
    },
    async save () {
      if (this.$status.processing) { return }
      this.$status.processing = true
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
        this.$status.processing = false
        this.clear()
        this.$emit('setUpdateFlag')
        this.$refs.modal.hide()
      })
    },
    clear () {
      this.model = Object.assign({}, this.defaults)
    },
    async remove () {
      this.$emit('delete', this.model, async (err) => {
        if (!err) {
          this.$refs.modal.hide()
        }
        this.$emit('setUpdateFlag')
      })
    },
    toggleTips () {
      this.showTips = !this.showTips
    },
    updateLocation: function (val) {
      if (this.model.type !== 'start' && this.model.type !== 'finish') {
        this.$set(this.model, 'location', val ? val / this.$units.distScale : null)
      }
    }
  }
}
</script>
