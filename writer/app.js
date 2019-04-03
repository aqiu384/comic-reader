const NotFoundComponent = { template: '<div>404 not found</div>' }

Vue.component('app-text-detector', TextDetectorComponent)

const routes = [
  { path: '/', component: PageContainer, props: true },
  { path: '*', component: NotFoundComponent }
]

const router = new VueRouter({
  base: '/comic/writer',
  mode: 'history',
  routes
})
const app = new Vue({ router }).$mount('#app')
