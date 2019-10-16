<template>
  <div :class="(!isAuthenticated) ? '' : 'hero'">
    <div class="mt-5" style="align-items: center;    justify-content: center;    text-align: center;">
      <img style="width:20%;height:20%" src="../assets/logo.png">
      <h1 class="display-3">ultraPacer</h1>
      <p class="lead pb-4">race & adventure pacing strategy</p>
      <b-button size="lg" variant="outline-primary" to="/courses">
        {{ (isAuthenticated) ? 'Go to My Courses' : 'Login/Signup' }}
      </b-button>
    </div>
  <about-content v-if="!isAuthenticated">
  </about-content>
  <!---
  <div style="max-width:50rem">
  <b-card no-body class="mb-3">
    <b-row no-gutters>
      <b-col sm="5" order="2" order-sm="1" style="vertical-align:center; text-align:center">
        <div>
        <b-button size="lg" variant="outline-primary" to="/courses">
        'Login/Signup'
        </b-button>
        </div>
      </b-col>
      <b-col sm="7" order="1" order-sm="2">
        <b-card-body title="Get Started (it's free)">
          <b-card-text>
            Upload GPS tracks to create courses and define waypoints (aid stations, landmarks, junctions, etc.) along the way.<b/>
            Share your course for others to study the route and create their own pacing plans.
          </b-card-text>
        </b-card-body>
      </b-col>
    </b-row>
  </b-card>
  </div>--->
  
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
import AboutContent from './AboutContent'
export default {
  title: 'Home',
  props: ['isAuthenticated', 'user'],
  components: {
    AboutContent
  }
}
</script>
