import type { NextPage } from 'next';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

interface Item {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  remark: string;
}
type Column = 'name' | 'startTime' | 'endTime' | 'remark';

// timeline
// デフォルトで24時間分
// スタート時刻を入力の中から最善選べるようにする
// 分単位の切り替え 5,10,30

const Schedule: NextPage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const columns: Column[] = ['name', 'startTime', 'endTime', 'remark'];
  const unit = 10;
  const times = [...Array((24 * 60) / unit)].map((_, i) => i);
  const [startTime, setStartTime] = useState();

  const sample: Item = {
    id: uuid(),
    name: 'sampleData',
    startTime: '01:00',
    endTime: '01:30',
    remark: 'Sample Remark',
  };

  const addItem = () => {
    setItems((prevItems) => {
      return [...prevItems, { id: uuid(), name: '', startTime: '00:00', endTime: '00:00', remark: '' }];
    });
  };

  const isBetween = (item: Item, time: number) => {
    const [startHour, startMin] = item.startTime.split(':').map((s) => parseInt(s));
    const [endHour, endMin] = item.endTime.split(':').map((s) => parseInt(s));
    const start = dayjs().hour(startHour).minute(startMin);
    const end = dayjs().hour(endHour).minute(endMin);

    const hour = Math.floor((time * unit) / 60);
    const min = (time * unit) % 60;

    const targetDay = dayjs().hour(hour).minute(min);

    return targetDay.isBetween(start, end, null, '[)') ? '■' : '□';
  };

  const fixHandleInput = (targetItem: Item, column: Column) => {
    return (event: any) => {
      setItems((beforeItems) => {
        const newItems = beforeItems.reduce((acc: Item[], i: Item) => {
          const newItem = i.id === targetItem.id ? { ...i, [column]: event?.target?.value } : i;

          return [...acc, newItem];
        }, []);

        return newItems;
      });
    };
  };

  return (
    <div className="divide-y divide-gray-300">
      <div>
        <h1 className="text-3xl">Hourly Timeline Editor</h1>
      </div>
      <div className="p-3">
        <div>
          <div>時間単位でのタイムラインを可視化するフォーム</div>
          <div>分、時間単位で何が起こっていてどういう順番なのかを整理するのを効率化するためのページ</div>
        </div>
      </div>
      <div>
        <table className="border-2">
          <thead>
            <tr className="border-2">
              {columns.map((column) => {
                return (
                  <td className={column} key={column}>
                    {column}
                  </td>
                );
              })}
              <td className="whitespace-nowrap">timeline(hour)</td>
            </tr>
            <tr className="border-2">
              {columns.map((column) => {
                return (
                  <td className="text-gray-700 bg-gray-200" key={column}>
                    {sample[column]}
                  </td>
                );
              })}
              <td className="whitespace-nowrap">
                {times.map((t) => {
                  if (t % (60 / unit) === 0) {
                    return (
                      <div key={t} className="inline-block w-4">
                        {t / (60 / unit)}
                      </div>
                    );
                  } else {
                    return (
                      <div key={t} className="inline-block w-4">
                        -
                      </div>
                    );
                  }
                })}
              </td>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              return (
                <tr key={item.id}>
                  {columns.map((column) => {
                    return (
                      <td className={column} key={column}>
                        <input key={column} type="text" onChange={fixHandleInput(item, column)} value={item[column]} />
                      </td>
                    );
                  })}
                  <td className="whitespace-nowrap">
                    {times.map((t) => {
                      return (
                        <span key={t} className="inline-block w-4">
                          {isBetween(item, t)}
                        </span>
                      );
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <button
          className="flex items-center py-2 px-4 mx-1 font-semibold text-gray-800 bg-white hover:bg-gray-100 rounded border border-gray-400 shadow"
          onClick={addItem}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default Schedule;
