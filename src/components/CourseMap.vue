<template>
  <div
    ref="courseMapContainer"
    :style="'height: ' + mapHeight + 'px'"
  >
    <l-map
      ref="courseMap"
      style="height:100%"
      :bounds="bounds"
      :max-zoom="maxZoom"
      @baselayerchange="updateMaxZoom"
    >
      <l-control-layers position="topright" />
      <l-tile-layer
        v-for="tileProvider in tileProviders"
        :key="tileProvider.name"
        :name="tileProvider.name"
        :visible="tileProvider.visible"
        :url="tileProvider.url"
        :attribution="tileProvider.attribution"
        layer-type="base"
      />
      <l-polyline
        :lat-lngs="courseLL"
        :color="$colors.blue1.hex"
      />
      <l-polyline
        :if="focusLL.length"
        :lat-lngs="focusLL"
        :weight="4"
        :color="$colors.red2.hex"
      />
      <l-polyline
        :if="focusLL2.length"
        :lat-lngs="focusLL2"
        :weight="4"
        :color="$colors.red2.hex"
      />
      <!-- Start Marker -->
      <l-marker
        v-if="showFocusEndpoints && focusLL.length"
        :lat-lng="focusLL2.length ? [focusLL2[0][0], focusLL2[0][1]]: [focusLL[0][0], focusLL[0][1]]"
        :z-index-offset="0"
        :icon="getIcon($math.round($units.distf(focus[0] * course.distScale),0) || 'S')"
      />
      <!-- End Marker -->
      <l-marker
        v-if="showFocusEndpoints && focusLL.length"
        :lat-lng="[focusLL[focusLL.length-1][0], focusLL[focusLL.length-1][1]]"
        :z-index-offset="0"
        :icon="getIcon(focus[1]===course.dist ? 'F' : $math.round($units.distf(focus[1] * course.distScale),0))"
      />
      <l-circle-marker
        v-for="wp in waypoints2"
        :key="wp.site._id+'_'+wp.loop"
        :lat-lng="[wp.lat, wp.lon]"
        :radius="6"
        :fill="true"
        :color="$waypointTypes[wp.type].color.hex"
        :fill-color="$waypointTypes[wp.type].backgroundColor.hex"
        :fill-opacity="0.5"
        :weight="2"
        @click="waypointClick(wp, $event)"
      >
        <l-popup>
          <b>{{ $waypointTypes[wp.type].text }}</b><br>
          {{ wp.name }}
          [{{ waypointLocation(wp.site) }} {{ $units.dist }}]
        </l-popup>
      </l-circle-marker>
      <l-marker
        v-if="highlightPoint"
        :lat-lng="[highlightPoint.lat, highlightPoint.lon]"
        :z-index-offset="100"
      />
    </l-map>
  </div>
</template>

