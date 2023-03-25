import { toGrassGraphImageUrl } from '../to-grass-graph-image-url';

describe('toGrassGraphImageUrl', () => {
  test('check to convert to grass graph image url', () => {
    expect(toGrassGraphImageUrl('swfz')).toBe('https://grass-graph.appspot.com/images/swfz.png');
  });
});
