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
      {{ courseCount }} courses on your list).
    </p>
    <p>
      Would you consider joining the ultraPacer Patreon community for $1/month?
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
  props: {
    courseCount: {
      type: Number,
      default: 0
    }
  },
  mounted () {
    this.initiate()
  },
  methods: {
    async initiate () {
      const user = await api.getUser()
      if (user && this.courseCount >= 3) {
        const m = user.membership || {}
        if (m.status === 'member') {
          this.$logger('PatreonModal|initiate: already a member')
          return
        }
        const next = moment(m.next_annoy || 0)
        const d = moment().diff(next, 'days')
        if (d >= 0) {
          this.$ga.event('Patreon', 'show')
          this.$refs.patreon.show()
        } else {
          this.$logger(`PatreonModal|initiate: remind again in ${-d} days`)
        }
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
