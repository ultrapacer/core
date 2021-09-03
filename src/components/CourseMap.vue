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
        :color="$colors.blue2"
      />
      <l-polyline
        :if="focusLL.length"
        :lat-lngs="focusLL"
        :weight="4"
        :color="$colors.red2"
      />
      <l-circle-marker
        v-for="wp in waypoints2"
        :key="wp.site._id+'_'+wp.loop"
        :lat-lng="[wp.lat(), wp.lon()]"
        :radius="6"
        :fill="true"
        :color="markerColors[wp.type()] || 'black'"
        :fill-color="markerColors[wp.type()] || 'white'"
        :fill-opacity="0.5"
        @click="waypointClick(wp, $event)"
      >
        <l-popup>
          <b>{{ $waypointTypes[wp.type()] }}</b><br>
          {{ wp.name() }}
          [{{ waypointLocation(wp.site) }} {{ $units.dist }}]
        </l-popup>
      </l-circle-marker>
    </l-map>
  </div>
</template>

<script>
import { LMap, LControlLayers, LTileLayer, LPolyline, LCircleMarker, LPopup } from 'vue2-leaflet'
import 'leaflet/dist/leaflet.css'
function uniqueBy (a, cond) {
  return a.filter((e, i) => a.findIndex(e2 => cond(e, e2)) === i)
}
export default {
  components: {
    LMap,
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
    points: {
      type: Array,
      required: true
    },
    waypoints: {
      type: Array,
      default () { return [] }
    },
    focus: {
      type: Array,
      default () { return [] }
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
      initializing: true,
      isMounted: false,
      markerColors: {
        start: 'black',
        finish: 'black',
        aid: 'red',
        landmark: 'green',
        water: 'blue'
      },
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
      return this.points.map(p => {
        return {
          loc: p.loc,
          lat: p.lat,
          lon: p.lon
        }
      })
    },
    points2: function () {
      // this is a combination of the track points and the waypoints (in case
      // waypoints are between points
      const arr = [
        ...this.pointsllls,
        ...this.waypoints2llls
      ].sort((a, b) => b.loc - a.loc)
      return arr
    },
    waypoints2: function () {
      return uniqueBy(this.waypoints, (o1, o2) => o1.site._id === o2.site._id)
    },
    waypoints2llls: function () {
      return this.waypoints2.map(wp => {
        return {
          loc: wp.type() === 'finish' ? this.course.distance : wp.loc() % this.course.distance,
          lat: wp.lat(),
          lon: wp.lon()
        }
      })
    }
  },
  watch: {
    focus: function (val) {
      if (val.length) {
        const lower = val[0] % this.course.distance
        const upper = val[1] % this.course.distance || this.course.distance
        const points = this.points2.filter(p =>
          p.loc >= lower && p.loc <= upper
        )
        const res = this.getLLs(points)
        this.focusLL = res.ll
        this.focusCenter = res.center
        this.focusBounds = res.bounds
      } else {
        this.focusLL = []
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
        wps.push(this.waypoints.find(wp => wp.type() === 'finish'))
      }
      return wps.map(wp => { return this.$units.distf(wp.loc(), 1) }).join(' & ')
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
    }
  }
}
</script>
