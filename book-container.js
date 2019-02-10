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

const CrumbComponent = {
  template: '#app-crumbs',
  props: {
    crumbs: Array
  },
  computed: {
    crumbUrls () {
      return this.crumbs.map((label, i, labels) =>
        ({ label, url: '../'.repeat(labels.length - 1 - i) })
      )
    }
  }
}

const GalleryComponent = {
  template: '#app-gallery',
  props: {
    images: Array
  }
}

const BookContainer = {
  template: '#app-book-container',
  props: {
    libraryName: String,
    bookTitle: String,
    chapterTitle: String
  },
  data () { return {
    apiPrefix: '/comic/browse/',
    chaptersFile: 'chapters.json',
    chapters: null
  } },
  computed: {
    isFlipbook () {
      return this.libraryName === 'flip'
    },
    bookPrefix () {
      if (this.libraryName && this.bookTitle) {
        return this.apiPrefix + this.libraryName + '/' + this.bookTitle + '/'
      }
      return null
    },
    chapterIndex () {
      if (this.chapters && this.chapterTitle) {
        for (let i = 0; i < this.chapters.length; i++) {
          if (this.chapters[i].title === this.chapterTitle) {
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
      return ['H', this.libraryName, this.bookTitle, this.chapterTitle].filter(title => title)
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
        ).then(res =>
          this.chapters = formatChapters(res, this.bookPrefix)
        ).catch(err =>
          fetch(this.bookPrefix).then(res =>
            res.json()
          ).then(res =>
            this.chapters = formatChapters(res, this.bookPrefix)
          ).catch(err =>
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
