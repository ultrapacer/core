<template>
  <l-map
    ref="courseMap"
    style="height: 350px"
    :bounds="bounds"
    :max-zoom="16">
  <l-tile-layer :url="mapLayerURL"></l-tile-layer>
  <l-polyline
      :lat-lngs="courseLL"
      color="blue">
  </l-polyline>
  <l-polyline
      :if="focusLL.length"
      :lat-lngs="focusLL"
      :weight="5"
      color="red">
  </l-polyline>
  <l-circle-marker
      v-for="waypoint in course.waypoints"
      :key="waypoint._id"
      :lat-lng="[waypoint.lat, waypoint.lon]"
      :radius="8"
      :fill=true
      :color="markerColors[waypoint.type]"
      :visible="waypoint.show || mode === 'all'"
      :fillColor="markerColors[waypoint.type]"
      :fillOpacity="0.5"
    />
  </l-map>
</template>

<script>
import {LMap, LTileLayer, LPolyline, LCircleMarker} from 'vue2-leaflet'
export default {
  props: ['course', 'focus', 'mode'],
  components: {
    LMap,
    LTileLayer,
    LPolyline,
    LCircleMarker
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
      mapLayerURL: 'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
      markerColors: {
        start: 'black',
        finish: 'black',
        aid: 'red',
        landmark: 'green'
      }
    }
  },
  async created () {
    this.initializing = true
    this.updateMapLatLon()
    this.initializing = false
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
  methods: {
    updateMapLatLon: function () {
      var res = this.getLLs(this.course.points)
      this.courseLL = res.ll
      this.courseCenter = res.center
      this.courseBounds = res.bounds
    },
    getLLs: function (points) {
      var arr = []
      var xmin = points[0].lat
      var xmax = xmin
      var ymin = points[0].lon
      var ymax = ymin
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
    }
  },
  watch: {
    focus: function (val) {
      if (val.length) {
        var points = this.course.points.filter(p =>
          p.loc >= val[0] && p.loc <= val[1]
        )
        var res = this.getLLs(points)
        this.focusLL = res.ll
        this.focusCenter = res.center
        this.focusBounds = res.bounds
      } else {
        this.focusLL = []
      }
    }
  }
}
</script>
