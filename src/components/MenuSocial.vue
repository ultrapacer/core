<template>
  <div style="margin-left: -0.5rem">
    <b-link
      v-if="$user.isAuthenticated"
      v-b-popover.hover.blur.bottomright.d250.v-info="'Send me a good old-fashioned email!'"
      href="mailto:danny@ultrapacer.com"
      target="_blank"
      class="nav-link socialbutton"
    >
      <v-icon name="envelope" />
    </b-link>
    <b-link
      v-b-popover.hover.blur.bottomright.d250.v-info="'YouTube Channel!'"
      href="https://www.youtube.com/channel/UCKptexajs3nGUG26wYNAmTQ"
      target="_blank"
      class="nav-link socialbutton"
    >
      <v-icon name="brands/youtube" />
    </b-link>
    <b-link
      v-b-popover.hover.blur.bottomright.d250.v-info="'Follow uP on Facebook!'"
      href="https://www.facebook.com/ultrapacer"
      target="_blank"
      class="nav-link socialbutton"
    >
      <v-icon name="brands/facebook" />
    </b-link>
    <b-link
      v-b-popover.hover.blur.bottomright.d250.v-info="'Join the uP Strava club!'"
      href="https://www.strava.com/clubs/ultrapacer"
      target="_blank"
      class="nav-link socialbutton"
    >
      <v-icon name="brands/strava" />
    </b-link>
    <b-link
      v-b-popover.hover.blur.bottomright.d250.v-info="'Donate to uP with Paypal!'"
      target="_blank"
      class="nav-link socialbutton"
      @click="()=>{$parent.$parent.$refs.support.goToPaypal()}"
    >
      <v-icon name="brands/paypal" />
    </b-link>
    <b-link
      v-b-popover.hover.blur.bottomright.d250.v-info="'Donate to uP with Patreon!'"
      target="_blank"
      class="nav-link socialbutton"
      @click="()=>{$parent.$parent.$refs.support.goToPatreon()}"
    >
      <v-icon name="brands/patreon" />
    </b-link>
    <b-link
      v-b-popover.hover.blur.bottomright.d250.v-info="'Buy Me a Coffee!'"
      target="_blank"
      class="nav-link socialbutton"
      @click="()=>{$parent.$parent.$refs.support.goToBuyMeACoffee()}"
    >
      <v-icon name="mug-hot" />
    </b-link>
  </div>
</template>

<style>
.socialbutton {
  display: inline-block !important;
  padding-left: 0.3rem !important;
  padding-right: 0.3rem !important;
}
</style>
