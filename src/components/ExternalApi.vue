<!-- src/views/ExternalApi.vue -->
<template>
 <div>
    <div>
      <h1>External API</h1>
      <p>Ping an external API by clicking the button below. This will call the external API using an access token, and the API will validate it using
        the API's audience value.
      </p>

      <button @click="callApi">Ping</button>
    </div>

    <div v-if="apiMessage">
      <h2>Result</h2>
      <p>{{ apiMessage }}</p>
    </div>

 </div>
</template>

<script>
import api from '@/api'
export default {
  name: 'Api',
  data () {
    return {
      apiMessage: null
    }
  },
  methods: {
    async callApi () {
      this.apiMessage = await api.callApi()
    }
  }
}
</script>
