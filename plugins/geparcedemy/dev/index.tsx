import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { geparcedemyPlugin, GeparcedemyPage } from '../src/plugin';

createDevApp()
  .registerPlugin(geparcedemyPlugin)
  .addPage({
    element: <GeparcedemyPage />,
    title: 'Root Page',
    path: '/geparcedemy',
  })
  .render();
