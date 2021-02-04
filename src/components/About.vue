<template>
  <div
    class="container-fluid mt-4"
    style="max-width:50rem"
  >
    <h1 class="h1 d-none d-md-block">
      About ultraPacer
    </h1>
    <about-content />
    <vue-headful
      description="ultraPacer is a web app for creating courses and pacing plans for ultramarathons and trail adventures that factor in grade, terrain, altitude, heat, nighttime, and fatigue."
    />
  </div>
</template>

<script>
import AboutContent from './AboutContent'
export default {
  title: 'About',
  components: {
    AboutContent
  }
}
</script>
