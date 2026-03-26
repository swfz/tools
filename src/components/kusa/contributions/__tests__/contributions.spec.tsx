import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Contributions from '../contributions';
import { createPushEvent, createPullRequestEvent, createWatchEvent } from './fixtures';
import { SearchData } from '../types';

const emptySearchData: SearchData = { pullRequests: [], commits: [], issues: [] };

describe('Contributions', () => {
  const defaultProps = {
    events: [createWatchEvent()],
    searchData: emptySearchData,
    username: 'testuser',
  };

  test('ユーザー名が表示される', () => {
    render(<Contributions {...defaultProps} />);
    expect(screen.getByText(/Recent testuser Events/)).toBeInTheDocument();
  });

  test('Simple Listタブがデフォルトでアクティブ', () => {
    render(<Contributions {...defaultProps} />);
    const buttons = screen.getAllByRole('button');
    const simpleButton = buttons.find((b) => b.textContent === 'Simple List');
    expect(simpleButton).toHaveClass('border-b-2');
  });

  test('Group By Repoタブをクリックするとタブが切り替わる', async () => {
    const user = userEvent.setup();
    render(<Contributions {...defaultProps} />);

    const repoTab = screen.getByText('Group By Repo');
    await user.click(repoTab);

    expect(repoTab).toHaveClass('border-b-2');
  });

  test('excludeチェックボックスが表示される', () => {
    render(<Contributions {...defaultProps} />);
    expect(screen.getByLabelText(/Exclude events related dependencies update/)).toBeInTheDocument();
  });

  test('空配列でクラッシュしない', () => {
    expect(() => render(<Contributions events={[]} searchData={emptySearchData} username="testuser" />)).not.toThrow();
  });
});
