import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { event as gaEvent } from '../../src/lib/gtag';

dayjs.extend(isBetween);

interface Item {
  id: string;
  name: string;
  start: string;
  end: string;
  remark: string;
}
type Column = 'name' | 'start' | 'end' | 'remark';

// timeline
// デフォルトで24時間分
// スタート時刻を入力の中から最善選べるようにする
// 分単位の切り替え 5,10,30

const Schedule: NextPage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const columns: Column[] = ['name', 'start', 'end', 'remark'];
  const [unit, setUnit] = useState(10);
  const units = [1, 5, 10, 30, 60];
  const times = [...Array((24 * 60) / unit)].map((_, i) => i);
  const [startTime, setStartTime] = useState();

  const sampleData: Item = {
    id: uuid(),
    name: 'SampleName',
    start: '01:00',
    end: '01:30',
    remark: 'Remark　　　　　　',
  };

  const addItem = () => {
    setItems((prevItems) => {
      return [...prevItems, { id: uuid(), name: '', start: '00:00', end: '00:00', remark: '' }];
    });
    gaEvent({
      action: 'add_row',
      category: 'timeline',
    });
  };

  const isBetween = (item: Item, time: number) => {
    const [startHour, startMin] = item.start.split(':').map((s) => parseInt(s));
    const [endHour, endMin] = item.end.split(':').map((s) => parseInt(s));
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

  const handleUnitChange = (event: any) => {
    setUnit(event.target.value);
    gaEvent({
      action: 'change_unit',
      category: 'timeline',
      value: event.target.value,
    });
  };

  return (
    <>
      <Head>
        <title>Hourly Timeline Editor</title>
      </Head>
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
          <div>
            <span>単位時間(分)</span>
            <select className="py-0 pr-8 rounded" value={unit} onChange={handleUnitChange}>
              {units.map((u) => {
                return (
                  <option key={u} value={u}>
                    {u.toString().padStart(2, '0')}
                  </option>
                );
              })}
            </select>
          </div>
          <table className="border-2">
            <thead>
              <tr className="flex flex-row">
                {columns.map((column) => {
                  return (
                    <td className={column} key={column}>
                      {column}
                    </td>
                  );
                })}
                <td className="whitespace-nowrap">timeline(hour)</td>
              </tr>
              <tr className="flex flex-row border-2">
                {columns.map((column) => {
                  const className = `data-${column}`;
                  return (
                    <td className={className} key={column}>
                      {sampleData[column]}
                    </td>
                  );
                })}
                <td className="whitespace-nowrap">
                  {times.map((t) => {
                    if (t % (60 / unit) === 0) {
                      return (
                        <div key={t} className="inline-block w-5 font-bold">
                          {t / (60 / unit)}
                        </div>
                      );
                    } else {
                      return (
                        <div key={t} className="inline-block w-5 text-xs">
                          {(t % (60 / unit)) * unit}
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
                  <tr className="flex flex-row" key={item.id}>
                    {columns.map((column) => {
                      const inputClassName = `input-${column}`;
                      return (
                        <td className={column} key={column}>
                          <input
                            className={inputClassName}
                            key={column}
                            type="text"
                            onChange={fixHandleInput(item, column)}
                            value={item[column]}
                            placeholder={sampleData[column]}
                          />
                        </td>
                      );
                    })}
                    <td className="whitespace-nowrap">
                      {times.map((t) => {
                        return (
                          <span key={t} className="inline-block w-5">
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
            className="flex sticky left-0 items-center py-2 px-4 mx-1 font-semibold text-gray-800 bg-white hover:bg-gray-100 rounded border border-gray-400 shadow"
            onClick={addItem}
          >
            +
          </button>
        </div>
      </div>
    </>
  );
};

export default Schedule;
