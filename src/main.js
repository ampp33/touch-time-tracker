import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue'
import MainApp from './components/App.vue'
import Admin from './components/Admin.vue'

const routes = [
  { path: '/', component: MainApp },
  { path: '/admin', component: Admin }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

createApp(App).use(router).mount('#app');



