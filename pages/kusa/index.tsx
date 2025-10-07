import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ChangeEvent, MouseEvent, useState } from 'react';
import Head from 'next/head';

const KusaIndex: NextPage = () => {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [usernames, setUsernames] = useState<string[]>([]);

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    router.push(`/kusa/${inputText}`);
  };

  const handleAddUsernames = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if (inputText.trim()) {
      const names = inputText.split(',').map(name => name.trim()).filter(name => name);
      // 既存のユーザー名と重複しないものだけ追加
      const newNames = names.filter(name => !usernames.includes(name));
      setUsernames(prev => [...prev, ...newNames]);
      setInputText('');
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
        <div className="p-3">
          <p>OGPによりSlackやTwitterでURLをシェアするとGitHubの草状況が閲覧できる</p>
          <p>`/kusa/[username]`でアクセスしてください</p>
          <p>複数ユーザーの画像を表示する場合：</p>
          <ul className="list-disc list-inside ml-4 text-sm">
            <li>一人ずつ追加：ユーザー名入力後「Add Images」をクリック</li>
            <li>複数一括追加：「user1,user2,user3」のようにカンマ区切りで入力</li>
          </ul>
        </div>
        <div>
          <span className="flex flex-row">
            <input
              className="block w-48 appearance-none rounded border border-gray-500 bg-white px-1 py-0 leading-none text-gray-700 focus:outline-none"
              onChange={handleInput}
              value={inputText}
              type="text"
              placeholder="GitHub UserID (comma separated for multiple)"
            />
            <button
              className="mx-1 items-center rounded-sm border border-gray-400 bg-white px-4 py-2 text-gray-800 hover:bg-gray-100"
              onClick={handleClick}
            >
              View
            </button>
            <button
              className="mx-1 items-center rounded-sm border border-blue-400 bg-blue-50 px-4 py-2 text-blue-800 hover:bg-blue-100"
              onClick={handleAddUsernames}
            >
              Add Images
            </button>
          </span>
          {usernames.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Showing {usernames.length} user(s):</span>
                <button
                  className="px-2 py-1 text-xs text-red-600 hover:text-red-800"
                  onClick={handleClearUsernames}
                >
                  Clear All
                </button>
              </div>
              <div className="grid gap-4">
                {usernames.map((username) => (
                  <div key={username} className="border border-gray-200 rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">
                        <a 
                          href={`https://github.com/${username}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {username}
                        </a>
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRemoveUser(username)}
                          className="px-2 py-1 text-xs text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
                        >
                          Remove
                        </button>
                        <a
                          href={`/kusa/${username}`}
                          className="px-2 py-1 text-xs text-blue-600 hover:underline border border-blue-300 rounded hover:bg-blue-50"
                        >
                          View Details
                        </a>
                      </div>
                    </div>
                    <img 
                      src={`https://kusa-image.deno.dev/${username}`} 
                      alt={`${username}'s GitHub Contributions`}
                      className="w-full max-w-2xl"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="mt-2">
            コントリビューション画像は<a href="https://kusa-image.deno.dev/">kusa-image</a>を使っています
          </p>
        </div>
      </div>
    </>
  );
};

export default KusaIndex;
