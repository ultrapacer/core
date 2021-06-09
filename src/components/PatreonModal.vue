<template>
  <b-modal
    ref="patreon"
    title="Support ultraPacer?"
    scrollable
    centered
    hide-header-close
    no-close-on-esc
    no-close-on-backdrop
  >
    <p>
      Looks like you're enjoying ultraPacer (well at least you've racked up
      {{ message }} to your name).
    </p>
    <p>
      I do this on my own time and with my own resources. Donations help to cover some of my operating and coffee expenses.
      <br>
      Would you sponsor ultraPacer on Patreon for as little as $1/month?
    </p>
    <p>
      Thanks,
      <br>
      Danny
    </p>

    <template #modal-footer>
      <b-button
        variant="secondary"
        @click="maybeLater"
      >
        Maybe later :[
      </b-button>
      <b-button
        variant="primary"
        @click="alreadyJoined"
      >
        Already joined!
      </b-button>
      <b-button
        variant="success"
        @click="goToPatreon"
      >
        Take me there :]
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import api from '@/api'
import moment from 'moment'
export default {
  data () {
    return {
      delay: 20000,
      timeout: null,
      message: ''
    }
  },
  mounted () {
    this.timeout = setTimeout(() => {
      this.initiate()
    }, this.delay)
  },
  beforeDestroy () {
    clearTimeout(this.timeout)
  },
  methods: {
    async initiate () {
      if (!this.$user.isAuthenticated) return

      // get user
      const user = await api.getUser()
      const m = user.membership || {}
      if (m.status === 'member') {
        this.$logger('PatreonModal|initiate: already a member')
        return
      }

      const next = moment(m.next_annoy || 0)
      const d = moment().diff(next, 'days')
      if (d >= 0) {
        // get user stats
        const userstats = await api.getUserStats()
        let showModal = false
        if (userstats.courses >= 2) {
          showModal = true
          this.message = `${this.casualNumber(userstats.courses)} courses`
        } else if (userstats.plans >= 2) {
          showModal = true
          this.message = `${this.casualNumber(userstats.plans)} plans`
        } else {
          this.$logger('PatreonModal|initiate: not enough plans or courses')
        }
        if (showModal) {
          this.$ga.event('Patreon', 'show')
          this.$refs.patreon.show()
        }
      } else {
        this.$logger(`PatreonModal|initiate: remind again in ${-d} days`)
      }
    },
    casualNumber (num) {
      switch (num) {
        case 2:
          return 'a couple'
        case 3:
          return 'a few'
        case 4:
        case 5:
          return 'a handful of'
        default:
          return 'a lot of'
      }
    },
    async goToPatreon () {
      window.open('https://www.patreon.com/ultrapacer', '_blank')
      this.setLastAnnoyed(3)
      this.$ga.event('Patreon', 'visit')
      this.$refs.patreon.hide()
    },
    async maybeLater () {
      this.setLastAnnoyed(14)
      this.$ga.event('Patreon', 'later')
      this.$refs.patreon.hide()
    },
    async alreadyJoined () {
      this.$ga.event('Patreon', 'joined')
      api.updateSettings(
        this.$user._id,
        {
          membership: {
            status: 'member',
            last_annoyed: moment().toDate()
          }
        }
      )
      this.$logger('PatreonModal| Updated to member')
      this.$refs.patreon.hide()
    },
    async setLastAnnoyed (delay) {
      await api.updateSettings(
        this.$user._id,
        {
          membership: {
            status: 'nonmember',
            last_annoyed: moment().toDate(),
            next_annoy: moment().add(delay, 'days').toDate()
          }
        }
      )
      this.$logger('PatreonModal| Updated last_annoyed')
    }
  }
}
</script>
