<template>
  <div
    class="primary-page container-fluid mt-4"
  >
    <h1 class="h1 d-none d-md-block">
      Documentation
    </h1>
    <p>
      This documentation is a work in progress. Also check out videos on the
      <b-link
        href="https://www.youtube.com/channel/UCKptexajs3nGUG26wYNAmTQ"
        target="_blank"
      >
        ultraPacer YouTube Channel.
      </b-link>
      Send questions, report bugs, request features to
      <b-link href="mailto:danny@ultrapacer.com">
        danny@ultrapacer.com
      </b-link>
      or
      <b-link
        href="https://www.facebook.com/ultrapacer"
        target="_blank"
      >
        Facebook.
      </b-link>
    </p>
    <div
      ref="docs"
      class="accordion"
      role="tablist"
    >
      <b-card
        v-for="(doc, index) in Documents"
        :key="index"
        no-body
        class="mb-1"
      >
        <b-card-header
          header-tag="header"
          class="p-1"
          role="tab"
        >
          <b-button
            v-b-toggle="paths[index]"
            block
            variant="dark"
          >
            {{ titles[index] }}
          </b-button>
        </b-card-header>
        <b-collapse
          :id="paths[index]"
          :visible="$route.params.doc && $route.params.doc === paths[index]"
          accordion="my-accordion"
          role="tabpanel"
        >
          <b-card-body class="documentation">
            <component :is="doc" />
          </b-card-body>
        </b-collapse>
      </b-card>
    </div>
    <vue-headful
      description="ultraPacer help documentation."
      :title="$title + ' - ultraPacer'"
    />
  </div>
</template>

<script>
import { docs } from '@/docs/.config.js'
export default {
  title: 'Docs',
  computed: {
    Documents () {
      return docs.map(x => {
        return () => import(`@/docs/${x.file}`)
      })
    },
    titles () {
      return docs.map(x => {
        return x.name
      })
    },
    paths () {
      return docs.map(x => {
        return x.path
      })
    }
  },
  mounted () {
    this.$root.$on('bv::collapse::state', (collapseId, isJustShown) => {
      if (isJustShown) {
        const path = '/docs/' + collapseId
        history.pushState(
          {},
          null,
          path
        )
        const doc = docs.find(x => x.path === collapseId)
        if (doc) {
          this.$title = `Docs: ${doc.name}`
          this.$gtag.pageview(path)
        }
      }
    })
  }
}
</script>
