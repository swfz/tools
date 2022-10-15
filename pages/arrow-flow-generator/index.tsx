import type { NextPage } from 'next';
import { v4 as uuid } from 'uuid';
import { MouseEvent, useState, useRef } from 'react';
import Head from 'next/head';

interface Item {
  id: string;
  text: string;
  fill: string;
  stroke: string;
  strokeSize: number;
  textSize: number;
  textColor: string;
}
interface Options {
  width: number;
  height: number;
  lastIsArrow: boolean;
  space: number;
  itemHeight: number;
}

const InputItem = ({
  item,
  handleInput,
}: {
  item: Item;
  handleInput: (targetItem: Item, column: string) => (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <span className="flex flex-row py-1 odd:bg-slate-100">
      <label className="ml-2 font-bold text-gray-700" htmlFor={`text-${item.id}`}>
        Text:{' '}
      </label>
      <input
        className="block h-6 w-32 appearance-none border border-gray-500 bg-white px-1 py-0 leading-none text-gray-700 focus:outline-none"
        onChange={handleInput(item, 'text')}
        type="text"
        placeholder="Text"
        id={`text-${item.id}`}
      />

      <label className="ml-2 font-bold text-gray-700" htmlFor={`fill-${item.id}`}>
        Fill:{' '}
      </label>
      <input onChange={handleInput(item, 'fill')} value={item.fill} type="color" id={`fill-${item.id}`} />

      <label className="ml-2 font-bold text-gray-700" htmlFor={`stroke-${item.id}`}>
        Stroke:{' '}
      </label>
      <input onChange={handleInput(item, 'stroke')} value={item.stroke} type="color" id={`stroke-${item.id}`} />

      <label className="ml-2 font-bold text-gray-700" htmlFor={`strokeSize-${item.id}`}>
        Stroke Size:{' '}
      </label>
      <input
        className="block h-6 w-16 appearance-none border border-gray-500 bg-white leading-none text-gray-700 focus:outline-none"
        onChange={handleInput(item, 'strokeSize')}
        type="number"
        value={item.strokeSize}
        id={`strokeSize-${item.id}`}
      />

      <label className="ml-2 font-bold text-gray-700" htmlFor={`textColor-${item.id}`}>
        Text Color:{' '}
      </label>
      <input
        onChange={handleInput(item, 'textColor')}
        value={item.textColor}
        type="color"
        id={`textColor-${item.id}`}
      />

      <label className="ml-2 font-bold text-gray-700" htmlFor={`textSize-${item.id}`}>
        Text Size:{' '}
      </label>
      <input
        className="block h-6 w-16 appearance-none border border-gray-500 bg-white leading-none text-gray-700 focus:outline-none"
        onChange={handleInput(item, 'textSize')}
        type="number"
        value={item.textSize}
        id={`textSize-${item.id}`}
      />
    </span>
  );
};

const InputOptions = ({
  options,
  handleOptions,
}: {
  options: Options;
  handleOptions: (propName: string) => (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-row">
          <label className="ml-2 basis-1/4 font-bold text-gray-700" htmlFor="width">
            SVG Width:
          </label>
          <span className="basis-3/4">
            <input
              className="block h-6 w-32 appearance-none border border-gray-500 bg-white px-1 py-0 leading-none text-gray-700 focus:outline-none"
              onChange={handleOptions('width')}
              value={options.width}
              type="number"
              placeholder="SVG Width"
              id="width"
            />
          </span>
        </div>

        <div className="flex flex-row">
          <label className="ml-2 basis-1/4 font-bold text-gray-700" htmlFor="height">
            SVG Height:
          </label>
          <span className="basis-3/4">
            <input
              className="block h-6 w-32 appearance-none border border-gray-500 bg-white px-1 py-0 leading-none text-gray-700 focus:outline-none"
              onChange={handleOptions('height')}
              value={options.height}
              type="number"
              placeholder="SVG Height"
              id="height"
            />
          </span>
        </div>

        <div className="flex flex-row">
          <label className="ml-2 basis-1/4 font-bold text-gray-700" htmlFor="space">
            Item Space Size:
          </label>
          <span className="basis-3/4">
            <input
              className="block h-6 w-16 appearance-none border border-gray-500 bg-white px-1 py-0 leading-none text-gray-700 focus:outline-none"
              onChange={handleOptions('space')}
              value={options.space}
              type="number"
              placeholder="Space Size"
              id="space"
            />
          </span>
        </div>

        <div className="flex flex-row">
          <label className="ml-2 basis-1/4 font-bold text-gray-700" htmlFor="itemHeight">
            Item Height:
          </label>
          <span className="basis-3/4">
            <input
              className="block h-6 w-16 appearance-none border border-gray-500 bg-white px-1 py-0 leading-none text-gray-700 focus:outline-none"
              onChange={handleOptions('itemHeight')}
              value={options.itemHeight}
              type="number"
              placeholder="Item Height"
              id="itemHeight"
            />
          </span>
        </div>

        <div className="flex flex-row">
          <label className="ml-2 basis-1/4 font-bold text-gray-700" htmlFor="last-is-arrow">
            Last Item is Arrow Shape:
          </label>
          <span className="basis-3/4">
            <input type="checkbox" id="last-is-arrow" onChange={handleOptions('lastIsArrow')} className="mt-1" />
          </span>
        </div>
      </div>
    </>
  );
};

const ArrowFlow = ({ options, items }: { options: Options; items: Item[] }) => {
  const leftTopPadding = 10;
  const topSideWidth = 150;
  const protrusionWidth = 30;
  const itemHeight = options.itemHeight;
  const space = options.space;
  const itemWidth = 150 + space;

  const hrefFromOptions = (index: number, options: Options): '#first' | '#middle' | '#last' => {
    if (index === 0) {
      return '#first';
    }
    if (index === items.length - 1 && !options.lastIsArrow) {
      return '#last';
    }

    return '#middle';
  };

  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      width={options.width}
      height={options.height}
    >
      <defs>
        <polygon
          id="first"
          points={`0,0 ${topSideWidth},0 ${topSideWidth + protrusionWidth},${
            itemHeight / 2
          } ${topSideWidth},${itemHeight} 0,${itemHeight}`}
        />
        <polygon
          id="middle"
          points={`0,0 ${topSideWidth},0 ${topSideWidth + protrusionWidth},${
            itemHeight / 2
          } ${topSideWidth},${itemHeight} 0,${itemHeight} ${protrusionWidth},${itemHeight / 2}`}
        />
        <polygon
          id="last"
          points={`0,0 ${topSideWidth + protrusionWidth},0 ${
            topSideWidth + protrusionWidth
          },${itemHeight} 0,${itemHeight} ${protrusionWidth},${itemHeight / 2}`}
        />
      </defs>
      {items.map((item, i) => {
        const x = leftTopPadding + i * itemWidth;
        const y = leftTopPadding;
        const href = hrefFromOptions(i, options);
        return (
          <use
            key={item.id}
            x={x}
            y={y}
            xlinkHref={href}
            fill={item.fill}
            stroke={item.stroke}
            strokeWidth={item.strokeSize}
          ></use>
        );
      })}

      {items.map((item, i) => {
        const x = i === 0 ? leftTopPadding + 10 + i * itemWidth : leftTopPadding + 10 + i * itemWidth + protrusionWidth;
        const y = leftTopPadding + itemHeight / 2 + item.textSize / 4;
        return (
          <text key={item.id} x={x} y={y} fontFamily="sans-serif" fontSize={item.textSize} fill={item.textColor}>
            {item.text}
          </text>
        );
      })}
    </svg>
  );
};

const ArrowFlowGenerator: NextPage = () => {
  const generateDefaultItem = () => ({
    id: uuid(),
    text: 'sample',
    fill: '#3399EE',
    stroke: '#666666',
    strokeSize: 3,
    textSize: 20,
    textColor: '#FFFFFF',
  });

  const initialItems = [...Array(3)].map(() => generateDefaultItem());
  const [items, setItems] = useState<Item[]>(initialItems);
  const [batch, setBatch] = useState<Item>(generateDefaultItem());
  const svgRef = useRef<HTMLDivElement>(null);
  const [options, setOptions] = useState<Options>({
    width: 800,
    height: 300,
    lastIsArrow: false,
    space: 10,
    itemHeight: 200,
  });

  const handleAddButtonClick = (e: MouseEvent<HTMLElement>) => {
    setItems((prevItems) => {
      return [...prevItems, { ...batch, id: uuid() }];
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

  const handleOptions = (propName: string) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = propName === 'lastIsArrow' ? event.target.checked : parseInt(event.target.value);
      setOptions((prev) => ({ ...prev, [propName]: value }));
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
  return (
    <>
      <Head>
        <title>Arrow Flow Generator</title>
      </Head>
      <div className="divide-y divide-gray-300">
        <div>
          <h1 className="text-3xl">Arrow Flow Generator</h1>
        </div>
        <div>
          <p>よくあるこんな画像(SVG)を作成するためのジェネレータ</p>
          <p>必要な数だけ項目を追加してください</p>
        </div>
        <div>
          <div className="my-3">
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
          </div>

          <InputOptions options={options} handleOptions={handleOptions}></InputOptions>

          <div className="mt-3 bg-gray-300">
            <span className="font-bold">Batch Setting</span>
            <InputItem item={batch} handleInput={handleAllInput}></InputItem>
          </div>
          {items.map((item) => {
            return <InputItem key={item.id} item={item} handleInput={handleInput}></InputItem>;
          })}

          <div ref={svgRef} className="border">
            <ArrowFlow options={options} items={items}></ArrowFlow>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArrowFlowGenerator;
