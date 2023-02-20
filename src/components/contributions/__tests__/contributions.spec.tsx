import { toHtmlUrl } from '../contributions';

describe('toHtmlUrl', () => {
  test('check replace', () => {
    expect(toHtmlUrl("https://api.github.com/repos/swfz/tools")).toBe("https://github.com/swfz/tools")
  });
});

