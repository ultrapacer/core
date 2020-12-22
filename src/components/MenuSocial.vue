<template>
  <div style="margin-left: -0.5rem">
    <b-link
      v-b-popover.hover.blur.bottomright.d250.v-info="'Send me a good old-fashioned email!'"
      href="mailto:danny@ultrapacer.com"
      target="_blank"
      class="nav-link socialbutton"
    >
      <v-icon name="envelope" />
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
      v-b-popover.hover.blur.bottomright.d250.v-info="'Contribute to uP on Github!'"
      href="https://github.com/amokrunner/ultrapacer"
      target="_blank"
      class="nav-link socialbutton"
    >
      <v-icon name="brands/github" />
    </b-link>
    <b-link
      v-b-popover.hover.blur.bottomright.d250.v-info="'Donate to uP with Paypal!'"
      target="_blank"
      class="nav-link socialbutton"
      @click="$refs.paypalForm.submit()"
    >
      <form
        ref="paypalForm"
        action="https://www.paypal.com/cgi-bin/webscr"
        method="post"
        target="_blank"
      >
        <input
          type="hidden"
          name="cmd"
          value="_donations"
        >
        <input
          type="hidden"
          name="business"
          value="danny@ultrapacer.com"
        >
        <input
          type="hidden"
          name="currency_code"
          value="USD"
        >
        <v-icon name="brands/paypal" />
      </form>
    </b-link>
    <b-link
      v-b-popover.hover.blur.bottomright.d250.v-info="'Donate to uP with Patreon!'"
      href="https://www.patreon.com/ultrapacer"
      target="_blank"
      class="nav-link socialbutton"
    >
      <v-icon name="brands/patreon" />
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
