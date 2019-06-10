<template>
  <l-map
    ref="courseMap"
    style="height: 600px; width: 100%"
    :center="mapLatLon[1]"
    :zoom="12"
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
      for (var i = 0, il = this.course.points.length; i < il; i++) {
        arr.push([this.course.points[i].lat, this.course.points[i].lon])
      }
      this.mapLatLon = arr
    }
  }
}
</script>
