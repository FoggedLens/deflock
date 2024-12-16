import { createRouter, createWebHistory } from 'vue-router'
import Landing from '../views/Landing.vue'
import Map from '../views/Map.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (to.hash && !to.hash.startsWith('#map')) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: Landing
    },
    {
      path: '/map',
      name: 'map',
      component: Map
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/what-is-an-alpr',
      name: 'what-is-an-alpr',
      component: () => import('../views/WhatIsAnALPRView.vue')
    },
    {
      path: '/report',
      name: 'report',
      component: () => import('../views/ReportView.vue')
    },
    {
      path: '/operators',
      name: 'operators',
      component: () => import('../views/OperatorsView.vue')
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue')
    },
    {
      path: '/roadmap',
      name: 'roadmap',
      component: () => import('../views/RoadmapView.vue')
    },
    {
      path: '/legal',
      name: 'legal',
      component: () => import('../views/LegalView.vue')
    },
    {
      path: '/qr',
      name: 'qr-landing',
      component: () => import('../views/QRLandingView.vue')
    },
    {
      path: '/donate',
      name: 'donate',
      component: () => import('../views/Donate.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/404.vue')
    }
  ]
})

// backward compatibility with old url scheme
router.beforeEach((to, from, next) => {
  if (to.path === '/' && to.hash) {
    next({ path: '/map', hash: to.hash })
  } else {
    next()
  }
})

export default router
