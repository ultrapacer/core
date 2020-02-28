<template>
  <div class="container-fluid mt-4" style="max-width:50rem">

  <b-card no-body class="mb-3">
    <b-row no-gutters>
      <b-col sm="5" order="2" order-sm="1" style="text-align:center">
        <b-card-img
          :src="require('../assets/aboutCourse.png')"
          class="rounded-0"
          style="max-width:320px">
        </b-card-img>
      </b-col>
      <b-col sm="7" order="1" order-sm="2">
        <b-card-body title="Create Courses">
          <b-card-text>
            Upload GPS tracks to create courses and define waypoints (aid stations, landmarks, junctions, etc.) along the way.<br/>
            Share your course for others to study the route and create their own pacing plans.
          </b-card-text>
        </b-card-body>
      </b-col>
    </b-row>
  </b-card>

  <b-card no-body class="mb-3">
    <b-row no-gutters>
      <b-col sm="7">
        <b-card-body title="Plan Your Pacing">
          <b-card-text>
            Strategize pace splits for your upcoming ultramarathon or mountain adventure. Understand and accommodate the influence on grade, altitude, terrain, heat, darkness, and fatigue.<br/>
            Create pacing plans based on elapsed time goals, average pace, or normalized pace.
          </b-card-text>
        </b-card-body>
      </b-col>
      <b-col sm="5" style="text-align:center">
        <b-card-img
          :src="require('../assets/aboutSplits.png')"
          class="rounded-0"
          style="max-width:320px"></b-card-img>
      </b-col>
    </b-row>
  </b-card>

  <b-card no-body class="mb-3">
    <b-row no-gutters>
      <b-col sm="5" order="2" order-sm="1" style="text-align:center">
        <b-card-img
          :src="require('../assets/aboutArrival.png')"
          class="rounded-0"
          style="max-width:320px">
        </b-card-img>
      </b-col>
      <b-col sm="7" order="1" order-sm="2">
        <b-card-body title="Aid Station/Landmark Arrival Times">
          <b-card-text>
            Determine when you should expect to arrive at aid station or landmarks along your course so your crew knows when to expect you.<br/>
          </b-card-text>
        </b-card-body>
      </b-col>
    </b-row>
  </b-card>

  <b-card no-body class="mb-3">
    <b-row no-gutters>
      <b-col sm="7">
        <b-card-body title="Course Analysis">
          <b-card-text>
             Break down course segments or distance splits by time, grade, pace, ascent/descent, distance, and other metrics.<br/>
             See how each of these factors affects your overall pace and contributes to your total time.
          </b-card-text>
        </b-card-body>
      </b-col>
      <b-col sm="5" style="text-align:center">
        <b-card-img
          :src="require('../assets/aboutSegment.png')"
          class="rounded-0"
          style="max-width:320px"></b-card-img>
      </b-col>
    </b-row>
  </b-card>
  <vue-headful
    description="ultraPacer is a web app for creating courses and pacing plans for ultramarathons and trail adventures that factor in grade, terrain, altitude, heat, nighttime, and fatigue."
    title="ultraPacer: pacing your ultramarathon and trail running adventures"
  />

</div>
</template>
