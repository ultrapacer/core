<template>
  <div>
    <b-modal
      ref="modal"
      :title="title"
      scrollable
      centered
      hide-header-close
      no-close-on-esc
      no-close-on-backdrop
    >
      <!-- Timed Reminder Limit Message -->
      <div v-if="mode==='reminder'">
        <p v-if="message">
          Looks like you're enjoying ultraPacer (well at least you've racked up
          {{ message }} to your name).
        </p>
      </div>

      <!-- Course Limit Message -->
      <div v-else-if="mode==='courselimit'">
        <p>
          Glad you have been utilizing ultraPacer. In order to provide ultraPacer at no cost to
          you, free user accounts are limited to <b>{{ $config.freeCoursesLimit }} courses</b>
          created by them.
        </p>
        <p>
          Please consider joining the Patreon club to support the project. There is
          <b>no course limit</b> to users with Patreon membership at any donation level.
        </p>
      </div>

      <p>
        I do this on my own time and with my own resources. Donations help to cover some of my
        operating and coffee expenses.
      </p>
      <p>
        Would you sponsor ultraPacer on Patreon for as little as $1/month?
      </p>
      <p>
        Thanks,
        <br>
        Danny
      </p>
      <p
        v-if="noPledgesFound"
        class="text-danger"
      >
        Patreon connected successfully, however no pledges for ultraPacer were found.
        Please contact me if you see this message in error. Thanks for your support!
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
          @click="patreonOath"
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
    <b-alert
      :show="thankYouTimer"
      class="position-fixed fixed-bottom m-0 rounded-0 pt-1 pb-1"
      style="z-index: 5000"
      variant="success"
      fade
      @dismissed="thankYouTimer=0"
    >
      Thank you for your support! Happy trails!
    </b-alert>
    <b-alert
      :show="noPledgesTimer"
      class="position-fixed fixed-bottom m-0 rounded-0 pt-1 pb-1"
      style="z-index: 5000"
      variant="warning"
      fade
      @dismissed="noPledgesTimer=0"
    >
      Patreon connected successfully, however no pledges for ultraPacer were found. Please contact me if you see this message in error. Thanks for your support!
    </b-alert>
  </div>
</template>

<script>
import moment from 'moment'
export default {
  data () {
    return {
      delay: 10000,
      timeout: null,
      message: '',
      oathwindow: null,
      thankYouTimer: 0,
      loginURL: '',
      noPledgesFound: false,
      noPledgesTimer: 0,
      title: '',
      mode: 'reminder'
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
      try {
        // this component should only be loaded if authenticated, but double check:
        if (!this.$user.isAuthenticated) return

        if (this.$user.membership.active) {
          this.$logger('Patreon|initiate: already a member.')
          return
        }

        const next = moment(this.$user.membership.next_annoy || 0)
        const d = moment().diff(next, 'days')
        if (d >= 0) {
        // get user stats
          const userstats = await this.$api.getUserStats()
          let showModal = false
          if (userstats.courses >= 2) {
            showModal = true
            this.message = `${this.casualNumber(userstats.courses)} courses`
          } else if (userstats.plans >= 2) {
            showModal = true
            this.message = `${this.casualNumber(userstats.plans)} plans`
          } else {
            this.$logger('Patreon|initiate: not enough plans or courses')
          }
          if (showModal && !this.$refs.modal.isShow) {
            this.reminder()
          }
        } else {
          this.$logger(`Patreon|initiate: remind again in ${-d} days`)
        }
      } catch (error) {
        this.$error.handle(this.$gtag, error, 'Patreon|initiate')
      }
    },
    async show (arg = null) {
      this.noPledgesFound = false
      if (!this.loginURL) await this.getLoginURL()
      this.$gtag.event(this.mode, { event_category: 'Patreon' })
      this.$refs.modal.show()
    },
    async reminder () {
      this.title = 'Support ultraPacer?'
      this.mode = 'reminder'
      this.show()
    },
    async courseLimit () {
      this.title = 'Free course limit reached...'
      this.mode = 'courselimit'
      this.show()
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
      this.$logger('Patreon|goToPatreon')
      window.open('https://www.patreon.com/ultrapacer', '_blank')
      this.snoozeReminder(3)
      this.$gtag.event('visit', { event_category: 'Patreon' })
      this.$refs.modal.hide()
    },
    async maybeLater () {
      this.$logger('Patreon|maybeLater')
      this.snoozeReminder(14)
      this.$gtag.event('later', { event_category: 'Patreon' })
      this.$refs.modal.hide()
    },
    async snoozeReminder (delay) {
      this.$logger('Patreon|snoozeReminder')
      try {
        await this.$api.updateUser(
          this.$user._id,
          {
            'membership.last_annoyed': moment().toDate(),
            'membership.next_annoy': moment().add(delay, 'days').toDate()
          }
        )
      } catch (error) {
        this.$error.handle(this.$gtag, error, 'Patreon|snoozeReminder')
      }
    },
    async getLoginURL () {
      this.$logger('Patreon|getLoginURL : Getting Patreon login URL')
      try {
        const url = await this.$utils.timeout(this.$api.patreonGetLogin(), 5000)
        this.loginURL = url
      } catch (error) {
        // handle error:
        this.$error.handle(this.$gtag, error, 'Patreon|getLoginURL')
      }
    },
    async patreonOath () {
      try {
        if (!this.loginURL) await this.getLoginURL()
        if (!this.loginURL) throw new Error('No Patreon login URL')

        // open new window:
        this.oathwindow = window.open(
          this.loginURL,
          'ultrapacer-patreon-callback',
          'toolbar=no, menubar=no, width=600, height=700, top=100, left=100'
        )
        this.oathwindow.focus()

        // listen for messages from popup window:
        window.addEventListener('message', this.receiveMessage, false)
      } catch (error) {
        // handle error:
        this.$error.handle(this.$gtag, error, 'Patreon|patreonOath')
      }
    },
    async receiveMessage (event) {
      // ignore event if its not from same origin
      if (event.origin !== window.location.origin) return

      // if event is from our popup:
      if (event?.data?.source === 'ultrapacer-patreon-callback') {
        // add patreon information to user, return membership active:
        const success = await this.$api.patreonUpdateUser(event.data.code)
        this.$logger(`Patreon|receiveMessage : completed ${!success ? 'un' : ''}successfully.`)

        if (success) {
          // refresh user
          await this.$parent.getUser()

          // notify user of success
          this.thankYouTimer = 4

          // hide modal
          this.$refs.modal.hide()
        } else {
          // alert user that no membership was found:
          if (this.$refs.modal.isShow) { this.noPledgesFound = true } else { this.noPledgesTimer = 6 }
        }

        // remove listener:
        window.removeEventListener('message', this.receiveMessage, false)

        // close popup:
        this.oathwindow.close()
      }
    }
  }
}
</script>
