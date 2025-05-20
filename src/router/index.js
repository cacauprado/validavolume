// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import TipoInsercao from '../components/TipoInsercao.vue'
import InsManual from '../components/InsManual.vue'
import InsTemplate from '../components/InsTemplate.vue'



const routes = [
  { path: '/', name: 'TipoInsercao', component: TipoInsercao },
  { path: '/tipoinsercao', name: 'TipoInsercao', component: TipoInsercao },
  { path: '/insermanual', name: 'InsManual', component: InsManual },
  { path: '/insertemplate', name: 'InsTemplate', component: InsTemplate },
  { path: '/:catchAll(.*)', name: 'NotFound', component: TipoInsercao }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
