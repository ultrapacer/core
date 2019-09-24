<template>
  <div class="hero">
    <div>
      <img style="width:20%;height:20%" src="../assets/logo.png">
      <h1 class="display-3">ultraPacer Beta</h1>
      <p class="lead pb-4">pace your race</p>
      <b-button size="lg" variant="outline-primary" to="/courses">Get Started!</b-button>
      <p class="lead pt-5">send questions and feedback to<br/>
      <a href="mailto:danny@ultrapacer.com">danny@ultrapacer.com</a></p>
    </div>
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
export default {
  title: 'Home'
}
</script>
