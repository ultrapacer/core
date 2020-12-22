<template>
  <div
    class="container-fluid mt-4"
    style="max-width:50rem"
  >
    <h1 class="h1 d-none d-md-block">
      About ultraPacer
    </h1>
    <about-content />
    <div
      v-if="$user.isAuthenticated"
      class="container-fluid"
      style="max-width:50rem"
    >
      <b-card
        no-body
        class="mb-3"
      >
        <b-row no-gutters>
          <b-col
            sm="5"
            order="2"
            order-sm="1"
            style="text-align:center"
          >
            <b-card-img
              :src="require('../assets/aboutMe.jpg')"
              class="rounded-0"
              style="max-width:320px"
            />
          </b-col>
          <b-col
            sm="7"
            order="1"
            order-sm="2"
          >
            <b-card-body title="About the Developer">
              <b-card-text>
                Danny Murphy, a full time dad, husband, civil engineer, and avid trail runner living in Auburn, California (the "Endurance Capital of the World" and home of the Western States Endurance Run).<br>
                Follow me online, or find me out on the trails in the wee hours.
                <div style="text-align: center">
                  <b-link
                    href="https://www.strava.com/athletes/amokrunnr"
                    target="_blank"
                    class="nav-link socialbutton"
                  >
                    <v-icon name="brands/strava" />
                  </b-link>
                  <b-link
                    href="https://www.instagram.com/amokrunnr"
                    target="_blank"
                    class="nav-link socialbutton"
                  >
                    <v-icon name="brands/instagram" />
                  </b-link>
                  <b-link
                    href="mailto:danny@ultrapacer.com"
                    target="_blank"
                    class="nav-link socialbutton"
                  >
                    <v-icon name="envelope" />
                  </b-link>
                </div>
              </b-card-text>
            </b-card-body>
          </b-col>
        </b-row>
      </b-card>
    </div>
  </div>
</template>

<script>
import AboutContent from './AboutContent'
export default {
  title: 'About',
  components: {
    AboutContent
  }
}
</script>
