<template>
  <div>
    <slot name="book-content" :showContent="showContent">
      <button class="my-find my-content" @click="showContent">
        <img src="/static/left-alignment.svg" alt="">
      </button>
      <div class="search-widget" v-if="openContentWidget">
        <TreeMenu :subContent="toc"/>
      </div>
    </slot>
    <slot name="book-search"
      :toggleSearchWidget="toggleSearchWidget"
      :findText="findText"
      :removeHighlight="removeHighlight"
      :showPage="showPage"
    >
      <button class="my-find" @click="toggleSearchWidget">
        <img src="/static/search.svg" alt="">
      </button>
      <div class="search-widget" v-if="openSearchWidget">
        <input type="text"
         :value="value"
         @change="findText($event.target.value)"
        >
        <button @click="removeHighlight">x</button>
        <ul>
          <li v-for="(excerpt, i) in searchResults" :key="i" @click="showPage(excerpt.cfi)">
            <p>{{excerpt.excerpt}}</p>
          </li>
        </ul>
      </div>
    </slot>
    <slot name="book-appearance" :toggleDropdown="toggleDropdown" :fontSizeDecrease="fontSizeDecrease" :fontSizeIncrease="fontSizeIncrease" :selectTheme="selectTheme">
      <button class="buton" @click="toggleDropdown">Aa</button>
      <div class="hover" v-if="opened">
        <p class="text">TEXT</p>
        <div id="gray-line">
          <button class="text-size" id="little-letter" @click="fontSizeDecrease">A</button>
          <button class="text-size" id="big-letter" @click="fontSizeIncrease">A</button>
        </div>
        <p class="text">BACKGROUND</p>
        <button
          class="button-background"
          :class="{'current': key === currentTheme}"
          :style="theme.body"
          v-for="(theme, key) in themes"
          id="key"
          :key="key"
          @click="selectTheme(key)"
        >{{ theme.name }}</button>
      </div>
    </slot>
  </div>
</template>
<script>
import TreeMenu from '../tree-menu/'
const step = 10
export default {
  name: 'PreferencesDropdown',
  components: {
    TreeMenu
  },
  props: {
    themes: {
      type: Object,
      required: true
    },
    currentTheme: {
      type: String,
      required: true
    },
    fontSize: {
      type: Number
    },
    value: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      opened: false,
      openSearchWidget: false,
      openContentWidget: false,
      internalFontSize: this.fontSize,
      searchText: '',
      matches: [],
      searchResults: [],
      toc: null
    }
  },
  watch: {
    internalFontSize (val, oldVal) {
      if (val < 50 || val > 200) {
        this.internalFontSize = oldVal
        return
      }

      this.$emit('update:fontSize', this.internalFontSize)
    }
  },
  methods: {
    toggleDropdown () {
      this.opened = !this.opened
    },

    selectTheme (key) {
      this.$emit('update:currentTheme', key)
    },

    fontSizeIncrease () {
      this.internalFontSize += step
    },

    fontSizeDecrease () {
      this.internalFontSize -= step
    },

    toggleSearchWidget () {
      this.openSearchWidget = !this.openSearchWidget
    },

    showContent () {
      this.openContentWidget = !this.openContentWidget
      this.$root.$emit('showContent')
    },

    findText (value) {
      this.$emit('input', value)
      fetch('http://localhost:8085/search?q=' + value + '&uuid=01bf2ad2-b8f5-43cf-9089-1a1d0299bf83')
          .then(res => res.json())
          .then(matches => {
            this.matches = matches
            this.matches.map((item) => {
              return item.cfis
            }).map((item) => {
              return item
            }).map((e) => {
              this.searchResults.push(...e)
            })
            this.$emit('searchResults', this.searchResults)
          })
    },

    showPage (cfi) {
      this.$root.$emit('showPage', cfi)
    },

    removeHighlight () {
      this.$root.$emit('clearHighlight')
    }
  },
  mounted () {
    this.$root.$on('toc', (toc) => {
      this.toc = toc
    })
  }
}
</script>
