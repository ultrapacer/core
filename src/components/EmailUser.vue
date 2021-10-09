<template>
  <div>
    <b-modal
      ref="modal"
      centered
      :static="true"
      title="Send Message to Course Owner"
      hide-header-close
      :no-close-on-esc="$status.processing"
      :no-close-on-backdrop="$status.processing"
      @hidden="clear"
      @cancel="clear"
      @ok="handleOk"
    >
      <form
        ref="emailform"
        @submit.prevent=""
      >
        <b-input-group
          prepend="Your Name"
        >
          <b-form-input
            v-model="name"
            required
            type="text"
          />
        </b-input-group>
        <b-input-group
          class="mt-1"
          prepend="Your Email"
        >
          <b-form-input
            v-model="replyTo"
            required
            type="email"
          />
        </b-input-group>
        <b-input-group
          class="mt-1"
          prepend="Message"
        >
          <b-form-textarea
            v-model="message"
            required
            rows="4"
          />
        </b-input-group>
        <div class="mt-2 w100">
          <small>Sending this message will share your name and email with the course owner.</small>
        </div>
      </form>
      <template #modal-footer="{ ok, cancel }">
        <b-button
          variant="secondary"
          @click="cancel()"
        >
          Cancel
        </b-button>
        <b-button
          variant="primary"
          @click="ok()"
        >
          Send
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import api from '@/api'
function capitalize (s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
export default {
  props: {
    userId: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    url: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      message: '',
      name: '',
      replyTo: ''
    }
  },
  methods: {
    async show () {
      this.replyTo = this.$auth.profile.email
      this.name = this.$auth.profile.given_name
      this.$refs.modal.show()
    },
    handleOk (bvModalEvt) {
      bvModalEvt.preventDefault()
      if (this.$refs.emailform.reportValidity()) {
        this.send()
      }
    },
    async send () {
      if (this.$status.processing) { return }
      this.$status.processing = true
      try {
        await api.emailUser(
          this.userId,
          {
            name: this.name,
            type: this.type,
            course: this.subject,
            message: this.message,
            replyTo: this.replyTo,
            url: this.url
          })
        this.$gtag.event('email', { event_category: capitalize(this.type), event_label: this.subject })
        this.$alert.show('Message sent!')
      } catch (error) {
        this.$error.handle(this.$gtag, error, 'EmailUser|send')
      }
      this.$status.processing = false
      this.$refs.modal.hide()
    },
    clear () {
      this.message = ''
    }
  }
}
</script>
