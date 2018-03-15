<template>
  <div class="conteiner">
    <slot name="prev-btn" :goToPrevPage="goToPrevPage">
      <div id="prev" class="arrow" @click="goToPrevPage">‹</div>
    </slot>
    <div ref="viewer" id="area"></div>
    <slot name="next-btn" :goToNextPage="goToNextPage">
      <div id="next" class="arrow" @click="goToNextPage">›</div>
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
    }
  },
  data () {
    return {
      book: null,
      rendition: null,
      toc: []
    }
  },
  watch: {
    theme (val) {
      this.setTheme(val)
    },

    fontSize (val) {
      this.setFontSize(val)
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
    }
  },
  mounted () {
    this.book = new Epub(this.epubUrl, {})
    this.book.loaded.navigation.then(({ toc }) => {
      this.toc = toc
      this.initReader()
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
    margin: 92px 86px;
    border-radius: 50%;
    font-family: 'Montserrat', sans-serif;
  }

  .conteiner:hover > .hover {
    visibility: visible;
  }

  .container {
    display: inline-block;
    vertical-align: top;
  }

  .hover {
    background-color: #f8f8f8;
    font-family: 'Montserrat', sans-serif;
    width: 129px;
    margin-left: 51px;
    padding-top: 5px;
    text-align: center;
    margin-top: -78px;
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
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    /*margin-top: 50px;*/
    width: 65%;
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
</style>
