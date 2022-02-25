<template>
  <div>
    <b-modal
      ref="modal"
      title="Buy me a coffee :]"
      scrollable
      centered
    >
      <div>
        <p>
          Hi!
        </p>
        <p>
          I'm happy you're using ultraPacer. Developing this site and course content has been a labor of love,
          and I'm glad to provide it as a tool to the running community.
          Its free for your use, however providing it isn't free for me and
          requires a lot of my limited time.
        </p><p /><p v-if="mode==='courselimit'">
          To limit my costs, free user accounts are limited to {{ $config.freeCoursesLimit }} courses
          created by them. Courses shared to the Races page do not count against your limit :]
          <br>
          There is no course limit to users with "Buy me a coffee" or Patreon membership at any donation level.
        </p>
        <p>
          If you've benefitted from ultraPacer, please consider reciprocating by
          supporting the project. I can take donations via "Buy me a coffee" (preferred as they
          take the least fees), or otherwise by Patreon membership and Paypal donations. Following the
          "Buy me a coffee" link below, you can support by a one-time donation of "coffees", or select
          the membership option to become a recurring member of ultraPacer. Please use the same email
          address as your ultraPacer login so I can associate your donation.
        </p>
        <p>
          Thanks for taking the time to read this. Happy trails!
        </p>
        <p>
          -Danny
        </p>
      </div>

      <template #modal-footer>
        <div style=" text-align:center; width:100%">
          <b-img
            style="cursor:pointer; width:80%; max-width:300px;"
            :src="require('../assets/bmc-yellow-button.png')"
            @click="goToBuyMeACoffee"
          />
        </div>
        <div
          style=" text-align:center; width:100%"
          class="mt-3"
        >
          <b-button
            variant="primary"
            class="mr-2"
            @click="goToPaypal"
          >
            <v-icon name="brands/paypal" />
            Paypal
          </b-button>
          <b-button
            variant="primary"
            class="ml-2"
            @click="goToPatreon"
          >
            <v-icon name="brands/patreon" />
            Patreon
          </b-button>
        </div>
        <div style="width:100%">
          <p class="mt-4">
            PS, if you're seeing this and you're already a member, let me know.
          </p>
        </div>
      </template>
    </b-modal>
    <form
      ref="paypalForm"
      action="https://www.paypal.com/cgi-bin/webscr"
      method="post"
      target="_blank"
    >
      <input
        type="hidden"
        name="cmd"
        value="_donations"
      >
      <input
        type="hidden"
        name="business"
        value="danny@ultrapacer.com"
      >
      <input
        type="hidden"
        name="currency_code"
        value="USD"
      >
    </form>
  </div>
</template>

<script>
import moment from 'moment'
export default {
  data () {
    return {
      delay: 10000,
      timeout: null,
      oathwindow: null,
      logger: this.$log.child({ file: 'Support.vue' }),
      loginURL: '',
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
      const logger = this.logger.child({ method: 'initiate' })
      try {
        // this component should only be loaded if authenticated, but double check:
        if (!this.$user.isAuthenticated) return

        if (this.$user.membership?.active) {
          logger.info('Already a member.')
          return
        }

        const next = moment(this.$user.membership?.nextAnnoy || 0)
        const d = moment().diff(next, 'days')
        if (d >= 0) {
        // get user stats
          const userstats = await this.$api.getUserStats()
          let showModal = false
          if (userstats.courses >= 2) {
            showModal = true
          } else if (userstats.plans >= 2) {
            showModal = true
          } else {
            logger.info('Not enough plans or courses.')
          }
          if (showModal && !this.$refs.modal.isShow) {
            this.reminder()
          }
        } else {
          logger.info(`Remind again in ${-d} days`)
        }
      } catch (error) {
        logger.error(error.stack)
      }
    },
    async show (arg = null) {
      this.$gtag.event(this.mode, { event_category: 'Support' })
      this.snoozeReminder(10)
      this.$refs.modal.show()
    },
    async reminder () {
      this.mode = 'reminder'
      this.show()
    },
    async courseLimit () {
      this.mode = 'courselimit'
      this.show()
    },
    async goToBuyMeACoffee () {
      this.logger.child({ method: 'goToBuyMeACoffee' }).info('execute')
      window.open('https://buymeacoffee.com/ultrapacer', '_blank')
      this.$gtag.event('visit', { event_category: 'BuyMeACoffee' })
    },
    async goToPatreon () {
      this.logger.child({ method: 'goToPatreon' }).info('execute')
      window.open('https://www.patreon.com/ultrapacer', '_blank')
      this.$gtag.event('visit', { event_category: 'Patreon' })
    },
    async goToPaypal () {
      this.logger.child({ method: 'goToPaypal' }).info('execute')
      this.$refs.paypalForm.submit()
      this.$gtag.event('visit', { event_category: 'Paypal' })
    },
    async snoozeReminder (delay) {
      const logger = this.logger.child({ method: 'snoozeReminder' })
      try {
        if (this.$user.isAuthenticated) {
          logger.info(`Snoozed ${delay} days.`)
          await this.$api.updateUser(
            this.$user._id,
            {
              'membership.lastAnnoyed': moment().toDate(),
              'membership.nextAnnoy': moment().add(delay, 'days').toDate()
            }
          )
        } else {
          logger.info('User not authenticated.')
        }
      } catch (error) {
        logger.error(error.stack)
      }
    },

    // these next methods are not currently being used, but may be useful later; for Patreon oath login:
    async getLoginURL () {
      this.$logger('Patreon|getLoginURL : Getting Patreon login URL')
      try {
        const url = await this.$utils.timeout(this.$api.patreonGetLogin(), 5000)
        this.loginURL = url
      } catch (error) {
        // handle error:
        this.$error.handle(error, 'Patreon|getLoginURL')
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
        this.$error.handle(error, 'Patreon|patreonOath')
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
          this.$alert.show('Thank you for your support! Happy trails!')

          // hide modal
          this.$refs.modal.hide()
        } else {
          // alert user that no membership was found:
          this.$alert.show(
            'Patreon connected successfully, however no pledges for ultraPacer were found. Please contact me if you see this message in error.',
            { variant: 'warning', timer: 6 }
          )
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
