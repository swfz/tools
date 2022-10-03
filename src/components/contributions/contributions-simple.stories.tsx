import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import ContributionsSimple from './contributions-simple';
import sampleResponse from '../../../sample-github-public-event.json';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'ContributionsSimple',
  component: ContributionsSimple,
} as ComponentMeta<typeof ContributionsSimple>;

//👇 We create a “template” of how args map to rendering
const Template: ComponentStory<typeof ContributionsSimple> = (args) => <ContributionsSimple {...args} />;

export const SimpleView = Template.bind({});

SimpleView.args = {
  result: sampleResponse,
};
