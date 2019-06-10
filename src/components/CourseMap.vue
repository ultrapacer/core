<template>
  <l-map
    ref="courseMap"
    style="height: 600px; width: 100%"
    :center="center"
    :bounds="bounds"
    :max-zoom="16">
  <l-tile-layer :url="mapLayerURL"></l-tile-layer>
  <l-polyline
      :lat-lngs="mapLatLon"
      color="blue">
  </l-polyline>
  <l-circle-marker
      v-for="waypoint in course.waypoints"
      :key="waypoint._id"
      :lat-lng="[waypoint.lat, waypoint.lon]"
      :radius="8"
      :fill=true
      :color="markerColors[waypoint.type]"
      :fillColor="markerColors[waypoint.type]"
      :fillOpacity="0.5"
    />
  </l-map>
</template>

<script>
import {LMap, LTileLayer, LPolyline, LCircleMarker} from 'vue2-leaflet'
export default {
  title: 'Loading',
  props: ['course'],
  components: {
    LMap,
    LTileLayer,
    LPolyline,
    LCircleMarker
  },
  data () {
    return {
      bounds: [],
      center: [],
      initializing: true,
      mapLatLon: [],
      mapLayerURL: 'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
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
  methods: {
    updateMapLatLon: function () {
      var arr = []
      var xmin = this.course.points[0].lat
      var xmax = xmin
      var ymin = this.course.points[0].lon
      var ymax = ymin
      this.course.points.forEach(p => {
        if (p.lat < xmin) xmin = p.lat
        else if (p.lat > xmax) xmax = p.lat
        if (p.lon < ymin) ymin = p.lon
        else if (p.lon > ymax) ymax = p.lon
        arr.push([p.lat, p.lon])
      })
      this.mapLatLon = arr
      this.center = [(xmin + xmax) / 2, (ymin + ymax) / 2]
      this.bounds = [
        { lat: xmin, lng: ymin },
        { lat: xmax, lng: ymax }
      ]
    }
  }
}
</script>
