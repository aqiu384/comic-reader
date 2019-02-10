const HomeComponent = { template: '#app-home' }
const NotFoundComponent = { template: '<div>404 not found</div>' }

Vue.component('app-flipbook', FlipbookComponent)
Vue.component('app-gallery', GalleryComponent)
Vue.component('app-crumbs', CrumbComponent)

const routes = [
  { path: '/:libraryName/:bookTitle/:chapterTitle?', component: BookContainer, props: true },
  { path: '/:libraryName', component: LibraryContainer, props: true },
  { path: '/', component: HomeComponent },
  { path: '*', component: NotFoundComponent }
]

const router = new VueRouter({
  base: '/comic/reader',
  mode: 'history',
  routes,
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})
const app = new Vue({ router }).$mount('#app')
