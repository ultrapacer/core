<template>
  <div
    ref="courseMapContainer"
    :style="'height: ' + mapHeight + 'px'"
  >
    <l-map
      ref="courseMap"
      style="height:100%"
      :bounds="bounds"
      :max-zoom="16"
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
        color="blue"
      />
      <l-polyline
        :if="focusLL.length"
        :lat-lngs="focusLL"
        :weight="5"
        color="red"
      />
      <l-circle-marker
        v-for="waypoint in course.waypoints"
        :key="waypoint._id"
        :lat-lng="[waypoint.lat, waypoint.lon]"
        :radius="6"
        :fill="true"
        :color="markerColors[waypoint.type] || 'black'"
        :visible="isVisible(waypoint)"
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
    focus: {
      type: Array,
      default () { return [] }
    },
    waypointShowMode: {
      type: Number,
      default: null
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
      markerColors: {
        start: 'black',
        finish: 'black',
        aid: 'red',
        landmark: 'green',
        water: 'blue'
      },
      tileProviders: [
        {
          name: 'TF Outdoors',
          visible: true,
          url: `https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png${process.env.THUNDERFOREST_API_KEY ? '?apikey=' + process.env.THUNDERFOREST_API_KEY : ''}`,
          attribution:
            'Maps: &copy; <a href="https://www.thunderforest.com/">Thunderforest</a>, Data &copy <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        },
        {
          name: 'OpenTopoMap',
          visible: false,
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          attribution:
            'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        },
        {
          name: 'OpenStreetMap',
          visible: false,
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution:
            '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        },
        {
          name: 'ESRI Satellite',
          visible: false,
          url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution:
            'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }
      ],
      mapHeight: 350,
      mapHeightDefault: 350
    }
  },
  computed: {
    bounds: function () {
      if (this.focusLL.length) {
        return this.focusBounds
      } else {
        return this.courseBounds
      }
    }
  },
  watch: {
    focus: function (val) {
      if (val.length) {
        const points = this.points.filter(p =>
          p.loc >= val[0] && p.loc <= val[1]
        )
        const res = this.getLLs(points)
        this.focusLL = res.ll
        this.focusCenter = res.center
        this.focusBounds = res.bounds
      } else {
        this.focusLL = []
      }
    }
  },
  async created () {
    this.initializing = true
    this.updateMapLatLon()
    this.initializing = false
  },
  mounted () {
    this.$nextTick(function () {
      window.addEventListener('resize', this.resized)
      this.resized()
    })
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.resized)
  },
  methods: {
    updateMapLatLon: function () {
      const res = this.getLLs(this.points)
      this.courseLL = res.ll
      this.courseCenter = res.center
      this.courseBounds = res.bounds
    },
    getLLs: function (points) {
      const arr = []
      let xmin = points[0].lat
      let xmax = xmin
      let ymin = points[0].lon
      let ymax = ymin
      points.forEach(p => {
        if (p.lat < xmin) xmin = p.lat
        else if (p.lat > xmax) xmax = p.lat
        if (p.lon < ymin) ymin = p.lon
        else if (p.lon > ymax) ymax = p.lon
        arr.push([p.lat, p.lon])
      })
      return {
        ll: arr,
        center: [(xmin + xmax) / 2, (ymin + ymax) / 2],
        bounds: [
          { lat: xmin, lng: ymin },
          { lat: xmax, lng: ymax }
        ]
      }
    },
    forceUpdate: function () {
      this.$forceUpdate()
    },
    isVisible: function (wp) {
      return (
        (this.waypointShowMode === 3) ||
        (this.waypointShowMode === 2 && wp.tier <= 2) ||
        (this.waypointShowMode === null && wp.show)
      )
    },
    resized: function () {
      let hm = this.mapHeightDefault
      if (window.innerWidth >= 992) {
        const hw = window.innerHeight
        const t = this.$refs.courseMapContainer.getBoundingClientRect().top
        if (hw - t > hm) {
          hm = hw - t
        }
      }
      if (hm !== this.mapHeight) {
        this.$logger('CourseMap|resized')
        this.mapHeight = hm
        this.$nextTick(function () {
          this.$refs.courseMap.mapObject.invalidateSize()
        })
      }
    }
  }
}
</script>
