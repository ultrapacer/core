<template>
  <div class="primary-page">
    <h1 class="d-none d-md-block">
      About ultraPacer
    </h1>
    <about-content />
    <vue-headful
      description="ultraPacer is a web app for creating courses and pacing plans for ultramarathons and trail adventures that factor in grade, terrain, altitude, heat, nighttime, and fatigue."
    />
  </div>
</template>

<script>
import AboutContent from '../components/AboutContent'
export default {
  title: 'About',
  components: {
    AboutContent
  }
}
</script>
