import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../layout/Layout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/Login.vue')
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/Dashboard.vue'),
        meta: { title: '仪表盘' }
      },
      {
        path: 'article',
        name: 'Article',
        component: () => import('../views/article/ArticleList.vue'),
        meta: { title: '文章管理' }
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('../views/user/UserList.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'category',
        name: 'Category',
        component: () => import('../views/category/CategoryList.vue'),
        meta: { title: '分类管理' }
      },
      {
        path: 'tag',
        name: 'Tag',
        component: () => import('../views/tag/TagList.vue'),
        meta: { title: '标签管理' }
      },
      {
        path: 'message',
        name: 'Message',
        component: () => import('../views/message/MessageList.vue'),
        meta: { title: '系统消息' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router