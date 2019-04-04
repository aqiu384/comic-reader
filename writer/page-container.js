const PageContainer = {
  template: '#app-page-container',
  props: {
    bookId: String,
    pageId: String
  },
  data () { return {
    apiPath: '/comic/writer/api',
    textBoxes: []
  } },
  computed: {
    page() {
      return { src: `/g/${this.bookId}/${this.pageId}`}
    }
  },
  created() {
    this.loadBoxes()
  },
  watch: {
    page() {
      this.loadBoxes()
    }
  },
  methods: {
    loadBoxes() {
      fetch(this.apiPath + this.page.src)
      .then(res => res.json())
      .then(res => this.textBoxes = res.boxes)
      .catch(() => this.textBoxes = null)
    },
    saveBoxesPromise(boxes) {
      return fetch(this.apiPath + this.page.src, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boxes })
      })
    },
    saveBoxes(boxes) {
      this.saveBoxesPromise(boxes)
      .then(res => res.json())
      .catch(() => this.textBoxes = null)
    },
    runOcr(boxes) {
      this.saveBoxesPromise(boxes).then(res =>
        fetch(this.apiPath + this.page.src + '/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      )
      .then(res => res.json())
      .then(res => this.textBoxes = res.boxes)
      .catch(() => this.textBoxes = null)
    }
  }
}
