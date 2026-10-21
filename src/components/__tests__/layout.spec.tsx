import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMedia } from 'react-use';
import Layout from '../layout';

jest.mock('react-use', () => ({ useMedia: jest.fn() }));

const mockedUseMedia = useMedia as jest.MockedFunction<typeof useMedia>;

const renderLayout = () =>
  render(
    <Layout>
      <p>content</p>
    </Layout>,
  );

const sidebarLabel = () => screen.getByText('Picture in Piscture Timer');
// ハンバーガーアイコン(3 本線)がトグル。サイドバーのアイコンも同じ viewBox なので path で特定する
const toggleButton = (container: HTMLElement) =>
  container.querySelector('path[d="M4 6h16M4 12h16M4 18h16"]')?.closest('svg') as SVGElement;

describe('Layout', () => {
  afterEach(() => {
    mockedUseMedia.mockReset();
  });

  test('広い画面ではサイドバーを開いた状態で表示する', () => {
    mockedUseMedia.mockReturnValue(true);
    renderLayout();

    expect(sidebarLabel()).not.toHaveClass('hidden');
  });

  test('狭い画面ではサイドバーを閉じた状態で表示する', () => {
    mockedUseMedia.mockReturnValue(false);
    renderLayout();

    expect(sidebarLabel()).toHaveClass('hidden');
  });

  test('トグルで開閉を切り替えられる', async () => {
    mockedUseMedia.mockReturnValue(true);
    const { container } = renderLayout();

    await userEvent.click(toggleButton(container));
    expect(sidebarLabel()).toHaveClass('hidden');

    await userEvent.click(toggleButton(container));
    expect(sidebarLabel()).not.toHaveClass('hidden');
  });

  test('画面幅が切り替わると手動の開閉状態を捨てて幅に合わせる', async () => {
    mockedUseMedia.mockReturnValue(true);
    const { container, rerender } = renderLayout();

    await userEvent.click(toggleButton(container));
    expect(sidebarLabel()).toHaveClass('hidden');

    mockedUseMedia.mockReturnValue(false);
    rerender(
      <Layout>
        <p>content</p>
      </Layout>,
    );
    expect(sidebarLabel()).toHaveClass('hidden');

    mockedUseMedia.mockReturnValue(true);
    rerender(
      <Layout>
        <p>content</p>
      </Layout>,
    );
    expect(sidebarLabel()).not.toHaveClass('hidden');
  });
});
