<template>
  <b-card
    no-body
    class="mb-3 aboutcard"
  >
    <b-row no-gutters>
      <b-col
        order="2"
        sm="7"
      >
        <b-card-body :title="title">
          <b-card-text>
            <slot />
          </b-card-text>
        </b-card-body>
      </b-col>
      <b-col
        class="imgcol"
        sm="5"
        style="text-align:center"
      >
        <b-card-img
          :src="img"
          class="rounded-0 p-2"
          style="max-width:320px"
        />
      </b-col>
    </b-row>
  </b-card>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    img: {
      type: String,
      required: true
    }
  }
}
</script>
<style>
.imgcol {
  order: 3;
}
@media (min-width: 576px) {
  .aboutcard:nth-child(odd) .imgcol {
    order: 1;
  }
}
@media (min-width: 576px) {
  .aboutcard:nth-child(even) .imgcol {
    order: 3;
  }
}
</style>
