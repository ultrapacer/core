<template>
  <div
    class="container-fluid mt-4"
    style="max-width:50rem"
  >
    <about-card
      title="Create Courses"
      :img="require('../assets/aboutCourse.png')"
    >
      Upload GPS tracks to create courses and define waypoints (aid stations, landmarks, junctions, etc.) along the way.<br>
      Share your course for others to study the route and create their own pacing plans.
    </about-card>
    <about-card
      title="Plan Your Pacing"
      :img="require('../assets/aboutSplits.png')"
    >
      Strategize pace splits for your upcoming ultramarathon or mountain adventure. Understand and accommodate the influence on grade, altitude, terrain, heat, darkness, and fatigue.<br>
      Create pacing plans based on elapsed time goals, average pace, or normalized pace.
    </about-card>
    <about-card
      title="Aid Station/Landmark Arrival Times"
      :img="require('../assets/aboutArrival.png')"
    >
      Determine when you should expect to arrive at aid station or landmarks along your course so your crew knows when to expect you.
    </about-card>
    <about-card
      title="Course Analysis"
      :img="require('../assets/aboutSegment.png')"
    >
      Break down course segments or distance splits by time, grade, pace, ascent/descent, distance, and other metrics.<br>
      See how each of these factors affects your overall pace and contributes to your total time.
    </about-card>
    <sponsor layout="card" />
    <about-card
      v-if="$user.isAuthenticated && $title === 'About'"
      title="About the Developer"
      :img="require('../assets/aboutMe.jpg')"
    >
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
    </about-card>
  </div>
</template>
<script>
import AboutCard from './AboutCard'
import Sponsor from './Sponsor'
export default {
  components: {
    AboutCard,
    Sponsor
  }
}
</script>
