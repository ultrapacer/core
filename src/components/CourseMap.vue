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
        v-for="waypoint in waypoints"
        :key="waypoint._id"
        :lat-lng="[waypoint.lat, waypoint.lon]"
        :radius="6"
        :fill="true"
        :color="markerColors[waypoint.type] || 'black'"
        :fill-color="markerColors[waypoint.type] || 'white'"
        :fill-opacity="0.5"
      >
        <l-popup>
          <b>{{ $waypointTypes[waypoint.type] }}</b><br>
          {{ waypoint.name }}
          [{{ $units.distf(waypoint.location, 1) }} {{ $units.dist }}]
        </l-popup>
      </l-circle-marker>
    </l-map>
  </div>
</template>

<script>
import { LMap, LControlLayers, LTileLayer, LPolyline, LCircleMarker, LPopup } from 'vue2-leaflet'
import 'leaflet/dist/leaflet.css'
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
    points2: function () {
      // this is a combination of the track points and the waypoints (in case
      // waypoints are between points
      const arr = [
        ...this.points.map(p => {
          return {
            loc: p.loc,
            lat: p.lat,
            lon: p.lon
          }
        }),
        ...this.waypoints.map(wp => {
          return {
            loc: wp.location,
            lat: wp.lat,
            lon: wp.lon
          }
        })
      ].sort((a, b) => b.loc - a.loc)
      return arr
    }
  },
  watch: {
    focus: function (val) {
      if (val.length) {
        const points = this.points2.filter(p =>
          p.loc >= val[0] && p.loc <= val[1]
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
    updateMaxZoom (val) {
      this.maxZoom = this.tileProviders.find(x => x.name === val.name)['max-zoom']
    }
  }
}
</script>
