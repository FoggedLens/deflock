import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuth0 } from '@auth0/auth0-vue';


const routeGuard = (to: any, from: any, next: any) => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  // code and state present when redirected from Auth0
  if (isAuthenticated.value || (to.query.code && to.query.state)) {
    next();
  } else {
    loginWithRedirect({
      appState: { targetUrl: to.fullPath }
    });
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
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
      path: '/upload',
      name: 'upload',
      component: () => import('../views/ReportPhoto.vue'),
      // beforeEnter: routeGuard
    },
    {
      path: '/dashboard',
      name: 'review',
      component: () => import('../views/Dashboard.vue'),
      beforeEnter: routeGuard
    }
  ]
})

router.beforeEach((to, from, next) => {
  console.log(`Navigating to ${to.fullPath} from ${from.fullPath}`);
  next();
});

export default router
