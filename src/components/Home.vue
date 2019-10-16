<template>
  <div>
    <div class="mt-5" style="align-items: center;    justify-content: center;    text-align: center;">
      <img style="width:20%;height:20%" src="../assets/logo.png">
      <h1 class="display-3">ultraPacer</h1>
      <p class="lead pb-2">race & adventure pacing strategy</p>
      <b-button size="lg" variant="outline-primary" to="/courses">
        Login/Signup
      </b-button>
    </div>
  <about-content>
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
  },
  data () {
    return {
      hideAbout: false
    }
  },
  watch: {
    isAuthenticated: function (val) {
      if (val) {
        setTimeout(()=>{
          this.hideAbout = true
          this.$bvToast.toast(
            'Ready to rock and roll.',
            {
              title: 'Logged in!',
              toaster: 'b-toaster-bottom-right',
              solid: true,
              variant: 'info',
              autoHideDelay: 1000
            }
          )
          this.$router.push({
            name: 'CoursesManager'
          })
        }, 500)
      }
    }
  },
}
</script>
