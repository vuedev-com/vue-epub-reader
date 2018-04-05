<template>
  <ul>
    <li v-for="title in subContent" :key="title.id">
      <a @click="showPage(title.href)">{{ title.label }}</a>
    <template v-if="title.subitems">
        <TreeMenu :subContent="title.subitems"></TreeMenu>
    </template>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'TreeMenu',
  props: {
    subContent: Array
  },
  methods: {
    showPage (cfi) {
      this.$root.$emit('showPage', cfi)
    }
  }
}
</script>