<script>
import { LMap, LControlLayers, LMarker, LTileLayer, LPolyline, LCircleMarker, LPopup } from 'vue2-leaflet'
import 'leaflet/dist/leaflet.css'
import { Icon, divIcon } from 'leaflet'
delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export default {
  components: {
    LMap,
    LMarker,
    LTileLayer,
    LControlLayers,
    LPolyline,
    LCircleMarker,
    LPopup
  },
  props: {
    course: {
      type: Object,
      required: true
    },
    waypoints: {
      type: Array,
      default () { return [] }
    },
    focus: {
      type: Array,
      default () { return [] }
    },
    highlightPoint: {
      type: Object,
      default () { return null }
    },
    showFocusEndpoints: {
      // used to deterime if markers should be shown when focusing on a segment
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      courseCenter: [],
      courseLL: [],
      courseBounds: [],
      focusBounds: [],
      focusCenter: [],
      focusLL: [],
      focusLL2: [], // for when the focus wraps around on loop course
      initializing: true,
      isMounted: false,
      logger: this.$log.child({ file: 'CourseMap.vue' }),
      maxZoom: 18,
      tileProviders: [
        {
          name: 'TF Outdoors',
          'max-zoom': 18,
          visible: true,
          url: `https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png${process.env.THUNDERFOREST_API_KEY ? '?apikey=' + process.env.THUNDERFOREST_API_KEY : ''}`,
          attribution:
            'Maps: &copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, Data &copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        },
        {
          name: 'OpenTopoMap',
          'max-zoom': 16,
          visible: false,
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          attribution:
            'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        },
        {
          name: 'OpenStreetMap',
          'max-zoom': 18,
          visible: false,
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution:
            '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        },
        {
          name: 'ESRI Satellite',
          'max-zoom': 18,
          visible: false,
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution:
            'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }
      ],
      mapHeightDefault: 300
    }
  },
  computed: {
    bounds: function () {
      if (this.focusLL.length) {
        return this.focusBounds
      } else {
        return this.courseBounds
      }
    },
    mapHeight: function () {
      let hm = this.mapHeightDefault
      if (this.isMounted && this.$window.width >= 992) {
        const t = this.$refs.courseMapContainer.getBoundingClientRect().top
        if (this.$window.height - t > hm) {
          hm = this.$window.height - t
        }
      }
      return hm
    },
    pointsllls: function () {
      return this.course.track
        .map(p => {
          return {
            loc: this.$math.round(p.loc, 4),
            lat: p.lat,
            lon: p.lon
          }
        })
    },
    points2: function () {
      // return loc/lat/lon objects for track, waypoints, and split breaks

      let arr = []

      try {
        // create array of loc/lat/lon objects at each split break:
        const splitBreaks = Array.from(Array(Math.floor(this.$units.distf(this.course.dist / this.course.distScale)) + 1).keys())
        splitBreaks.shift()
        const splitBreaks2 = splitBreaks
          .map(x => (x / this.course.distScale / this.$units.distScale) % this.course.track.dist)
          .sort((a, b) => a - b)
        const splitLLAs = this.course.track.getLLA(splitBreaks2)
        const splitPoints = splitLLAs.map((lla, i) => {
          return {
            loc: this.$math.round(splitBreaks2[i], 4),
            lat: lla.lat,
            lon: lla.lon
          }
        })

        // combine loc/lat/lon objects for track, waypoints, and split breaks
        arr = [
          ...this.pointsllls,
          ...this.waypoints2llls,
          ...splitPoints
        ].sort((a, b) => a.loc - b.loc)
      } catch (error) {
        this.logger.child({ method: 'points2' }).error(error.stack)
      }

      return arr
    },
    waypoints2: function () {
      return this.waypoints.filter(wp => wp.loop === 1 || wp.type === 'finish')
    },
    waypoints2llls: function () {
      return this.waypoints2.map(wp => {
        return {
          loc: this.$math.round(wp.type === 'finish' ? this.course.track.dist : wp.loc % this.course.track.dist, 4),
          lat: wp.lat,
          lon: wp.lon
        }
      })
    }
  },
  watch: {
    focus: function (val) {
      try {
        if (val.length) {
          const lower = this.$math.round(val[0] % this.course.track.dist, 4)
          const upper = this.$math.round(val[1] % this.course.track.dist || this.course.track.dist, 4)
          const points = this.points2.filter(p =>
            (upper > lower && p.loc >= lower && p.loc <= upper) ||
          (upper < lower && (p.loc <= upper || p.loc >= lower))
          )
          const res = this.getLLs(points)
          if (upper > lower) {
            this.focusLL = res.ll
            this.focusLL2 = []
          } else {
            this.focusLL = res.ll.filter((p, i) => points[i].loc <= upper)
            this.focusLL2 = res.ll.filter((p, i) => points[i].loc >= lower)
          }
          this.focusCenter = res.center
          this.focusBounds = res.bounds
        } else {
          this.focusLL = []
          this.focusLL2 = []
        }
      } catch (error) {
        this.logger.child({ method: 'watch=>focus' }).error(error.stack)
      }
    },
    mapHeight: function () {
      this.$logger('CourseMap|resized')
      this.$nextTick(function () {
        this.$refs.courseMap.mapObject.invalidateSize()
      })
    }
  },
  async created () {
    this.initializing = true
    this.updateMapLatLon()
    this.initializing = false
  },
  mounted () {
    this.isMounted = true
  },
  methods: {
    updateMapLatLon: function () {
      const res = this.getLLs(this.points2)
      this.courseLL = res.ll
      this.courseCenter = res.center
      this.courseBounds = res.bounds
    },
    getLLs: function (points) {
      const xmin = Math.min.apply(Math, points.map(p => { return p.lat }))
      const xmax = Math.max.apply(Math, points.map(p => { return p.lat }))
      const ymin = Math.min.apply(Math, points.map(p => { return p.lon }))
      const ymax = Math.max.apply(Math, points.map(p => { return p.lon }))
      return {
        ll: points.map(p => { return [p.lat, p.lon] }),
        center: [(xmin + xmax) / 2, (ymin + ymax) / 2],
        bounds: [
          { lat: xmin, lng: ymin },
          { lat: xmax, lng: ymax }
        ]
      }
    },
    waypointLocation (site) {
      const wps = this.waypoints.filter(wp => wp.site._id === site._id)
      if (this.course.loops > 1 && site.type === 'start') {
        wps.push(this.waypoints.find(wp => wp.type === 'finish'))
      }
      return wps.map(wp => { return this.$units.distf(wp.loc * this.course.distScale, 1) }).join(' & ')
    },
    updateMaxZoom (val) {
      this.maxZoom = this.tileProviders.find(x => x.name === val.name)['max-zoom']
    },
    waypointClick (waypoint, event) {
      if (this.course.loops > 1) {
        this.$emit('waypointClick', this.waypoints.filter(wp => wp.site === waypoint.site))
      } else {
        this.$emit('waypointClick', waypoint)
      }
      setTimeout(() => { event.target.closePopup() }, 2000)
    },
    getIcon (label) {
      // return an svg icon with label
      return divIcon({
        className: 'my-custom-pin',
        html:
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 34.892337" height="40" width="24" style="margin-left: -5px; margin-top: -48px;">
            <g transform="translate(-814.59595,-274.38623)">
              <g transform="matrix(1.1855854,0,0,1.1855854,-151.17715,-57.3976)">
                <path d="m 817.11249,282.97118 c -1.25816,1.34277 -2.04623,3.29881 -2.01563,5.13867 0.0639,3.84476 1.79693,5.3002 4.56836,10.59179 0.99832,2.32851 2.04027,4.79237 3.03125,8.87305 0.13772,0.60193 0.27203,1.16104 0.33416,1.20948 0.0621,0.0485 0.19644,-0.51262 0.33416,-1.11455 0.99098,-4.08068 2.03293,-6.54258 3.03125,-8.87109 2.77143,-5.29159 4.50444,-6.74704 4.56836,-10.5918 0.0306,-1.83986 -0.75942,-3.79785 -2.01758,-5.14062 -1.43724,-1.53389 -3.60504,-2.66908 -5.91619,-2.71655 -2.31115,-0.0475 -4.4809,1.08773 -5.91814,2.62162 z" style="fill:${this.$colors.red2.hex};stroke:black;"/>
                <circle r="6" cy="288.25278" cx="823.03064" id="path3049" style="display:inline;fill:white;"/>
                <text text-anchor="middle" y="291.1" x="823.03064" style="font-size:0.5rem">${label}</text>
              </g>
            </g>
          </svg>`
      })
    }
  }
}
</script>
