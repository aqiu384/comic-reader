function zeroPad(n, p) {
  const s = n.toString();
  return p - s.length > -1 ? '0'.repeat(p - s.length) + s : s;
}

function formatChapters(chapters, baseUrl) {
  const chaps = []

  if (Number.isInteger(chapters[0])) {
    for (let i = 1; i < chapters.length; i++) {
      const pages = [];
      chaps.push({
        title: `Chapter ${i}`,
        cover: zeroPad(chapters[i - 1], 3) + '.jpg',
        url: baseUrl,
        pages
      })

      for (let j = chapters[i - 1]; j < chapters[i]; j++) {
        pages.push(zeroPad(j, 3) + '.jpg')
      }
    }
  } else if (Array.isArray(chapters[0])) {
    for (let i = 1; i < chapters.length; i++) {
      chaps.push({
        title: `Chapter ${i}`,
        cover: chapters[i - 1][0],
        url: baseUrl,
        pages: chapters[i - 1]
      })
    }
  } else {
    const cover = baseUrl.indexOf('type') > -1 ? 'cover.jpg.tmp' : '001.jpg'
    for (const chap of chapters) {
      if (chap.type === 'directory') {
        chaps.push({
          title: chap.name,
          cover,
          url: baseUrl + chap.name + '/',
          pages: null
        })
      }
    }
  }

  return chaps
}

const BookContainer = {
  template: '#app-book-container',
  props: {
    bookId: String,
    chapterId: String
  },
  data () { return {
    libraryName: 'galleries',
    apiPrefix: '/comic/browse/',
    chaptersFile: 'chapters.json',
    chapters: null,
    thinPages: null,
    isFlipbook: false
  } },
  computed: {
    bookPrefix () {
      if (this.libraryName && this.bookId) {
        return this.apiPrefix + this.libraryName + '/' + this.bookId + '/'
      }
      return null
    },
    chapterIndex () {
      if (this.chapters && this.chapterId) {
        for (let i = 0; i < this.chapters.length; i++) {
          if (this.chapters[i].title === this.chapterId) {
            return i
          }
        }
      }
      return null
    },
    currChapter () {
      return this.chapterIndex !== null ? this.chapters[this.chapterIndex] : null
    },
    prevChapterUrl () {
      if (this.chapterIndex !== null && this.chapterIndex > 0) {
        return '../' + this.chapters[this.chapterIndex - 1].title + '/'
      }
      return ''
    },
    nextChapterUrl () {
      if (this.chapterIndex !== null && this.chapterIndex < this.chapters.length - 1) {
        return '../' + this.chapters[this.chapterIndex + 1].title + '/'
      }
      return ''
    },
    titleCrumbs () {
      return ['H', this.libraryName, this.bookId, this.chapterId].filter(title => title)
    }
  },
  created () {
    this.setPageTitle()
    this.fetchChapters()
  },
  watch: {
    titleCrumbs () { this.setPageTitle() },
    bookPrefix () { this.fetchChapters() },
    chapterIndex () { this.fetchPages() }
  },
  methods: {
    setPageTitle() {
      document.title = this.titleCrumbs.join(' - ')
    },
    fetchChapters () {
      if (this.bookPrefix) {
        fetch(this.bookPrefix + this.chaptersFile).then(res =>
          res.json()
        ).then(res => {
          this.thinPages = null
          this.isFlipbook = Array.isArray(res[0])
          this.chapters = formatChapters(res, this.bookPrefix)
        }).catch(err =>
          fetch(this.bookPrefix).then(res =>
            res.json()
          ).then(res => {
            this.thinPages = res[0].type === 'file' ? res.map(x => this.bookPrefix + x.name) : null
            this.isFlipbook = Array.isArray(res[0])
            this.chapters = formatChapters(res, this.bookPrefix)
          }).catch(err =>
            this.chapters = null
          )
        )
      } else {
        this.chapters = null
      }
    },
    fetchPages() {
      if (this.currChapter && !this.currChapter.pages) {
        fetch(this.bookPrefix + this.currChapter.title + '/').then(res =>
          res.json()
        ).then(res =>
          this.currChapter.pages = res.map(page => page.name)
        ).catch(err =>
          this.currChapter.pages = null
        )
      }
    }
  }
}
