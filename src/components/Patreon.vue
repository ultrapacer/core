<template>
  <div>
    <b-modal
      ref="modal"
      title="Support ultraPacer?"
      scrollable
      centered
      hide-header-close
      no-close-on-esc
      no-close-on-backdrop
    >
      <p v-if="message">
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
      <p
        v-if="noPledgesFound"
        class="text-danger"
      >
        Patreon connected successfully, however no pledges for ultraPacer were found. Please contact me if you see this message in error. Thanks for your support!
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
      delay: 2000,
      timeout: null,
      message: '',
      oathwindow: null,
      thankYouTimer: 0,
      loginURL: '',
      noPledgesFound: false,
      noPledgesTimer: 0
    }
  },
  created () {
    this.getLoginURL()
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
          if (showModal) {
            this.show()
          }
        } else {
          this.$logger(`Patreon|initiate: remind again in ${-d} days`)
        }
      } catch (error) {
        console.log(error)
        this.$gtag.exception({
          description: `Patreon|initiate: ${error.toString()}`,
          fatal: false
        })
      }
    },
    async show () {
      this.noPledgesFound = false
      this.$gtage(this.$gtag, 'Patreon', 'show')
      this.$refs.modal.show()
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
      this.$gtage(this.$gtag, 'Patreon', 'visit')
      this.$refs.modal.hide()
    },
    async maybeLater () {
      this.setLastAnnoyed(14)
      this.$gtage(this.$gtag, 'Patreon', 'later')
      this.$refs.modal.hide()
    },
    async setLastAnnoyed (delay) {
      try {
        await this.$api.updateUser(
          this.$user._id,
          {
            'membership.last_annoyed': moment().toDate(),
            'membership.next_annoy': moment().add(delay, 'days').toDate()
          }
        )
      } catch (error) {
        console.log(error)
        this.$gtag.exception({
          description: `Patreon|setLastAnnoyed: ${error.toString()}`,
          fatal: false
        })
      }
      this.$logger('Patreon| Updated last_annoyed')
    },
    async getLoginURL () {
      this.$logger('Patreon|getLoginURL : Getting Patreon login URL')
      try {
        const url = await this.$api.patreonGetLogin()
        this.loginURL = url
      } catch (error) {
        this.$error.handle(this.$gtag, error)
      }
    },
    patreonOath () {
      try {
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
        this.$error.handle(this.$gtag, error)
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
