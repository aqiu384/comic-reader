const BookContainer = {
  template: '#app-book-container',
  props: {
    bookId: String,
    pageId: String
  },
  data () { return {
    apiPath: '/g',
    pages: [],
  } },
  created() {
    this.loadPages()
  },
  computed: {
    currPageInd() {
      if (this.pages && this.pageId) {
        return this.pages.indexOf(this.pageId)
      } else {
        return -1
      }
    }
  },
  watch: {
    bookId() { this.loadPage() }
  },
  methods: {
    loadPages() {
      fetch(`${this.apiPath}/${this.bookId}/`)
      .then(res => res.json())
      .then(res => this.pages = res
        .map(p => p.name)
        .filter(p => p.endsWith('.jpg') || p.endsWith('.png'))
      )
      .catch(() => this.pages = null)
    }
  }
}
