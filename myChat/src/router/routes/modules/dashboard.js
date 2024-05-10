import { LAYOUT } from '@/router/constant'

const dashboard = {
  path: '/dashboard',
  name: 'Dashboard',
  component: LAYOUT,
  redirect: '/dashboard/home',
  children: [
    {
      path: 'home',
      name: 'Home',
      component: () => import('@/views/chat/Home.vue'),
    },
    {
      path: 'channel/:channelId/:roomId',
      name: 'Channel',
      component: () => import('@/views/chat/Channel.vue'),
    },
  ],
}

export default dashboard
