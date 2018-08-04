> vue-epub-reader

# ⚠️ This package was created for educational purposes only.
# ⛔️ Don't use it in production.

[![npm](https://img.shields.io/npm/v/vue-epub-reader.svg) ![npm](https://img.shields.io/npm/dm/vue-epub-reader.svg)](https://www.npmjs.com/package/vue-epub-reader)
[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)

Wrapper around epubjs for Vue

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [Example](#example)

# Installation

```
npm install --save vue-epub-reader
```

## Import

```javascript
import Vue from 'vue'
import { BookReader, PreferencesDropdown, TreeMenu } from 'vue-epub-reader'

components: {
    BookReader,
    PreferencesDropdown,
    TreeMenu
}
```

**⚠️ A css file is included when importing the package. You may have to setup your bundler to embed the css in your page.**

## Components

### BookReader
Component of the book with the progress


##### Props


| Props | Required | Type |	Default | Description |
| ------ | ------ | ------ |------ |------ |
| epubUrl | true | String | /static/moby-dick.epub   | url book |
| fontSize | false | Number | 100 | font size in percent |
| themes | true | Object | |themes of text and background color |
| theme | true | String | white |current theme of text and background color |
| progress* | true | Number | 29 | progress in reading the book |
| bookArea | false | String |area |id element for render |
| contentBookModify | false | Number | 0 | amount of padding at the top and bottom of the book |

***you need to use .sync**


#### Slots
Component has named slots so that you can create custom elements of the reader.

| name  | Description |
| ------ | ------ |
| prev-btn | left arrow |
| book-content | ```<div :id="bookArea"></div>``` block in which is generated an iframe for the book |
| next-btn | right arrow |
| progress-bar | progress bar for progress of reading |


#### Methods
Each slot has certain methods for working with a book

| method  | slot | Description |
| ------ | ------ | ------ |
| goToPrevPage | prev-btn | go to the next "page" |
| goToNextPage | next-btn | go to the previous "page" |
| onChange | progress-bar | event `change` for input, that is the progress bar of reading a book. It    |
| onMousedown | progress-bar | event `mousedown` by clicking on the progress bar |
| onMouseup | progress-bar | event `mouseup` by clicking on the progress bar |


#### Custom events
| method | Description |
| ------ | ------ |
| toc | get table of contents of book |
| closeAppearanceMenu | close appearance menu on click on book |


### PreferencesDropdown
Component that displays a menu of search by content, content, and appearance changes


#### Props

| Props | Required | Type |	Default | Description |
| ------ | ------ | ------ |------ |------ |
| themes | true | Object | |themes of text and background color |
| current-theme* | true | String | white |current theme of text and background color |
| font-size* | false | Number | |font size in percent |

***you need to use .sync**

#### Slots
Component has named slots so that you can create custom elements of the reader.

| name  | Description |
| ------ | ------ |
| book-content | button and a menu that displays the contents of the book |
| book-search | button and a menu that displays the search results of the book |
| book-appearance | button and menu to change the appearance of the reader  |


#### Methods
Each slot has certain methods for working with a book

| method  | slot | Description |
| ------ | ------ | ------ |
| showContent | book-content | show content of books |
| `<TreeMenu :subContent="toc"/>` | book-content | an auxiliary component for content (**toc**) that is displayed as a nested list  |
| findText | book-search | event `change` for input, that takes the value of an input |
| removeHighlight | book-search | remove highlight of found text |
| showPage(excerpt **.cfi**) | book-search | show results of search |
| fontSizeDecrease | book-appearance | decreases the text size by 10% |
| ontSizeIncrease | book-appearance | increases the text size by 10% |
| selectTheme(key) | book-appearance | set selected theme. Requires the object key of the themes |


#### Custom events
| method | Description |
| ------ | ------ |
| searchResults | get search results of books |
| v-model="searchQuery" | `searchQuery` - value of search input |

# Usage

```js
<template>
  <div id="app">
    <PreferencesDropdown
      :themes="themes"
      :current-theme.sync="currentTheme"
      :font-size.sync="size"
      v-model="serchQuery"
      @searchResults="onSearchResults"
    >
      <template slot="book-content" slot-scope="props">
        <button class="my-find my-content" @click="showContent">
          <img src="/static/left-alignment.svg" alt="">
        </button>
        <div class="search-widget1" v-if="openContent">
          <TreeMenu :subContent="toc"/>
        </div>
      </template>
      <template slot="book-search" slot-scope="props">
        <button class="my-find" @click="toggleSearchWidget">
          <img src="/static/search.svg" alt="">
        </button>
        <div class="search-widget1" v-if="openSearch">
          <input type="text"
                 :value="serchQuery"
                 @change="props.findText($event.target.value)"
          >
          <button @click="props.removeHighlight">x</button>
          <ul>
            <li v-for="(excerpt, i) in searchContent" :key="i" @click="props.showPage(excerpt.cfi)">
              <p>{{excerpt.excerpt}}</p>
            </li>
          </ul>
        </div>
      </template>
    </PreferencesDropdown>
    <BookReader
      :epub-url="url"
      :font-size="size"
      :themes="themes"
      :theme="currentTheme"
      :progress.sync="readingProgress"
      @toc="getContent"
      :contentBookModify="90"
    >
      <template slot="progress-bar" slot-scope="props">
        <input size="3" type="range" max="100" min="0" step="1"
          @change="props.onChange($event.target.value)"
          :value="readingProgress"
        /> %
        <input type="text"
          @change="props.onChange($event.target.value)"
          @mousedown="props.onMousedown"
          @mouseup="props.onMouseup"
          :value="readingProgress"
        >
      </template>
    </BookReader>
  </div>
</template>

<script>
import BookReader from './components/BookReader'
import TreeMenu from './components/TreeMenu'
import PreferencesDropdown from './components/PreferencesDropdown.vue'
import vueSlider from 'vue-slider-component'
export default {
  name: 'App',
  components: {
    BookReader,
    PreferencesDropdown,
    TreeMenu,
    vueSlider
  },
  data () {
    return {
      url: './static/alice.epub',
      size: 80,
      currentTheme: 'beige',
      themes: {
        white: {
          body: {
            color: '#000000',
            background: '#ffffff'
          },
          name: 'WHITE'
        },
        beige: {
          body: {
            color: '#000000',
            background: '#f3e8d2'
          },
          name: 'BEIGE'
        },
        night: {
          body: {
            color: '#ffffff',
            background: '#4a4a4a'
          },
          name: 'NIGHT'
        }
      },
      serchQuery: '',
      readingProgress: 20,
      openSearch: false,
      openContent: false,
      searchContent: [],
      toc: []
    }
  },
  methods: {
    toggleSearchWidget () {
      this.openSearch = !this.openSearch
    },

    showContent () {
      this.openContent = !this.openContent
    },

    onSearchResults (value) {
      this.searchContent = value
    },

    getContent (value) {
      this.toc = value
    }
  },
  mounted () {
    this.$root.$on('toc', (toc) => {
      this.toc = toc
    })
  }
}
</script>
```

# Example

You can play around with that [here](https://codesandbox.io/s/zxzwm75ym4)

---

# Plugin Development

## Installation

The first time you create or clone your plugin, you need to install the default dependencies:

```
npm install
```

## Watch and compile

This will run webpack in watching mode and output the compiled files in the `dist` folder.

```
npm run dev
```

## Use it in another project

While developping, you can follow the install instructions of your plugin and link it into the project that uses it.

In the plugin folder:

```
npm link
```

In the other project folder:

```
npm link vue-epub-reader
```

This will install it in the dependencies as a symlink, so that it gets any modifications made to the plugin.

## Publish to npm

You may have to login to npm before, with `npm adduser`. The plugin will be built in production mode before getting published on npm.

```
npm publish
```

## Manual build

This will build the plugin into the `dist` folder in production mode.

```
npm run build
```

---

## License

[MIT](http://opensource.org/licenses/MIT)
