const BookSearchComponent = {
  template: '#app-book-search',
  props: {
    rankedTags: Array,
    similarTags: Array
  },
  data() { return {
    tagCategories: [],
    form: {
      title: '',
      tagCount: 10,
      bookCount: 25,
      bookOffset: 0,
      includedTags: [],
      excludedTags: [],
      tagCategories: [],
      downloadsOnly: true
    },
    prevForm: {
      similarTags: [],
      includedTags: [],
      excludedTags: []
    },
    searchTagResults: [],
    searchTag: '',
  } },
  created() {
    this.onSearchBook()
  },
  watch: {
    similarTags() { this.searchTagResults = this.similarTags || [] }
  },
  computed: {
    tags() {
      return [].concat(
        this.prevForm.includedTags.map(t => ({ tag: t, count: 0 })),
        this.prevForm.similarTags.map(t => ({ tag: t, count: 0 })),
        (this.rankedTags || []),
        (this.searchTagResults || []).map(t => ({ tag: t, count: 0 }))
      )
    }
  },
  methods: {
    setPrevForm() {
      this.searchTagResults = []
      this.prevForm.includedTags = this.form.includedTags.slice()
      this.prevForm.excludedTags = this.form.excludedTags.slice()
    },
    onClearTags() {
      this.searchTag = ''
      this.form.includedTags = []
      this.form.excludedTags = []
    },
    onSearchTag() {
      const searchTag = this.searchTag.trim()
      if (searchTag) {
        this.prevForm.similarTags = this.prevForm.similarTags
          .filter(t => this.searchTagResults.indexOf(t) === -1)
          .concat(this.searchTagResults)
          .filter(t => this.form.includedTags.indexOf(t) !== -1)
        this.$emit('search-tag', searchTag.slice(0, 2).replace('q', ':') + searchTag.slice(2))
        this.searchTag = ''
      }
    },
    onSearchBook() {
      this.searchTag = ''
      this.setPrevForm()
      this.$emit('search-book', this.form)
    }
  }
}