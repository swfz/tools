import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import ContributionsByRepo from './contributions-by-repo';
import sampleResponse from '../../../sample-github-public-event.json';

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: 'kusa/ContributionsByRepo',
  component: ContributionsByRepo,
} as ComponentMeta<typeof ContributionsByRepo>;

//👇 We create a “template” of how args map to rendering
const Template: ComponentStory<typeof ContributionsByRepo> = (args) => <ContributionsByRepo {...args} />;

export const View = Template.bind({});

View.args = {
  result: sampleResponse,
};
