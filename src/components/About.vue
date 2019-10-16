<template>
<div class="container-fluid mt-4">
  <h1 class="h1 d-none d-md-block">About ultraPacer</h1>
  <about-content></about-content>
</div>
</template>

<script>
import AboutContent from './AboutContent'
export default {
  title: 'About',
  props: ['isAuthenticated', 'user'],
  components: {
    AboutContent
  }
}
</script>
