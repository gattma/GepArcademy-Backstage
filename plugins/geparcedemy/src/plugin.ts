import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const geparcedemyPlugin = createPlugin({
  id: 'geparcedemy',
  routes: {
    root: rootRouteRef,
  },
});

export const GeparcedemyPage = geparcedemyPlugin.provide(
  createRoutableExtension({
    name: 'GeparcedemyPage',
    component: () =>
      import('./components/GeparcedemyPage').then(m => m.GeparcedemyPage),
    mountPoint: rootRouteRef,
  }),
);
