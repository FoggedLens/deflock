import { createRouter, createWebHistory } from 'vue-router'
import Landing from '../views/Landing.vue'
import Map from '../views/Map.vue'
import { useHead } from '@unhead/vue'

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
      component: Landing,
      meta: {
        title: 'Find Nearby ALPRs | DeFlock'
      }
    },
    {
      path: '/map',
      name: 'map',
      component: Map,
      meta: {
        title: 'ALPR Map | DeFlock'
      }
    },
    {
      path: '/groups',
      name: 'groups',
      component: () => import('../views/Groups.vue'),
      meta: {
        title: 'Local Groups | DeFlock'
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: {
        title: 'About | DeFlock'
      }
    },
    {
      path: '/what-is-an-alpr',
      name: 'what-is-an-alpr',
      component: () => import('../views/WhatIsAnALPRView.vue'),
      meta: {
        title: 'Learn | DeFlock'
      }
    },
    {
      path: '/report',
      name: 'report',
      component: () => import('../views/ReportChoose.vue'),
      meta: {
        title: 'Submit Cameras | DeFlock'
      }
    },
    {
      path: '/report/id',
      name: 'reportID',
      component: () => import('../views/ReportID.vue'),
      meta: {
        title: 'Submit Cameras | DeFlock'
      }
    },
    {
      path: '/council',
      name: 'council',
      component: () => import('../views/CouncilView.vue'),
      meta: {
        title: 'Council | DeFlock'
      }
    },
    {
      path: '/app',
      name: 'app',
      component: () => import('../views/DeflockApp.vue'),
      meta: {
        title: 'App | DeFlock'
      }
    },
    {
      path: '/app/docs',
      name: 'app-docs',
      component: () => import('../views/DeflockAppDocs.vue'),
      meta: {
        title: 'App User Guide | DeFlock'
      }
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue'),
      meta: {
        title: 'Contact | DeFlock'
      }
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('../views/TermsOfService.vue'),
      meta: {
        title: 'Terms of Service | DeFlock'
      }
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('../views/PrivacyPolicy.vue'),
      meta: {
        title: 'Privacy Policy | DeFlock'
      }
    },
    {
      path: '/qr',
      name: 'qr-landing',
      component: () => import('../views/Landing.vue'),
      meta: {
        title: 'You Found an ALPR | DeFlock'
      }
    },
    {
      path: '/donate',
      name: 'donate',
      component: () => import('../views/Donate.vue'),
      meta: {
        title: 'Donate | DeFlock'
      }
    },
    {
      path: '/foia',
      name: 'foia',
      component: () => import('../views/FOIA.vue'),
      meta: {
        title: 'How to Request Public Records | DeFlock'
      }
    },
    {
      path: '/identify',
      name: 'identify',
      component: () => import('../views/Identify.vue'),
      meta: {
        title: 'Identify ALPRs | DeFlock'
      }
    },
    {
      path: '/press',
      name: 'press',
      component: () => import('../views/Press.vue'),
      meta: {
        title: 'Press | DeFlock'
      }
    },
    {
      path: '/store',
      name: 'store',
      component: () => import('../views/Store.vue'),
      meta: {
        title: 'Store | DeFlock'
      }
    },
    {
      path: '/blog',
      name: 'blog',
      component: () => import('../views/Blog.vue'),
      meta: {
        title: 'News | DeFlock'
      }
    },
    {
      path: '/blog/:id',
      name: 'blog-post',
      component: () => import('../views/BlogPost.vue'),
      meta: {
        title: 'Blog Post | DeFlock'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/404.vue'),
      meta: {
        title: 'Not Found | DeFlock'
      }
    }
  ]
})

// backward compatibility with old url scheme
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    useHead({
      title: to.meta.title
    })
  }
  
  if (to.path === '/' && to.hash) {
    next({ path: '/map', hash: to.hash })
  } else {
    next()
  }
})

export default router
