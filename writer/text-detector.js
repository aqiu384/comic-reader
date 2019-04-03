const TextDetectorComponent = {
  template: '#app-text-detector',
  props: {
    page: Object,
    defaultBoxes: Array
  },
  data() { return {
    nwCorner: null,
    textBoxes: []
  } },
  watch: {
    defaultBoxes() {
      this.textBoxes = this.defaultBoxes.slice()
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
          })
        }
        this.nwCorner = null
      } else {
        this.nwCorner = { x, y }
      }
    },
    removeBoxAt(i) {
      this.textBoxes.splice(i, 1)
    },
    saveBoxes() {
      this.$emit('save-boxes', this.textBoxes.slice())
    }
  }
}
