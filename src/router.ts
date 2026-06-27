import { createRouter, createWebHistory } from 'vue-router'

import ChecklistPage from './pages/ChecklistPage.vue'
import HouseManagerPage from './pages/HouseManagerPage.vue'
import { hasSelectedHouse } from './stores/houses'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/houses'
    },
    {
      path: '/houses',
      name: 'houses',
      component: HouseManagerPage
    },
    {
      path: '/checklist',
      name: 'checklist',
      component: ChecklistPage,
      meta: {
        requiresSelectedHouse: true
      }
    }
  ]
})

router.beforeEach((to) => {
  if (to.meta.requiresSelectedHouse && !hasSelectedHouse.value) {
    return { name: 'houses' }
  }

  return true
})

export default router
