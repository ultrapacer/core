<template>
  <div>
    <div
      class="mt-5"
      style="align-items: center; justify-content: center; text-align: center;"
    >
      <img
        style="width:20%;height:20%"
        src="../assets/logo.png"
      >
      <h1 class="display-3">
        ultraPacer
      </h1>
      <p class="lead pb-2">
        race & adventure pacing strategy
      </p>
      <b-button
        size="lg"
        variant="success"
        to="/courses"
      >
        {{ ($user.isAuthenticated) ? 'Go to My Courses' : 'Login/Signup' }}
      </b-button>
    </div>
    <about-content />
  </div>
</template>

<script>
import AboutContent from './AboutContent'
export default {
  title: 'Home',
  components: {
    AboutContent
  }
}
</script>

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
