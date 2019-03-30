const LibraryContainer = {
  template: '#app-library-container',
  props: {
    bookId: String
  },
  data() { return {
    apiPath: '/comic/reader/api',
    books: null,
    rankedTags: null,
    similarTags: null
  } },
  methods: {
    getBooksAndTagRanks(query) {
      this.similarTags = null
      this.searchBooks(query)
      this.searchTagRanks(query)
    },
    searchBooks(query) {
      fetch(this.apiPath + '/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
      })
      .then(res => res.json())
      .then(res => this.books = res)
      .catch(() => this.books = null)
    },
    searchTags(tag) {
      fetch(this.apiPath + '/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag, tagCount: 5 })
      })
      .then(res => res.json())
      .then(res => this.similarTags = res.map(t => t.id))
      .catch(() => this.similarTags = null)
    },
    searchTagRanks(query) {
      fetch(this.apiPath + '/tag-ranks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
      })
      .then(res => res.json())
      .then(res => this.rankedTags = res)
      .catch(() => this.rankedTags = null)
    }
  }
}