import type { NextPage } from 'next';

const KusaIndex: NextPage = () => {
  return (
    <>
      <div>
        <p>Slackで展開すると草状況が閲覧できる</p>
        <p>`/kusa/[username]`でアクセスしてください</p>
        <p>
          コントリビューション画像は<a href="https://grass-graph.appspot.com/">grass-graph</a>を使わせてもらっています
        </p>
      </div>
    </>
  );
};

export default KusaIndex;
