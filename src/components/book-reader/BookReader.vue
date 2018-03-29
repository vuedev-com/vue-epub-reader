<template>
  <div>
    <div class="conteiner">
      <slot name="prev-btn" :goToPrevPage="goToPrevPage">
        <div id="prev" class="arrow" @click="goToPrevPage">‹</div>
      </slot>
      <div ref="viewer" id="area"></div>
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
      this.rendition = this.book.renderTo(this.$refs.viewer, {
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
      this.$root.$emit('toc', this.toc)
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

<style>
  body {
    position: relative;
  }

  .buton {
    background-color: #4a4a4a;
    border: none;
    color: white;
    padding: 13px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 22px;
    margin: 26px -115px;
    border-radius: 50%;
    font-family: 'Montserrat', sans-serif;
  }

  .conteiner:hover > .hover {
    visibility: visible;
  }

  .hover {
    background-color: #f8f8f8;
    font-family: 'Montserrat', sans-serif;
    width: 129px;
    margin-left: 93px;
    padding-top: 5px;
    text-align: center;
    margin-top: -13px;
  }

  .text {
    color: #8e8989;
    font-size: 7pt;
  }

  .text-size {
    border-radius: 115px;
    color: #6b6b6b;
  }

  #little-letter {
    font-size: 11pt;
    padding: 8px 15px 4px;
  }

  #big-letter {
    font-size: 15pt;
    padding: 3px 14px;
  }

  #gray-line {
    padding-bottom: 18px;
    border-bottom-width: 2px;
    border-bottom-style: solid;
    border-bottom-color: #efefef;
  }

  .button-background {
    border-radius: 119px;
    font-family: 'Montserrat', sans-serif;
    color: #6b6b6b;
    margin-bottom: 9px;
    font-size: 7pt;
    width: 100px;
    padding: 6px;
  }

  .button-background.current {
    border: 2px dashed red;
  }

  #beige {
    background-color: #f3e8d2;
  }

  #night {
    background-color: #4a4a4a;
    color: #f3f2f2;
  }

  .arrow {
    position: absolute;
    top: 50%;
    margin-top: -32px;
    font-size: 64px;
    color: #E2E2E2;
    font-family: arial, sans-serif;
    font-weight: bold;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
  }

  .arrow:hover {
    color: #777;
  }

  .arrow:active {
    color: #000;
  }

  #area {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 65%;
    height:80%;
  }
  #area iframe {
    border: none;
  }

  #prev {
    left: 40px;
  }
  #next {
    right: 40px;
  }

  button {
    outline:none;
  }

  .highlight {
    background-color: yellow;
  }

  .epub-reading-progress-bar {
    margin-top: 85vh;
    margin-left: 50vw;
  }
</style>
