<template>
  <div>
    <div class="conteiner">
      <slot name="prev-btn" :goToPrevPage="goToPrevPage">
        <div id="prev" class="arrow" @click="goToPrevPage">‹</div>
      </slot>
      <slot name="book-content">
        <div ref="viewer" :id="bookArea"></div>
      </slot>
      <slot name="next-btn" :goToNextPage="goToNextPage">
        <div id="next" class="arrow" @click="goToNextPage">›</div>
      </slot>
    </div>
    <slot name="progress-bar" :onChange="onChange" :onMousedown="onMousedown" :onMouseup="onMouseup">
      <div class="epub-reading-progress-bar">
        <input size="3" type="range" max="100" min="0" step="1"
         @change="onChange($event.target.value)"
         :value="progress"
        /> %
        <input type="text"
         @change="onChange($event.target.value)"
         @mousedown="onMousedown"
         @mouseup="onMouseup"
         :value="progress"
        >
      </div>
    </slot>
  </div>
</template>

<script>
import Epub from 'epubjs'
global.ePub = Epub

export default {
  name: 'BookReader',
  props: {
    epubUrl: {
      type: String,
      required: true
    },
    fontSize: {
      type: Number,
      default: 100
    },
    themes: {
      type: Object,
      required: true
    },
    theme: {
      type: String,
      required: true
    },
    progress: {
      type: Number,
      required: true
    },
    bookArea: {
      type: String,
      default: 'area'
    }
  },
  data () {
    return {
      book: null,
      rendition: null,
      section: null,
      toc: [],
      progressValue: 0,
      slide: null,
      mouseDown: false,
      cfi: null
    }
  },
  watch: {
    theme (val) {
      this.setTheme(val)
    },

    fontSize (val) {
      this.setFontSize(val)
    },

    progressValue (val) {
      this.$emit('update:progress', val)
    }
  },
  methods: {
    initReader () {
      this.rendition = this.book.renderTo(this.bookArea, {
        contained: true
      })
      this.registerThemes()
      this.setTheme(this.theme)
      this.rendition.display()
    },

    registerThemes () {
      this.rendition.themes.register(this.themes)
    },

    goToPrevPage () {
      this.rendition.prev()
    },

    goToNextPage () {
      this.rendition.next()
    },

    setTheme (theme) {
      this.rendition.themes.select(theme)
      document.body.style.background = this.themes[theme]['body'].background
    },

    setFontSize (size) {
      this.rendition.themes.fontSize(size + '%')
    },

    goToExcerpt (cfi) {
      if (cfi.toLowerCase().indexOf('xhtml') > 0) {
        this.rendition.display(cfi)
      } else {
        this.rendition.display('epubcfi(' + cfi + ')')
        this.rendition.annotations.highlight('epubcfi(' + cfi + ')')
      }
    },

    showProgress () {
      this.book.ready.then(() => {
        let key = this.book.key() + '-locations'
        let stored = localStorage.getItem(key)
        if (stored) {
          return this.book.locations.load(stored)
        } else {
          return this.book.locations.generate(1600)
        }
      }).then((locations) => {
        let cfi = this.book.locations.cfiFromPercentage(this.progress / 100)
        this.rendition.display(cfi).then(() => {
          let currentLocation = this.rendition.currentLocation()
          let currentPage = this.book.locations.percentageFromCfi(currentLocation.start.cfi)
          if (currentPage > 0) {
            this.progressValue = currentPage
          }
        })

        this.rendition.on('relocated', (location) => {
          let percent = this.book.locations.percentageFromCfi(location.start.cfi)
          let percentage = Math.floor(percent * 100)
          this.progressValue = percentage
        })
        localStorage.setItem(this.book.key() + '-locations', this.book.locations.save())
      })
    },

    onChange (value) {
      let cfi = this.book.locations.cfiFromPercentage(value / 100)
      this.rendition.display(cfi)
    },

    onMousedown () {
      this.mouseDown = true
    },

    onMouseup () {
      this.mouseDown = false
    }
  },
  mounted () {
    this.book = new Epub(this.epubUrl, {})
    this.book.loaded.navigation.then(({ toc }) => {
      this.toc = toc
      this.$emit('toc', this.toc)
      this.initReader()
      this.showProgress()
    })

    this.$root.$on('showPage', (cfi) => {
      this.cfi = cfi
      this.goToExcerpt(cfi)
    })
    this.$root.$on('clearHighlight', () => {
      this.rendition.annotations.remove('epubcfi(' + this.cfi + ')')
    })
  }
}
</script>
