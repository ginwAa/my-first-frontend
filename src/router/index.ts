import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/UserList.vue'
import Login from '../views/Login.vue'
import Test from '../views/HomeView.vue'
import { useUserStore } from '@/stores/userStore.ts'



const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/userList',
      name: 'userList',
      component: Home
    },
    {
      path: '/test',
      name: 'test',
      component: Test
    },
  ]
})

router.beforeResolve(async (to, from, next) => {
  if (localStorage.getItem('role') === null && to.path !== '/login') {
    next('/login');
  } else if (localStorage.getItem('role') !== null && to.path === '/login') {
    next('/userList');
  } else {
    next();
  }
});

export default router
