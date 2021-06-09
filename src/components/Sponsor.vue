<template>
  <div
    v-if="(fixed || !$status.loading) && sponsor && enabled && (fixed || scrolling) && layout==='corner'"
    :class="classes"
    style="padding:15px; text-align: center; z-index: 70"
  >
    <div class="rotate-container no-print">
      <p class="rotate small text-center">
        <span
          v-if="align==='right'"
          class="mb-m1"
        >
          ultraPacer IS
        </span>
        <br v-if="align==='right'">
        SPONSORED BY
      </p>
    </div>
    <b-img
      :src="sponsor.logourl"
      :title="'Check out ' + sponsor.name"
      :alt="'Check out ' + sponsor.name"
      class="sponsor-img no-print"
      @click="goToSponsor"
    />
  </div>
  <about-card
    v-else-if="sponsor && layout==='card'"
    :title="'Sponsored by ' + sponsor.name"
    :alt="'Check out ' + sponsor.name"
    :img="sponsor.logourl"
  >
    <p>{{ sponsor.about }}</p>
    <b-button
      block
      variant="primary"
      @click="goToSponsor"
    >
      Check out {{ sponsor.name }}
    </b-button>
  </about-card>
</template>
<script>
import axios from 'axios'
import AboutCard from './AboutCard'
export default {
  components: {
    AboutCard
  },
  props: {
    layout: {
      type: String,
      default: 'corner'
    }
  },
  data () {
    return {
      align: 'right',
      element: null,
      el: null,
      enabled: false,
      resizeObserver: null,
      checker: null,
      checker2: null,
      scrolling: false,
      sponsor: null,
      refTop: 0,
      refBottom: 0,
      refLeft: 0,
      refRight: 0,
      scrollTop: 0
    }
  },
  computed: {
    classes: function () {
      return {
        'no-print': true,
        'sponsor-scaler': true,
        bottom: this.fixed,
        'pt-4': !this.fixed && this.$window.width >= 576,
        'pt-2': !this.fixed && this.$window.width < 576,
        'd-none': !this.scrolling,
        'd-md-block': !this.scrolling,
        left: this.align === 'left',
        right: this.align === 'right'
      }
    },
    roomBelow: function () {
      if (this.scrollTop && !this.scrolling) { return false }
      return this.$window.height - this.refBottom + (this.scrolling ? 0 : this.scrollTop) > 130
    },
    roomLeft: function () {
      return this.refLeft > 250
    },
    roomRight: function () {
      return this.$window.width - this.refRight > 250
    },
    fixed: function () {
      if (this.el === null) { return false }
      return (this.align === 'left' && this.roomLeft) ||
        (this.align === 'right' && this.roomRight) ||
        (!this.$status.loading && this.roomBelow && (!this.scrolling || this.scrollTop === 0))
    }
  },
  watch: {
    $route: function (val) {
      // clear out previous info
      if (
        (this.align === 'left' && !this.roomLeft) ||
        (this.align === 'right' && !this.roomRight)
      ) {
        this.enabled = false
      }
      clearInterval(this.checker2)
      this.removeListeners()

      if (this.sponsor) {
        this.setUp()
      }
    }
  },
  async created () {
    this.getSponsor()
  },
  async mounted () {
    this.setRefSizes()
  },
  beforeDestroy () {
    this.removeListeners()
    window.removeEventListener('resize', this.setRefSizes)
  },
  methods: {
    async getSponsor () {
      // get sponsor from api
      axios.get('/api-public/sponsor').then(res => {
        this.sponsor = res.data
        if (this.sponsor) {
          this.$logger('Sponsored by ' + this.sponsor.name)
          if (this.layout !== 'card') {
            this.setUp()
          }
        }
      })
    },
    goToSponsor () {
      this.$gtage(this.$gtag, 'Sponsor', 'click', this.sponsor.name)
      window.open(this.sponsor.href, '_blank')
    },
    setUp () {
      // set up listeners for when to show sponsor info
      // get settings for this page
      const settings = [
        {
          name: ['CoursesManager', 'Races', 'Doc', 'Docs'],
          align: 'left',
          scrolling: true
        },
        {
          name: ['Course', 'Race', 'Plan'],
          element: 'tables',
          align: 'right',
          scrolling: false
        },
        {
          name: ['Settings'],
          element: 'settings',
          align: 'left',
          scrolling: false
        }
      ]
      const setting = settings.find(s => s.name.indexOf(this.$route.name) >= 0)

      // if there are settings for this page, configure
      if (setting) {
        this.element = setting.element || null
        if (this.align !== setting.align) {
          this.enabled = false
          this.align = setting.align
        }
        this.scrolling = setting.scrolling

        // wait until the ref is created before enabling the sponsor info
        if (!this.checker) {
          this.checker = setInterval(() => {
            if (
              this.$parent.$refs.routerView &&
            (
              this.element === null ||
              this.$parent.$refs.routerView.$refs[this.element]
            ) && (
                this.$parent.$refs.routerView.initializing === undefined ||
              !this.$parent.$refs.routerView.initializing
              )
            ) {
              this.$logger('Sponsor|checker setting watched element')
              this.enabled = true
              clearInterval(this.checker)
              this.checker = null
              if (this.element === null) {
                this.el = this.$parent.$refs.routerView.$el
              } else if (this.$parent.$refs.routerView.$refs[this.element].$el) {
                this.el = this.$parent.$refs.routerView.$refs[this.element].$el
              } else {
                this.el = this.$parent.$refs.routerView.$refs[this.element]
              }
              this.addListeners()
              if (!this.checker2) {
                this.checker2 = setInterval(() => {
                  if (!this.el.clientHeight) {
                    this.$logger('Sponsor|checker2 watched element removed, retrying')
                    clearInterval(this.checker2)
                    this.checker2 = null
                    this.setUp()
                  }
                }, 1000)
              }
            }
          }, 100)
        }
      } else {
        this.enabled = false
      }
    },
    setRefSizes () {
      if (this.el !== null) {
        this.refTop = this.el.getBoundingClientRect().top
        this.refBottom = this.refTop + this.el.clientHeight
        this.refLeft = this.el.getBoundingClientRect().left
        this.refRight = this.refLeft + this.el.clientWidth
      }
    },
    addListeners () {
      // add listeners to check for space to show sponsor when either screen
      // or reference element change size
      window.addEventListener('resize', () => {
        this.setRefSizes()
      })
      window.addEventListener('scroll', () => {
        this.scrollTop = document.scrollingElement.scrollTop
      })
      this.resizeObserver = new ResizeObserver(() => {
        this.setRefSizes()
      })
      this.resizeObserver.observe(this.el)
      this.resizeObserver.observe(document.body)
      this.setRefSizes()
    },
    removeListeners () {
      // remove screen/element size listeners
      if (this.resizeObserver) {
        this.resizeObserver.disconnect()
      }
    }
  }
}
</script>

<style>
.bottom {
  position: fixed;
  bottom:0;
}
.left {
  left: 0;
}
.right {
  right: 0;
}
.rotate-container {
  width: 20px;
  height:100px;
  display:inline-block;
  vertical-align:middle;
}
.rotate {
  position:absolute;
  transform: translateX(-100%) rotate(-90deg);
  transform-origin: right;
  line-height: 1;
}
.sponsor-img {
  max-width:320px;
  max-height: 100px;
  display:inline-block;
  cursor:pointer;
}
.sponsor-scaler {
  @media (max-width: 575px) {
    zoom: 75%;
    -moz-transform: scale(0.75);
  }
}
.no-print {
  @media print {
    display: none !important;
  }
}
</style>
