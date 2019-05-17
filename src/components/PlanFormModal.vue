<template>
  <div>
    <b-modal id="plan-form-modal" centered v-bind:title="title">
      <form @submit.prevent="">
        <b-form-group label="Name">
          <b-form-input type="text" v-model="model.name"></b-form-input>
        </b-form-group>
        <b-form-group label="Pacing Method">
          <b-form-select type="number" v-model="model.pacingMethod" :options="pacingMethods"></b-form-select>
        </b-form-group>
        <b-form-group v-bind:label="targetLabel">
          <b-form-input type="number" v-model="model.pacingTarget" min="0"></b-form-input>
        </b-form-group>
        <b-form-group label="Description">
          <b-form-textarea rows="4" v-model="model.description"></b-form-textarea>
        </b-form-group>
      </form>
    </b-modal>
  </div>
</template>

<script>
export default {
  props: ['user','show'],
  data () {
    return {
      visible: false,
      title: 'Create a race plan',
      model: {
        pacingMethod: 'time'
      },
      pacingMethods: [
        { value: 'time', text: 'Finish Time' },
        { value: 'pace', text: 'Average Pace' },
        { value: 'gap', text: 'Grade Adjusted Pace' }
      ]
    }
  },
  watch: {
    show: function (val) {
      //$('#exampleModalCenter').modal({ show: val })
    }
  },
  computed: {
    targetLabel: function () {
      for (var i=0; i < this.pacingMethods.length; i++) {
        if (this.pacingMethods[i].value === this.model.pacingMethod) {
            return this.pacingMethods[i].text
        }
      }
    }
  },
  async created () {
  //$('#exampleModalCenter').modal({ show: true })
  },
  methods: {

  }
}
</script>
