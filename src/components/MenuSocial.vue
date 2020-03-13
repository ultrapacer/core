<template>
  <div style="margin-left: -0.5rem">
    <b-link
      href="mailto:danny@ultrapacer.com"
      target="_blank"
      class="nav-link socialbutton"
      v-b-popover.hover.blur.bottomright.d250.v-info="'Send me a good old-fashioned email!'"
    >
      <v-icon name="envelope"></v-icon>
    </b-link>
    <b-link
      href="https://www.facebook.com/ultrapacer"
      target="_blank"
      class="nav-link socialbutton"
      v-b-popover.hover.blur.bottomright.d250.v-info="'Follow uP on Facebook!'"
    >
      <v-icon name="brands/facebook"></v-icon>
    </b-link>
    <b-link
      href="https://www.strava.com/clubs/ultrapacer"
      target="_blank"
      class="nav-link socialbutton"
      v-b-popover.hover.blur.bottomright.d250.v-info="'Join the uP Strava club!'"
    >
      <v-icon name="brands/strava"></v-icon>
    </b-link>
    <b-link
      href="https://github.com/amokrunner/ultrapacer"
      target="_blank"
      class="nav-link socialbutton"
      v-b-popover.hover.blur.bottomright.d250.v-info="'Contribute to uP on Github!'"
    >
      <v-icon name="brands/github"></v-icon>
    </b-link>
    <b-link
      @click="$refs.paypalForm.submit()"
      target="_blank"
      class="nav-link socialbutton"
      v-b-popover.hover.blur.bottomright.d250.v-info="'Donate to uP with Paypal!'"
    >
      <form ref="paypalForm" action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
        <input type="hidden" name="cmd" value="_donations" />
        <input type="hidden" name="business" value="danny@ultrapacer.com" />
        <input type="hidden" name="currency_code" value="USD" />
          <v-icon name="brands/paypal"></v-icon>
      </form>
    </b-link>
    <b-link
      href="https://www.patreon.com/ultrapacer"
      target="_blank"
      class="nav-link socialbutton"
      v-b-popover.hover.blur.bottomright.d250.v-info="'Donate to uP with Patreon!'"
    >
      <v-icon name="brands/patreon"></v-icon>
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
