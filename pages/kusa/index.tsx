import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ChangeEvent, MouseEvent, useState } from 'react';

const KusaIndex: NextPage = () => {
  const router = useRouter();
  const [inputText, setInputText] = useState('');

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    router.push(`/kusa/${inputText}`);
  };

  return (
    <>
      <div>
        <p>OGPによりSlackやTwitterでURLをシェアするとGitHubの草状況が閲覧できる</p>
        <p>`/kusa/[username]`でアクセスしてください</p>
        <span className="flex flex-row">
          <input
            className="block w-32 appearance-none rounded border border-gray-500 bg-white px-1 py-0 leading-none text-gray-700 focus:outline-none"
            onChange={handleInput}
            type="text"
            placeholder="GitHub UserID"
          />
          <button
            className="mx-1 items-center rounded-sm border border-gray-400 bg-white py-2 px-4 text-gray-800 hover:bg-gray-100"
            onClick={handleClick}
          >
            View
          </button>
        </span>
        <p>
          コントリビューション画像は<a href="https://grass-graph.appspot.com/">grass-graph</a>を使わせてもらっています
        </p>
      </div>
    </>
  );
};

export default KusaIndex;
