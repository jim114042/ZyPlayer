import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/film',
    name: 'film',
    redirect: '/film/index',
    component: Layout,
    meta: { title: '首页', icon: 'home' },
    children: [
      {
        path: 'index',
        name: 'FilmIndex',
        component: () => import('@/pages/Film.vue'),
        meta: { title: '首页', icon: 'home' },
      },
      {
        path: 'detail',
        name: 'DetailIndex',
        component: () => import('@/pages/film/detail/Detail.vue'),
        meta: { title: '详情', icon: 'laptop' },
      },
    ],
  },
  {
    path: '/iptv',
    name: 'iptv',
    redirect: '/iptv/index',
    component: Layout,
    meta: { title: '直播', icon: 'laptop' },
    children: [
      {
        path: 'index',
        name: 'IptvIndex',
        component: () => import('@/pages/Iptv.vue'),
        meta: { title: '直播', icon: 'laptop' },
      },
    ],
  },
  {
    path: '/play/',
    name: 'play',
    redirect: '/play/index',
    meta: { title: '播放', icon: 'play-circle-stroke', hidden: true },
    children: [
      {
        path: 'index',
        name: 'PlayIndex',
        component: () => import('@/pages/Play.vue'),
        meta: { title: '播放', icon: 'play-circle-stroke' },
      },
    ],
  },
  {
    path: '/analysis/',
    name: 'analysis',
    redirect: '/analysis/index',
    component: Layout,
    meta: { title: '解析', icon: 'chart-bubble' },
    children: [
      {
        path: 'index',
        name: 'AnalysisIndex',
        component: () => import('@/pages/Analysis.vue'),
        meta: { title: '解析', icon: 'chart-bubble' },
      },
    ],
  },
  {
    path: '/chase',
    name: 'Chase',
    redirect: '/chase/index',
    component: Layout,
    meta: { title: '历史', icon: 'time' },
    children: [
      {
        path: 'index',
        name: 'ChaseIndex',
        component: () => import('@/pages/Chase.vue'),
        meta: { title: '历史', icon: 'time' },
      },
    ],
  },
  {
    path: '/setting',
    name: 'setting',
    component: Layout,
    redirect: '/setting/index',
    meta: { title: '设置', icon: 'setting' },
    children: [
      {
        path: 'index',
        name: 'SettingIndex',
        component: () => import('@/pages/Setting.vue'),
        meta: { title: '设置', icon: 'setting' },
      },
    ],
  },
  {
    path: '/test',
    name: 'test',
    component: Layout,
    redirect: '/test/index',
    meta: { title: '测试', icon: 'setting', hidden: true },
    children: [
      {
        path: 'index',
        name: 'TestIndex',
        component: () => import('@/pages/Test.vue'),
        meta: { title: '设置', icon: 'setting' },
      },
    ],
  },
];
