<template>
  <div>
    <button class="buton" @click="toggleDropdown">Aa</button>
    <div class="hover" v-if="opened">
      <p class="text">ТЕКСТ</p>
      <div id="gray-line">
        <button class="text-size" id="little-letter" @click="fontSizeDecrease">A</button>
        <button class="text-size" id="big-letter" @click="fontSizeIncrease">A</button>
      </div>
      <p class="text">ФОН</p>
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
  </div>
</template>
<script>
const step = 10
export default {
  name: 'PreferencesDropdown',
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
    }
  },
  data () {
    return {
      opened: false,
      internalFontSize: 100
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
    }
  }
}
</script>
