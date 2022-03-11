<template>
  <div>
    <b-form-radio
      v-model="all"
      :value="false"
      @change="changeRadio"
    >
      Send me email for the following categories:
    </b-form-radio>
    <div class="pl-4">
      <b-form-checkbox
        v-for="subscription in subscriptions"
        :id="`checkbox-${subscription.key}`"
        :key="subscription.key"
        v-model="subscription.selected"
        :name="`checkbox-${subscription.key}`"
        :disabled="all"
        @change="change"
      >
        {{ subscription.description }}
      </b-form-checkbox>
    </div>

    <b-form-radio
      v-model="all"
      :value="true"
      @change="changeRadio"
    >
      Don't send me any emails
    </b-form-radio>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      default: () => { return { all: false, categories: [] } }
    }
  },
  data () {
    return {
      all: false,
      subscriptions: [
        {
          key: 'news',
          description: 'Updates and news',
          selected: true
        },
        {
          key: 'tips',
          description: 'Tips and tricks',
          selected: true
        },
        {
          key: 'event',
          description: 'Pre- and post-event emails',
          selected: true
        }
      ]
    }
  },
  watch: {
    value () {
      this.reformat()
    }
  },
  mounted () {
    this.reformat()
  },
  methods: {
    async reformat () {
      this.all = Boolean(this.value.all)
      if (this.all) {
        this.subscriptions.forEach(s => { s.selected = false })
      } else if (this.value.categories) {
        this.subscriptions.forEach(sub => { sub.selected = !this.value.categories.includes(sub.key) })
      }
    },
    async changeRadio (val) {
      this.subscriptions.forEach(s => { s.selected = !val })
      this.change()
    },
    async change (val) {
      const unsubcriptions = {
        all: this.all,
        categories:
          this.all
            ? []
            : this.subscriptions.filter(s => !s.selected).map(s => s.key)
      }
      this.$emit('input', unsubcriptions)
    }
  }
}
</script>
