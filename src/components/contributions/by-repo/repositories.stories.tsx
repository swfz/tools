import React from 'react';

import { ComponentStory, ComponentMeta } from '@storybook/react';

import Repositories from './repositories';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'Repositories',
  component: Repositories,
} as ComponentMeta<typeof Repositories>;

//👇 We create a “template” of how args map to rendering
const Template: ComponentStory<typeof Repositories> = (args) => <Repositories {...args} />;

export const Display = Template.bind({});

Display.args = {
  repositories: [
    {
      id: 1,
      repo: {
        name: 'swfz/tools',
        url: 'https://github.com/swfz/tools',
      },
      created_at: '2022-10-02 10:00:00',
    },
    {
      id: 2,
      repo: {
        name: 'swfz/til',
        url: 'https://github.com/swfz/til',
      },
      created_at: '2022-10-03 10:00:00',
    },
  ],
  /*👇 The args you need here will depend on your component */
};
