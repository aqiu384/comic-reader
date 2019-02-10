const LibraryContainer = {
  template: '#app-library-container',
  props: {
    libraryName: String
  },
  data () { return {
    apiPrefix: '/comic/browse/',
    books: null,
    coverFiles: {
      'flip': 'cover.jpg.tmp',
      'type': 'cover.jpg.tmp',
      'thin': 'cover.jpg.tmp',
      'tank': '001.jpg'
    }
  } },
  computed: {
    libraryPrefix () {
      if (this.libraryName) {
        return this.apiPrefix + this.libraryName + '/'
      }
      return null
    },
    titleCrumbs () {
      return ['H', this.libraryName]
    }
  },
  created () {
    this.setPageTitle()
    this.fetchBooks()
  },
  watch: {
    titleCrumbs () { this.setPageTitle() },
    libraryPrefix () { this.fetchBooks() }
  },
  methods: {
    setPageTitle() {
      document.title = this.titleCrumbs.join(' - ')
    },
    fetchBooks () {
      if (this.libraryPrefix) {
        fetch(this.libraryPrefix).then(res =>
          res.json()
        ).then(res =>
          this.books = res.filter(book =>
            book.type === 'directory'
          ).map(book => ({
            title: book.name,
            cover: this.coverFiles[this.libraryName],
            url: this.libraryPrefix + book.name + '/',
            pages: null
          }))
        ).catch(err =>
          this.books = null
        )
      } else {
        this.books = null
      }
    }
  }
}
