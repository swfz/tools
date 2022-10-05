import type { NextPage } from 'next';
import { v4 as uuid } from 'uuid';
import { MouseEvent, useState } from 'react';

interface Item {
  id: string;
  name: string;
  fill: string;
  stroke: string;
  textSize: number;
  textColor: string;
}

const ArrowFlowGenerator: NextPage = () => {
  const defaultItem = {
    id: uuid(),
    name: '',
    fill: '#3399EE',
    stroke: '#666666',
    textSize: 20,
    textColor: '#FFFFFF',
  }
  const initialItems = [...Array(3)].map(() => defaultItem);
  const [items, setItems] = useState<Item[]>(initialItems);

  const handleAddButtonClick = (e: MouseEvent<HTMLElement>) => {
    setItems((prevItems) => {
      return [
        ...prevItems,
        defaultItem,
      ];
    });
  };

  const handleInput = (targetItem: Item, column: string) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setItems((beforeItems) => {
        const newItems = beforeItems.reduce((acc: Item[], item: Item) => {
          const newItem = item.id === targetItem.id ? { ...item, [column]: event?.target?.value } : item;

          return [...acc, newItem];
        }, []);

        return newItems;
      });
    };
  };

  const leftTopPadding = 10;
  const topSideWidth = 100;
  const protrusionWidth = 30;
  const itemHeight = 200;
  const itemWidth = 110;

  return (
    <>
      <div>
        <p>よくあるこんな画像を作成するためのジェネレータ</p>
        <p>必要な数だけ項目を追加する</p>
        {items.map((item) => {
          return (
            <span>
              <input
                key={item.id}
                className="block w-32 appearance-none rounded border border-gray-500 bg-white px-1 py-0 leading-none text-gray-700 focus:outline-none"
                onChange={handleInput(item, 'name')}
                type="text"
                placeholder="Name"
              />
              <input onChange={handleInput(item, 'fill')} value={item.fill} type="color" />
              <input onChange={handleInput(item, 'stroke')} value={item.stroke} type="color" />
              <input onChange={handleInput(item, 'textColor')} value={item.textColor} type="color" />
              <input onChange={handleInput(item, 'textSize')} type="number" value={item.textSize} />
            </span>
          );
        })}
        <span className="flex flex-row">
          <button
            className="mx-1 items-center rounded-sm border border-gray-400 bg-white py-2 px-4 text-gray-800 hover:bg-gray-100"
            onClick={handleAddButtonClick}
          >
            Add
          </button>
        </span>
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" width={800} height={500}>
            <defs>
              <polygon
                id="first"
                points={`0,0 ${topSideWidth},0 ${
                  topSideWidth + protrusionWidth
                },${topSideWidth} ${topSideWidth},${itemHeight} 0,${itemHeight}`}
                strokeWidth="3"
              />
              <polygon
                id="middle"
                points={`0,0 ${topSideWidth},0 ${topSideWidth + protrusionWidth},${
                  itemHeight / 2
                } ${topSideWidth},${itemHeight} 0,${itemHeight} ${protrusionWidth},${itemHeight / 2}`}
                strokeWidth="3"
              />
              <polygon
                id="last"
                points={`0,0 ${topSideWidth + protrusionWidth},0 ${
                  topSideWidth + protrusionWidth
                },${itemHeight} 0,${itemHeight} ${protrusionWidth},${itemHeight / 2}`}
                strokeWidth="3"
              />
            </defs>
            {items.map((item, i) => {
              console.log(item);
              const x = leftTopPadding + i * itemWidth;
              const y = leftTopPadding;
              const href = i === 0 ? '#first' : i === items.length - 1 ? '#last' : '#middle';
              return <use key={item.id} x={x} y={y} xlinkHref={href} fill={item.fill} stroke={item.stroke}></use>;
            })}

            {items.map((item, i) => {
              const x =
                i === 0 ? leftTopPadding + 10 + i * itemWidth : leftTopPadding + 10 + i * itemWidth + protrusionWidth;
              const y = (leftTopPadding + itemHeight) / 2;
              return (
                <text key={item.id} x={x} y={y} fontFamily="sans-serif" fontSize={item.textSize} fill={item.textColor}>
                  {item.name}
                </text>
              );
            })}
          </svg>
        </div>
      </div>
    </>
  );
};

export default ArrowFlowGenerator;
