<template>
  <div
    v-if="sponsor && enabled && (fixed || scrolling) && layout==='corner'"
    :class="classes"
    style="padding:15px; text-align: center"
  >
    <div class="rotate-container">
      <p class="rotate small text-center">
        SPONSORED BY
      </p>
    </div>
    <b-img
      :src="sponsor.logourl"
      :title="'Check out ' + sponsor.name"
      :alt="'Check out ' + sponsor.name"
      class="sponsor-img"
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
      scrolling: false,
      sponsor: null,
      refTop: 0,
      refBottom: 0,
      refLeft: 0,
      refRight: 0,
      scrollTop: 0,
      windowHeight: 0,
      windowWidth: 0
    }
  },
  computed: {
    classes: function () {
      return {
        bottom: this.fixed,
        'pt-4': !this.fixed,
        'd-none': !this.scrolling,
        'd-md-block': !this.scrolling,
        left: this.align === 'left',
        right: this.align === 'right'
      }
    },
    roomBelow: function () {
      return this.windowHeight - this.refBottom > 130
    },
    roomLeft: function () {
      return this.refLeft > 250
    },
    roomRight: function () {
      return this.windowWidth - this.refRight > 250
    },
    fixed: function () {
      if (this.element === null) { return false }
      return (this.align === 'left' && this.roomLeft) ||
        (this.align === 'right' && this.roomRight) ||
        (this.roomBelow && this.scrollTop === 0)
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
      this.removeListeners()

      if (this.sponsor) {
        this.setUp()
      }
    }
  },
  async created () {
    this.getSponsor()
    this.setWindowSizes()
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
      this.$ga.event('Sponsor', 'click', this.sponsor.name)
      window.open(this.sponsor.href, '_blank')
    },
    setUp () {
      // set up listeners for when to show sponsor info
      this.el = null
      // get settings for this page
      const settings = [
        {
          name: ['CoursesManager'],
          element: 'coursesTable',
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
          name: ['Races'],
          element: 'pastRaces',
          align: 'left',
          scrolling: true
        },
        {
          name: ['Doc', 'Docs'],
          element: 'docs',
          align: 'left',
          scrolling: true
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
        this.element = setting.element
        this.align = setting.align
        this.scrolling = setting.scrolling

        // wait until the ref is created before enabling the sponsor info
        this.checker = setInterval(() => {
          if (
            this.$parent.$refs.routerView &&
            this.$parent.$refs.routerView.$refs[this.element] &&
            (
              this.$parent.$refs.routerView.initializing === undefined ||
              !this.$parent.$refs.routerView.initializing
            )
          ) {
            this.enabled = true
            clearInterval(this.checker)
            if (this.$parent.$refs.routerView.$refs[this.element].$el) {
              this.el = this.$parent.$refs.routerView.$refs[this.element].$el
            } else {
              this.el = this.$parent.$refs.routerView.$refs[this.element]
            }
            this.addListeners()
          }
        }, 50)
      } else {
        this.enabled = false
      }
    },
    setWindowSizes () {
      this.windowWidth = window.innerWidth
      this.windowHeight = window.innerHeight
      this.setRefSizes()
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
        this.setWindowSizes()
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
}
.sponsor-img {
  max-width:320px;
  max-height: 100px;
  display:inline-block;
  cursor:pointer;
}
</style>
