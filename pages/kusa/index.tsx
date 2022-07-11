import type { NextPage } from 'next';

const KusaIndex: NextPage = () => {
  return (
    <>
      <div>
        <p>Slackで展開すると草状況が閲覧できる</p>
        <p>"/kusa/[username]"でアクセスしてください</p>
      </div>
    </>
  );
};

export default KusaIndex;
