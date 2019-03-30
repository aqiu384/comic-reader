function flipFramesLoop(frames, currFrame, frameRate) {
  if (currFrame === frames.length - 1) {
    frames[0].style.transition = '0ms';
    frames[0].style.opacity = 1;
    frames[1].style.opacity = 1;
    frames[2].style.opacity = 1;
  } else if (currFrame === 0) {
    frames[0].style.transition = frameRate.toString() + 'ms';
    frames[0].style.opacity = 0;
  } else {
    if (currFrame + 1 < frames.length) {
      frames[currFrame].style.opacity = 0;
    } if (currFrame + 2 < frames.length) {
      const nxnxFrame = frames[currFrame + 2];
      nxnxFrame.style.opacity = 1;

      if (!nxnxFrame.src) {
        nxnxFrame.src = nxnxFrame.nextSrc;
      }
    }
  }

  const nextFrame = (currFrame + 1) % frames.length;
  const waitTime = nextFrame === 0 ? frameRate / 5 : frameRate;

  return { nextFrame, waitTime }
}

const FlipbookComponent = {
  template: '#app-flipbook',
  props: {
    chapter: Object,
    prevChapterUrl: String,
    nextChapterUrl: String
  },
  data () { return {
    frameRate: 500,
    frameLoop: null,
    frames: null
  } },
  created () {
    this.loadFrames()
  },
  beforeDestroy () {
    this.clearFrameLoop()
  },
  watch: {
    chapter () { this.loadFrames() }
  },
  methods: {
    clearFrameLoop () {
      if (this.frameLoop) {
        clearTimeout(this.frameLoop)
        this.frameLoop = null
      }
    },
    loadFrames () {
      if (!this.chapter) {
        return
      }

      this.clearFrameLoop()

      const transition = this.frameRate.toString() + 'ms'
      const chapterLen = this.chapter.pages.length;
      const frames = this.chapter.pages.map((page, i) => ({
        src: null,
        nextSrc: this.chapter.url + page,
        style: { transition, zIndex: chapterLen - i, opacity: 1 }
      }))

      frames[0].src = frames[0].nextSrc;
      frames[1].src = frames[1].nextSrc;
      frames[2].src = frames[2].nextSrc;

      frames.push({
        src: frames[0].nextSrc,
        nextSrc: frames[0].nextSrc,
        style: { transition, zIndex: 0, opacity: 1, position: 'relative' }
      })

      this.frames = frames
      this.flipPages(0)
    },
    flipPages (currFrame) {
      const res = flipFramesLoop(this.frames, currFrame, this.frameRate)
      this.frameLoop = setTimeout(() => { this.flipPages(res.nextFrame) }, res.waitTime)
    }
  }
}
