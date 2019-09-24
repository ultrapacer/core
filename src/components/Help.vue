<template>
  <div class="container-fluid mt-4" style="max-width:800px">
    <h1 class="h1 d-none d-md-block">Help</h1>
    <p>The help and documentation is a work in progress...</p>
    <b-card title="Models">
      <b-row class="mb-3">
        <b-col sm="2" class="text-sm-right"><b>Grade:</b></b-col>
        <b-col>
          The grade model is shown below. Upgrades are obviously take more effort than flat terrain. Downgrades require less effort, to a crossover point at about -16%.<br/>
          <img style="width:100%; max-width:468px; max-height:299px" src="../assets/gradeModel.png">
        </b-col>
      </b-row>
      <b-row class="mb-3">
        <b-col sm="2" class="text-sm-right"><b>Altitude:</b></b-col>
        <b-col>
          The altitude model is an exponentially increasing factor. The default model has a lower threshold of {{ defaults.alt.th }} meters, under which altitude is assumed to be insignificant. Above {{ defaults.alt.th }} meters, the time to run a given distance increases at a rate of {{ defaults.alt.rate }}% every {{ defaults.alt.span }} meters, compounded continuously.<br/>
          Users can change the altitude model threshold and rate on the Settings page.<br/>
          <img style="width:100%; max-width:468px; max-height:299px" src="../assets/altModel.png">
        </b-col>
      </b-row>
      <b-row class="mb-3">
        <b-col sm="2" class="text-sm-right"><b>Heat:</b></b-col>
        <b-col>
          The heat model the top half of a sinusoidal curve. A "baseline" heat factor can be applied outside of peak hours. The heat model activates 1/2 hour after sunrise and returns to baseline 1 hour after sunset, peaking at a maximum value as specified.<br/>
          <img style="width:100%; max-width:468px; max-height:299px" src="../assets/heatModel.png">
        </b-col>
      </b-row>
      <b-row class="mb-3">
        <b-col sm="2" class="text-sm-right"><b>Terrain:</b></b-col>
        <b-col>
          The terrain model is manually input by waypoint and is based on course knowledge. It is intended to address anything that is too small to appear in elevation data.<br/>
          Typical value ranges by terrain type are:<br/>
          &nbsp;- Paved surface: 0%<br/>
          &nbsp;- Smooth fire road: 2-4%<br/>
          &nbsp;- Smooth singletrack: 5-10%<br/>
          &nbsp;- Rocky singletrack: 10-20%<br/>
          &nbsp;- Technical trail: 20%+
        </b-col>
      </b-row>
      <b-row class="mb-3">
        <b-col sm="2" class="text-sm-right"><b>Pace Drift:</b></b-col>
        <b-col>
          Pace drift is linearly applied, reducing time per distance at the beginning of the race and increasing at the end of the race.<br/>
          <img style="width:100%; max-width:468px; max-height:299px" src="../assets/driftModel.png">
        </b-col>
      </b-row>
    </b-card>
  </div>
</template>

<style>
  .hero {
    height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .hero .lead {
    font-weight: 200;
    font-size: 1.5rem;
  }
</style>

<script>
import {defaults} from '../../shared/normFactor'
export default {
  title: 'Help',
  data () {
    return {
      defaults: defaults
    }
  }
}
</script>
