import type { NextPage } from 'next';
import { v4 as uuid } from 'uuid';
import { MouseEvent, useState, useRef } from 'react';

interface Item {
  id: string;
  text: string;
  fill: string;
  stroke: string;
  textSize: number;
  textColor: string;
}
interface Size {
  width: number;
  height: number;
}

const InputItem = ({
  item,
  handleInput,
}: {
  item: Item;
  handleInput: (targetItem: Item, column: string) => (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <span key={item.id} className="flex flex-row py-1 odd:bg-slate-100">
      <label className="ml-2 font-bold text-gray-700" htmlFor="text">
        Text:{' '}
      </label>
      <input
        className="block h-6 w-32 appearance-none border border-gray-500 bg-white px-1 py-0 leading-none text-gray-700 focus:outline-none"
        onChange={handleInput(item, 'text')}
        type="text"
        placeholder="Text"
        id="text"
      />
      <label className="ml-2 font-bold text-gray-700" htmlFor="fill">
        Fill:{' '}
      </label>
      <input onChange={handleInput(item, 'fill')} value={item.fill} type="color" id="fill" />
      <label className="ml-2 font-bold text-gray-700" htmlFor="stroke">
        Stroke:{' '}
      </label>
      <input onChange={handleInput(item, 'stroke')} value={item.stroke} type="color" id="stroke" />
      <label className="ml-2 font-bold text-gray-700" htmlFor="textColor">
        Text Color:{' '}
      </label>
      <input onChange={handleInput(item, 'textColor')} value={item.textColor} type="color" id="textColor" />
      <label className="ml-2 font-bold text-gray-700" htmlFor="textSize">
        Text Size:{' '}
      </label>
      <input
        className="block h-6 w-16 appearance-none border border-gray-500 bg-white leading-none text-gray-700 focus:outline-none"
        onChange={handleInput(item, 'textSize')}
        type="number"
        value={item.textSize}
        id="textSize"
      />
    </span>
  );
};

const ArrowFlowGenerator: NextPage = () => {
  const generateDefaultItem = () => ({
    id: uuid(),
    text: 'sample',
    fill: '#3399EE',
    stroke: '#666666',
    textSize: 20,
    textColor: '#FFFFFF',
  });

  const initialItems = [...Array(3)].map(() => generateDefaultItem());
  const [items, setItems] = useState<Item[]>(initialItems);
  const [batch, setBatch] = useState<Item>(generateDefaultItem());
  const svgRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size>({ width: 800, height: 300 });

  const handleAddButtonClick = (e: MouseEvent<HTMLElement>) => {
    setItems((prevItems) => {
      return [...prevItems, generateDefaultItem()];
    });
  };

  const handleAllInput = (batchItem: Item, column: string) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setBatch({ ...batchItem, [column]: event?.target?.value });

      setItems((beforeItems) => {
        return beforeItems.map((item) => ({ ...item, [column]: event?.target?.value }));
      });
    };
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

  const handleSize = (propName: string) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setSize((prev) => ({ ...prev, [propName]: event.target.value }));
    };
  };

  const handleDownload = () => {
    if (svgRef.current) {
      const buffer = Buffer.from(svgRef.current?.innerHTML);
      const blob = new Blob([buffer], { type: 'image/svg+xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'arrow-flow.svg';
      a.click();
      a.remove();
    }
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
        <p>必要な数だけ項目を追加してください</p>

        <button
          className="mx-1 items-center rounded-sm border border-gray-400 bg-white py-2 px-4 text-gray-800 hover:bg-gray-100"
          onClick={handleAddButtonClick}
        >
          +Add Item
        </button>

        <button
          className="mx-1 items-center rounded-sm border border-gray-400 bg-white py-2 px-4 text-gray-800 hover:bg-gray-100"
          onClick={handleDownload}
        >
          Download
        </button>

        <div className="flwx-row flex">
          <label className="ml-2 font-bold text-gray-700" htmlFor="width">
            Width:
          </label>
          <input
            className="block h-6 w-32 appearance-none border border-gray-500 bg-white px-1 py-0 leading-none text-gray-700 focus:outline-none"
            onChange={handleSize('width')}
            value={size.width}
            type="number"
            placeholder="SVG Width"
            id="width"
          />
          <label className="ml-2 font-bold text-gray-700" htmlFor="height">
            Height:
          </label>
          <input
            className="block h-6 w-32 appearance-none border border-gray-500 bg-white px-1 py-0 leading-none text-gray-700 focus:outline-none"
            onChange={handleSize('height')}
            value={size.height}
            type="number"
            placeholder="SVG Height"
            id="height"
          />
        </div>

        <div className="mt-3 bg-gray-300">
          <span className="font-bold">Batch Setting</span>
          <InputItem item={batch} handleInput={handleAllInput}></InputItem>
        </div>
        {items.map((item) => {
          return <InputItem item={item} handleInput={handleInput}></InputItem>;
        })}

        <div ref={svgRef} className="border">
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width={size.width}
            height={size.height}
          >
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
              const x = leftTopPadding + i * itemWidth;
              const y = leftTopPadding;
              const href = i === 0 ? '#first' : i === items.length - 1 ? '#last' : '#middle';
              return <use key={item.id} x={x} y={y} xlinkHref={href} fill={item.fill} stroke={item.stroke}></use>;
            })}

            {items.map((item, i) => {
              const x =
                i === 0 ? leftTopPadding + 10 + i * itemWidth : leftTopPadding + 10 + i * itemWidth + protrusionWidth;
              const y = leftTopPadding + itemHeight / 2;
              return (
                <text key={item.id} x={x} y={y} fontFamily="sans-serif" fontSize={item.textSize} fill={item.textColor}>
                  {item.text}
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
