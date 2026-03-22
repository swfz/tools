import { toHtmlUrl } from '../to-html-url';

describe('toHtmlUrl', () => {
  test('API URLをGitHub URLに変換する', () => {
    expect(toHtmlUrl('https://api.github.com/repos/swfz/tools')).toBe('https://github.com/swfz/tools');
  });

  test('api.github.com/reposを含まないURLはそのまま返る', () => {
    expect(toHtmlUrl('https://example.com/path')).toBe('https://example.com/path');
  });

  test('空文字の場合そのまま返る', () => {
    expect(toHtmlUrl('')).toBe('');
  });

  test('最初のマッチのみ置換する', () => {
    const url = 'https://api.github.com/repos/user/api.github.com/repos';
    expect(toHtmlUrl(url)).toBe('https://github.com/user/api.github.com/repos');
  });
});
