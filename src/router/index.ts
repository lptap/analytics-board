import Vue from 'vue'
import VueRouter, {RouteConfig} from 'vue-router'
import Home from '@/views/home/home.vue';
import Admin from "@/views/admin/Admin.vue";
import FarmList from "@/views/admin/pages/FarmList.vue";
import NotFound from "@/views/404.vue";
import AddFarm from "@/views/admin/pages/AddFarm.vue";
import AddAutocompounder from "@/views/admin/pages/AddAutocompounder.vue";
import RouterWrapper from "@/components/shared/_common/router-wrapper/router-wrapper.vue";
import Analytics from "@/views/analytics/Analytics.vue";
import AnalyticsPairDetails from "@/views/analytics/AnalyticsPairDetails.vue";


Vue.use(VueRouter)

const routes: RouteConfig[] = [
  { path: '', redirect: 'home' },
  {
    path: '/home',
    name: 'true-home',
    component: Home
  },
  {
    path: '/analytics',
    component: RouterWrapper,
    children: [
      {
        path: '',
        name: 'anal-main',
        component: Analytics
      },
      {
        path: ':address/pair-details',
        name: 'anal-pair-details',
        component: AnalyticsPairDetails
      },
    ]
  },
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      const password = prompt('Admin password');
      if (password === 'neti!@#$') {
        next();
      } else {
        return false;
      }
    },
    children: [
      { path: '', redirect: 'farms' },
      {
        path: 'farms',
        component: RouterWrapper,
        children: [
          { path: '', redirect: 'list' },
          {
            path: 'list',
            name: 'admin-farms',
            component: FarmList,
          },
          {
            path: 'add',
            name: 'admin-farms-add',
            component: AddFarm,
          },
          {
            path: ':id/edit',
            name: 'admin-farms-edit',
            component: AddFarm,
          },
          {
            path: ':id/autocompounder/:aid?',
            name: 'admin-autocompounder',
            component: AddAutocompounder
          },
        ]
      },
    ]
  },
  {
    // will match everything
    path: '*',
    component: NotFound
  }
]

const router = new VueRouter({
  routes,
  mode: 'history'
})

export default router
