<template>
  <div>
    <b-modal
      ref="modal"
      centered
      :static="true"
      :title="(model._id ? 'Edit' : 'New') + ' Waypoint'"
      hide-header-close
      :no-close-on-esc="$status.processing"
      :no-close-on-backdrop="$status.processing"
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
          :append="course.loops>1?'Loop ' + waypoint.loop:''"
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
          :prepend="course.loops>1?`Loop ${waypoint.loop} loc.`:'Location'"
          :append="$units.dist"
          class="mt-1"
        >
          <b-form-input
            v-model="distf"
            type="number"
            step="0.01"
            :min="locationMin"
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
          class="mt-1"
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
          class="mt-1"
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
          class="mt-1"
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

        <!-- AID STATION CUTOFF --->
        <div v-if="course.race && model.tier===1 && (model.type!=='start' || course.loops > 1)">
          <b-input-group
            :prepend="`${course.loops>1 ? 'Loop ' + waypoint.loop : 'Station'} Cutoff`"
            class="mt-1"
            :append="cutoffTOD"
          >
            <time-input
              v-model="waypoint.cutoff"
              format="hh:mm"
            />
          </b-input-group>
          <form-tip v-if="showTips">
            Optional: time limit{{ course.loops > 1 ? 's' : '' }} for station, from start (hh:mm).
          </form-tip>
        </div>

        <b-input-group
          prepend="Notes"
          class="mt-1"
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
import FormTip from '@/forms/FormTip'
import TimeInput from '@/forms/TimeInput'
import HelpDoc from '@/docs/waypoint.md'
export default {
  components: {
    HelpDoc,
    FormTip,
    TimeInput
  },
  props: {
    course: {
      type: Object,
      required: true
    },
    waypoints: {
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
        terrainFactor: null,
        cutoffs: []
      },
      distf: null,
      terrainTypes: [
        { name: 'Paved', factor: 0 },
        { name: 'Fireroad', factor: 4 },
        { name: 'Doubletrack', factor: 8 },
        { name: 'Singletrack', factor: 12 },
        { name: 'Technical', factor: 20 },
        { name: 'Other', factor: '' }
      ],
      showTips: false,
      trigger: 0,
      waypoint: {}
    }
  },
  computed: {
    locationMin: function () {
      // location max is 0.01 more than current loop distance
      return Number(
        this.$units.distf(
          this.course.trackDist * (this.waypoint.loop - 1) * this.course.distScale, 2)
      ) + 0.01
    },
    locationMax: function () {
      // location max is 0.01 less than current loop distance
      return Number(
        this.$units.distf(
          this.course.trackDist * this.waypoint.loop * this.course.distScale, 2)
      ) - 0.01
    },
    waypointTypeOptions: function () {
      if (this.model.type === 'start' || this.model.type === 'finish') {
        return [{
          value: this.model.type,
          text: this.$waypointTypes[this.model.type].text
        }]
      } else {
        const arr = []
        Object.keys(this.$waypointTypes).forEach(key => {
          if (key !== 'start' && key !== 'finish') {
            arr.push({
              value: key,
              text: this.$waypointTypes[key].text
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
      // eslint-disable-next-line no-unused-expressions
      this.trigger // force recompute
      // 1 - use previous type specified
      // 2 - none (blank)
      if (!this.waypoint?.loc) return ''
      // const waypoint = new this.$core.waypoints.Waypoint({ location: this.model.location }, this.course)
      return this.waypoint.terrainType(this.waypoints, false) || ''
    },
    terrainFactorPlaceholder: function () {
      // eslint-disable-next-line no-unused-expressions
      this.trigger // force recompute
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
      if (!this.waypoint?.loc) return ''
      return String(this.waypoint.terrainFactor(this.waypoints, false) || '')
    },
    cutoffTOD: function () {
      if (!this.course.event.startTime || !this.waypoint.cutoff) return ''
      return this.$utils.time.sec2string(this.course.event.startTime + this.waypoint.cutoff, 'am/pm')
    }
  },
  methods: {
    async changeTerrainType (v) {
      if (v) {
        this.model.terrainFactor = this.terrainTypes.find(x => x.name === v).factor
      }
    },
    async show (db = {}, loop = 1) {
      this.showTips = false
      if (db._id) {
        this.model = JSON.parse(JSON.stringify(db))
      } else {
        this.model = JSON.parse(JSON.stringify(this.defaults))
      }

      this.waypoint = new this.$core.waypoints.Waypoint(this.model, this.course, loop)
      this.distf = this.waypoint.loc ? this.$units.distf(this.waypoint.loc * this.course.distScale, 2) : ''
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

      // get and add LLA for waypoint:
      const wp = new this.$core.waypoints.Waypoint(this.model, this.course, 1)
      wp.refreshLLA(this.course.track)
      ;({ lat: this.model.lat, lon: this.model.lon, alt: this.model.alt } = wp)
      if (this.model._id) {
        this.$gtage(this.$gtag, 'Waypoint', 'edit', this.course.public ? this.course.name : 'private')
        await api.updateWaypoint(this.model._id, this.model)
      } else {
        this.model._course = this.course._id
        this.$gtage(this.$gtag, 'Waypoint', 'create', this.course.public ? this.course.name : 'private')
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
      this.waypoint = {}
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
        this.waypoint.loc = val ? val / this.course.distScale / this.$units.distScale : null
      }
      this.trigger++
    }
  }
}
</script>
