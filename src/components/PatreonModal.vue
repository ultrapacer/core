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
    <div v-if="showPatreonEmail">
      <p class="text-danger">
        Patreon information not found. Please enter the email address associated with your Patreon account. Contact me if you have problems with this step.
      </p>
      <form
        ref="patreon-email-form"
        @submit.prevent=""
      >
        <b-input-group
          prepend="Email"
          class="pl-4"
        >
          <b-form-input
            v-model="newPatreonEmail"
            type="email"
            required
          />
          <b-input-group-append v-if="patreonEmailValid">
            <b-button
              variant="outline-success"
              @click="updatePatreonEmail"
            >
              Save
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </form>
    </div>

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
import moment from 'moment'
export default {
  data () {
    return {
      delay: 2000,
      timeout: null,
      message: '',
      showPatreonEmail: false,
      patreonEmail: '',
      newPatreonEmail: ''
    }
  },
  computed: {
    patreonEmailValid: function () {
      if (
        !this.showPatreonEmail ||
        this.newPatreonEmail === this.patreonEmail
      ) {
        return false
      } else {
        return Boolean(this.$refs['patreon-email-form'].checkValidity())
      }
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
        if (!this.$user.isAuthenticated) return

        if (this.$user.membership.active) {
          this.$logger('PatreonModal|initiate: already a member.')
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
            this.$logger('PatreonModal|initiate: not enough plans or courses')
          }
          if (showModal) {
            this.$gtage(this.$gtag, 'Patreon', 'show')
            this.$refs.patreon.show()
          }
        } else {
          this.$logger(`PatreonModal|initiate: remind again in ${-d} days`)
        }
      } catch (error) {
        console.log(error)
        this.$gtag.exception({
          description: `PatreonModal|initiate: ${error.toString()}`,
          fatal: false
        })
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
      this.$gtage(this.$gtag, 'Patreon', 'visit')
      this.$refs.patreon.hide()
    },
    async maybeLater () {
      this.setLastAnnoyed(14)
      this.$gtage(this.$gtag, 'Patreon', 'later')
      this.$refs.patreon.hide()
    },
    async alreadyJoined () {
      this.$status.processing = true
      try {
        await this.$api.patreonPatronsRefresh()
        await this.$parent.getUser()

        if (this.$user.membership.active) {
          this.$gtage(this.$gtag, 'Patreon', 'joined')
          this.$api.updateUser(
            this.$user._id,
            { 'membership.last_annoyed': moment().toDate() }
          )
          this.$logger('PatreonModal| Updated to member')
          this.$refs.patreon.hide()
        } else {
          if (this.$user.membership.patreon && this.$user.membership.patreon.email) {
            this.patreonEmail = this.$user.membership.patreon.email
          } else {
            this.patreonEmail = this.$user.email
          }
          this.newPatreonEmail = this.patreonEmail
          this.showPatreonEmail = true
        }
      } catch (error) {
        console.log(error)
        this.$gtag.exception({
          description: `PatreonModal|updatePatreonEmail: ${error.toString()}`,
          fatal: false
        })
      }
      this.$status.processing = false
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
          description: `PatreonModal|setLastAnnoyed: ${error.toString()}`,
          fatal: false
        })
      }
      this.$logger('PatreonModal| Updated last_annoyed')
    },
    async updatePatreonEmail () {
      this.$status.processing = true
      try {
        await this.$api.updateUser(
          this.$user._id,
          {
            'membership.patreon': { email: this.newPatreonEmail }
          }
        )
        this.alreadyJoined()
      } catch (error) {
        console.log(error)
        this.$gtag.exception({
          description: `PatreonModal|updatePatreonEmail: ${error.toString()}`,
          fatal: false
        })
        this.$status.processing = false
      }
    }
  }
}
</script>
