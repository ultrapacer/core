
var gpxParse = require('gpx-parse')
var gpxTrack = gpxParse.GpxTrack
gpxParse.GpxTrack.prototype.gain = function() {
		var gain = 0
		var currentSegment = null;
    var delta = 0
		for (var i=0, il= this.segments.length; i<il; i++) {
			currentSegment = this.segments[i];
			if (currentSegment.length > 1) {
				for (var j=0, jl = currentSegment.length -1; j<jl; j++) {
          delta = currentSegment[j+1].elevation - currentSegment[j].elevation
          if (delta > 0) gain += delta
				}
			}
		}

		return gain;
}
gpxParse.GpxTrack.prototype.loss = function() {
    var loss = 0
		var currentSegment = null;
    var delta = 0
		for (var i=0, il= this.segments.length; i<il; i++) {
			currentSegment = this.segments[i];
			if (currentSegment.length > 1) {
				for (var j=0, jl = currentSegment.length -1; j<jl; j++) {
          delta = currentSegment[j+1].elevation - currentSegment[j].elevation
          if (delta < 0) { loss += delta }
				}
			}
		}
		return loss;
}
module.exports = gpxParse
