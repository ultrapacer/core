<template>
<div>

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
