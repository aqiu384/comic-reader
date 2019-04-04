const NotFoundComponent = { template: '<div>404 not found</div>' }

const GalleryComponent = {
  template: '#app-gallery',
  props: {
    images: Array
  }
}
const BookListComponent = {
  template: '#app-book-list',
  props: { books: Array }
}

Vue.component('app-gallery', GalleryComponent)
Vue.component('app-flipbook', FlipbookComponent)
Vue.component('app-book-list', BookListComponent)
Vue.component('app-book-search', BookSearchComponent)

const routes = [
  {
    path: '/',
    component: LibraryContainer,
    props: true,
    children: [
      { path: '/:bookId/:chapterId?', component: BookContainer, props: true }
    ]
  },
  { path: '*', component: NotFoundComponent }
]

const router = new VueRouter({
  base: '/comic/reader',
  mode: 'history',
  routes
})
const app = new Vue({ router }).$mount('#app')
