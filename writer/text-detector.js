const TextDetectorComponent = {
  template: '#app-text-detector',
  props: {
    page: Object,
    defaultBoxes: Array
  },
  data() { return {
    nwCorner: null,
    textBoxes: [],
    showOcr: false,
    showEdit: true,
    fonts: ['augie', 'wword']
  } },
  computed: {
    textSrc() {
      const parts = this.page.src.split('/')
      parts.splice(parts.length - 1, 0, 'text')
      return parts.join('/').replace('/g/', '/w/')
    },
    whiteSrc() {
      const parts = this.page.src.split('/')
      parts.splice(parts.length - 1, 0, 'page')
      return parts.join('/').replace('/g/', '/w/') + '.png'
    }
  },
  watch: {
    defaultBoxes() {
      this.textBoxes = this.defaultBoxes.map(box => {
        if (!box.raw) { box.raw = '' }
        if (!box.fin) { box.fin = '' }
        if (!box.font) { box.font = 'augie' }
        if (!box.fsize) { box.fsize = 20 }
        if (!box.lrpad) { box.lrpad = 20 }
        box.newOrder = null
        box.showEdit = true
        return box
      })
    }
  },
  methods: {
    addBox(e) {
      const nwCorner = this.nwCorner
      const d = e.target.getBoundingClientRect()
      const x = e.clientX - d.left
      const y = e.clientY - d.top

      if (nwCorner) {
        if (nwCorner.x < x && nwCorner.y < y) {
          this.textBoxes.push({
            x: Math.floor(nwCorner.x),
            y: Math.floor(nwCorner.y),
            w: Math.floor(x - nwCorner.x),
            h: Math.floor(y - nwCorner.y),
            raw: '',
            fin: '',
            font: 'augie',
            fsize: 20,
            lrpad: 20,
            newOrder: null,
            showEdit: true,
          })
        }
        this.nwCorner = null
      } else {
        this.nwCorner = { x, y }
      }
    },
    reorderBox(i) {
      const box = this.textBoxes[i]

      if (box.newOrder) {
        this.textBoxes.splice(i, 1)
        this.textBoxes.splice(box.newOrder - 1, 0, box)
        box.newOrder = null
      }
    },
    removeBoxAt(i) {
      this.textBoxes.splice(i, 1)
    },
    toggleBoxEdit(i) {
      const box = this.textBoxes[i]
      box.showEdit = !box.showEdit
      this.textBoxes.splice(i, 1, box)
    },
    saveBoxes() {
      this.$emit('save-boxes', this.textBoxes.map(b => {
        box = Object.assign({}, b)
        delete box.newOrder
        delete box.showEdit
        return box
      }))
    },
    runOcr() {
      this.$emit('run-ocr', this.textBoxes.map(b => {
        box = Object.assign({}, b)
        delete box.newOrder
        delete box.showEdit
        return box
      }))
    }
  }
}
