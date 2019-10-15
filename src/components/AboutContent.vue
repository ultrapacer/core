<template>
  <div class="container-fluid mt-4" style="max-width:50rem">
  <b-card no-body class="mb-3">
    <b-row no-gutters>
      <b-col sm="5" order="2" order-sm="1">
        <b-card-img :src="require('../assets/aboutCourse.png')" class="rounded-0"></b-card-img>
      </b-col>
      <b-col sm="7" order="1" order-sm="2">
        <b-card-body title="Create Courses">
          <b-card-text>
            Upload GPS tracks to create courses and define waypoints (aid stations, landmarks, junctions, etc.) along the way.
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
            Strategize pace splits for your upcoming ultramarathon or mountain adventure. Understand and accommodate the influence on grade, altitude, terrain, heat, darkness, and fatigue.
          </b-card-text>
        </b-card-body>
      </b-col>
      <b-col sm="5">
        <b-card-img :src="require('../assets/aboutSplits.png')" class="rounded-0"></b-card-img>
      </b-col>
    </b-row>
  </b-card>

    <b-card no-body class="mb-3">
    <b-row no-gutters>
      <b-col sm="5" order="2" order-sm="1">
        <b-card-img src="https://picsum.photos/400/400/?image=20" class="rounded-0"></b-card-img>
      </b-col>
      <b-col sm="7" order="1" order-sm="2">
        <b-card-body title="Aid Station/Landmark Arrival Times">
          <b-card-text>
            Determine when you should expect to arrive at aid station or landmarks along your course so your crew knows when to expect you.
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
             Break down course segments or distance splits by time, grade, pace, ascent/descent, distance, and other metrics.
          </b-card-text>
        </b-card-body>
      </b-col>
      <b-col sm="5">
        <b-card-img src="https://picsum.photos/400/400/?image=20" class="rounded-0"></b-card-img>
      </b-col>
    </b-row>
  </b-card>

</div>
</template>
