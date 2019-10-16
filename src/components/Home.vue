<template>
  <div class="hero">
    <div>
      <img style="width:20%;height:20%" src="../assets/logo.png">
      <h1 class="display-3">ultraPacer</h1>
      <p class="lead pb-4">race & adventure pacing strategy</p>
      <b-button size="lg" variant="outline-primary" to="/courses">
        {{ (isAuthenticated) ? 'Go to My Courses' : 'Login/Signup' }}
      </b-button>
    </div>
    <about-content v-if="!isAuthenticated">
    </about-content>
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
