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
  const generateDefaultItem = () => ({
    id: uuid(),
    name: 'sample',
    fill: '#3399EE',
    stroke: '#666666',
    textSize: 20,
    textColor: '#FFFFFF',
  });

  const initialItems = [...Array(3)].map(() => generateDefaultItem());
  const [items, setItems] = useState<Item[]>(initialItems);

  const handleAddButtonClick = (e: MouseEvent<HTMLElement>) => {
    setItems((prevItems) => {
      return [...prevItems, generateDefaultItem()];
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
  const topSideWidth = 150;
  const protrusionWidth = 30;
  const itemHeight = 200;
  const itemWidth = 160;

  return (
    <>
      <div>
        <p>よくあるこんな画像を作成するためのジェネレータ</p>
        <p>必要な数だけ項目を追加する</p>
        {items.map((item) => {
          return (
            <span key={item.id} className="flex flex-row">
              <label htmlFor="name">Name: </label>
              <input
                className="block w-32 appearance-none rounded border border-gray-500 bg-white px-1 py-0 leading-none text-gray-700 focus:outline-none"
                onChange={handleInput(item, 'name')}
                type="text"
                placeholder="Name"
                id="name"
              />
              <label htmlFor="fill">Fill: </label>
              <input onChange={handleInput(item, 'fill')} value={item.fill} type="color" id="fill" />
              <label htmlFor="stroke">Stroke: </label>
              <input onChange={handleInput(item, 'stroke')} value={item.stroke} type="color" id="stroke" />
              <label htmlFor="textColor">Text: </label>
              <input onChange={handleInput(item, 'textColor')} value={item.textColor} type="color" id="textColor" />
              <label htmlFor="textSize">Text Size: </label>
              <input onChange={handleInput(item, 'textSize')} type="number" value={item.textSize} id="textSize" />
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
          <svg xmlns="http://www.w3.org/2000/svg" width={1200} height={500}>
            <defs>
              <polygon
                id="first"
                points={`0,0 ${topSideWidth},0 ${topSideWidth + protrusionWidth},${
                  itemHeight / 2
                } ${topSideWidth},${itemHeight} 0,${itemHeight}`}
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
              const y = leftTopPadding + (itemHeight / 2);
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
