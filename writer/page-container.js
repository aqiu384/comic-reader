const PageContainer = {
  template: '#app-page-container',
  data () { return {
    apiPath: '/comic/writer/api',
    page: {
      src: '/comic/writer/g/raidou/06_007.jpg',
      width: 1125,
      height: 1600
    },
    textBoxes: [],
    ocrResults: []
  } },
  created() {
    this.loadBoxes()
  },
  methods: {
    loadBoxes() {
      fetch(this.apiPath + '/g/raidou/06_007.jpg')
      .then(res => res.json())
      .then(res => this.textBoxes = res.boxes)
      .catch(() => this.textBoxes = null)
    },
    saveBoxes(boxes) {
      fetch(this.apiPath + '/g/raidou/06_007.jpg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boxes })
      })
      .then(res => res.json())
      .then(res => this.textBoxes = res.boxes)
      .catch(() => this.textBoxes = null)
    },
    runOcr() {
      fetch(this.apiPath + '/ocr/raidou/06_007.jpg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      .then(res => res.json())
      .then(res => this.ocrResults= [])
      .catch(() => this.ocrResults= null)
    }
  }
}
