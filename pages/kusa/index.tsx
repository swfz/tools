import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ChangeEvent, MouseEvent, useState, useEffect } from 'react';
import Head from 'next/head';

const KusaIndex: NextPage = () => {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [multiInputText, setMultiInputText] = useState('');
  const [usernames, setUsernames] = useState<string[]>([]);

  // URLからusersパラメータを取得してstateを初期化
  useEffect(() => {
    if (router.isReady) {
      const { users } = router.query;
      if (users && typeof users === 'string') {
        const urlUsernames = users.split(',').map(name => name.trim()).filter(name => name);
        setUsernames(urlUsernames);
      }
    }
  }, [router.isReady, router.query]);

  // usernamesが変更されたらURLを更新
  useEffect(() => {
    if (router.isReady) {
      const currentUsers = router.query.users as string;
      const newUsersParam = usernames.join(',');
      
      if (usernames.length === 0) {
        // ユーザーが0人の場合はusersパラメータを削除
        if (currentUsers) {
          router.replace('/kusa', undefined, { shallow: true });
        }
      } else if (currentUsers !== newUsersParam) {
        // ユーザーリストが変更された場合はURLを更新
        router.replace(`/kusa?users=${encodeURIComponent(newUsersParam)}`, undefined, { shallow: true });
      }
    }
  }, [usernames, router]);

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleMultiInput = (e: ChangeEvent<HTMLInputElement>) => {
    setMultiInputText(e.target.value);
  };

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    window.open(`/kusa/${inputText}`, '_blank');
  };

  const handleAddUsernames = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (multiInputText.trim()) {
      const names = multiInputText.split(',').map(name => name.trim()).filter(name => name);
      // 既存のユーザー名と重複しないものだけ追加
      const newNames = names.filter(name => !usernames.includes(name));
      setUsernames(prev => [...prev, ...newNames]);
      setMultiInputText('');
    }
  };

  const handleRemoveUser = (usernameToRemove: string) => {
    setUsernames(prev => prev.filter(name => name !== usernameToRemove));
  };

  const handleClearUsernames = () => {
    setUsernames([]);
  };

  return (
    <>
      <Head>
        <title>Kusa</title>
      </Head>
      <div className="divide-y divide-gray-300">
        <div>
          <h1 className="text-3xl">Kusa</h1>
        </div>
        
        {/* 個別ユーザー詳細表示セクション */}
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-3">📊 個別ユーザー詳細表示</h2>
          <div className="bg-blue-50 p-3 rounded mb-3">
            <p className="text-sm">GitHubユーザーの詳細な草情報（統計情報、イベント履歴など）を表示します</p>
            <p className="text-sm">OGP対応でSlackやTwitterでのシェアに最適化されています</p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <input
              className="block w-48 appearance-none rounded border border-gray-500 bg-white px-3 py-2 leading-none text-gray-700 focus:outline-none focus:border-blue-500"
              onChange={handleInput}
              value={inputText}
              type="text"
              placeholder="GitHub UserID"
            />
            <button
              className="items-center rounded border border-blue-500 bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              onClick={handleClick}
              disabled={!inputText.trim()}
            >
              詳細表示
            </button>
          </div>
        </div>

        {/* 複数ユーザー画像比較セクション */}
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-3">🖼️ 複数ユーザー画像比較</h2>
          <div className="bg-green-50 p-3 rounded mb-3">
            <p className="text-sm mb-1">複数のGitHubユーザーの草画像を並べて比較できます</p>
            <ul className="text-xs list-disc list-inside ml-2 space-y-1">
              <li><strong>一人ずつ追加</strong>: ユーザー名入力後「画像追加」をクリック</li>
              <li><strong>複数一括追加</strong>: 「user1,user2,user3」のようにカンマ区切りで入力</li>
            </ul>
          </div>
          <div className="flex flex-row items-center gap-2">
            <input
              className="block w-48 appearance-none rounded border border-gray-500 bg-white px-3 py-2 leading-none text-gray-700 focus:outline-none focus:border-green-500"
              onChange={handleMultiInput}
              value={multiInputText}
              type="text"
              placeholder="GitHub UserID (カンマ区切り可)"
            />
            <button
              className="items-center rounded border border-green-500 bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              onClick={handleAddUsernames}
              disabled={!multiInputText.trim()}
            >
              画像追加
            </button>
          </div>
          
          {/* 複数ユーザー画像表示エリア */}
          {usernames.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                  📈 {usernames.length}人のユーザーを表示中
                </span>
                <button
                  className="px-3 py-1 text-xs text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
                  onClick={handleClearUsernames}
                >
                  全てクリア
                </button>
              </div>
              <div className="grid gap-4">
                {usernames.map((username) => (
                  <div key={username} className="border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">
                        <a 
                          href={`https://github.com/${username}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          🧑‍💻 {username}
                        </a>
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRemoveUser(username)}
                          className="px-3 py-1 text-xs text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
                        >
                          削除
                        </button>
                        <a
                          href={`/kusa/${username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-xs text-blue-600 hover:underline border border-blue-300 rounded hover:bg-blue-50"
                        >
                          詳細表示
                        </a>
                      </div>
                    </div>
                    <img 
                      src={`https://kusa-image.deno.dev/${username}`} 
                      alt={`${username}'s GitHub Contributions`}
                      className="w-full max-w-4xl rounded border"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <p className="mt-4 text-xs text-gray-600">
            💡 コントリビューション画像は<a href="https://kusa-image.deno.dev/" className="text-blue-600 hover:underline">kusa-image</a>を使用しています
          </p>
        </div>
      </div>
    </>
  );
};

export default KusaIndex;
