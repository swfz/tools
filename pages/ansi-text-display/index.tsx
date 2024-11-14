import type { NextPage } from 'next';
import Head from 'next/head';
import React, { useState } from 'react';

const ANSITextDisplay: NextPage = () => {
  const [text, setText] = useState('');
  const [format, setFormat] = useState('raw'); // raw, json, yaml

  // Solarized Darkのカラーパレット
  const solarizedColors = {
    base03: '#002b36',
    base02: '#073642',
    base01: '#586e75',
    base00: '#657b83',
    base0: '#839496',
    base1: '#93a1a1',
    base2: '#eee8d5',
    base3: '#fdf6e3',
    yellow: '#b58900',
    orange: '#cb4b16',
    red: '#dc322f',
    magenta: '#d33682',
    violet: '#6c71c4',
    blue: '#268bd2',
    cyan: '#2aa198',
    green: '#859900',
  };

  const preprocessText = (input: string, format: string) => {
    switch (format) {
      case 'json':
        return input.replace(/\\u001b\[/g, '\u001b[').replace(/\\n/g, '\n');
      case 'yaml':
        return input.replace(/\\e\[/g, '\u001b[').replace(/\\n/g, '\n');
      case 'raw':
      default:
        return input.replace(/\[(\d+(?:;\d+)*m)/g, '\u001b[$1').replace(/\\n/g, '\n');
    }
  };

  // フォーマット変換関数
  const convertFormat = {
    toRaw: (text: string) =>
      text
        .replace(/\\u001b\[/g, '[')
        .replace(/\\x1b\[/g, '[')
        .replace(/\\e\[/g, '['),
    toJSON: (text: string) =>
      text
        .replace(/\\x1b\[/g, '\\u001b[')
        .replace(/\\e\[/g, '\\u001b[')
        .replace(/(?<!\\)\[/g, '\\u001b['),
    toYAML: (text: string) =>
      text
        .replace(/\\u001b\[/g, '\\e[')
        .replace(/\\x1b\[/g, '\\e[')
        .replace(/(?<!\\)\[/g, '\\e['),
  };

  const parseANSI = (input: string) => {
    // フォーマットに応じて前処理
    const processedText = preprocessText(input, format);

    // 基本的なカラーコードマッピング
    const basicColorMap: { [key: string]: string } = {
      '30': solarizedColors.base02,
      '31': solarizedColors.red,
      '32': solarizedColors.green,
      '33': solarizedColors.yellow,
      '34': solarizedColors.blue,
      '35': solarizedColors.magenta,
      '36': solarizedColors.cyan,
      '37': solarizedColors.base2,
      '90': solarizedColors.base03,
      '91': solarizedColors.orange,
      '92': solarizedColors.base01,
      '93': solarizedColors.base00,
      '94': solarizedColors.base0,
      '95': solarizedColors.violet,
      '96': solarizedColors.base1,
      '97': solarizedColors.base3,
    };

    const parts = processedText.split(/(\u001b\[\d+(?:;\d+)*m)/);
    let currentColor = solarizedColors.base0;
    let currentBg = 'transparent';
    let isBold = false;
    let isDim = false;

    return parts
      .map((part, index) => {
        if (part.startsWith('\u001b[')) {
          const codes =
            part
              .match(/\u001b\[([^\u001b]*)/)?.[1]
              .toString()
              .replace('m', '')
              .split(';') || [];

          for (const code of codes) {
            if (code === '0') {
              currentColor = solarizedColors.base0;
              currentBg = 'transparent';
              isBold = false;
              isDim = false;
            } else if (code === '1') {
              isBold = true;
            } else if (code === '2') {
              isDim = true;
            } else if (code === '22') {
              isBold = false;
              isDim = false;
            } else if (basicColorMap[code]) {
              currentColor = basicColorMap[code];
            }
          }
          return null;
        }

        const lines = part.split('\n');
        return lines.map((line, lineIndex) => (
          <React.Fragment key={`${index}-${lineIndex}`}>
            {lineIndex > 0 && <br />}
            <span
              style={{
                color: currentColor,
                backgroundColor: currentBg,
                fontWeight: isBold ? 'bold' : 'normal',
                opacity: isDim ? 0.5 : 1,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              }}
              className="whitespace-pre"
            >
              {line}
            </span>
          </React.Fragment>
        ));
      })
      .filter(Boolean);
  };

  return (
    <>
      <Head>
        <title>Ansi Text Display</title>
      </Head>
      <div className="divide-y divide-gray-300">
        <div>
          <h1>Ansi Text Display</h1>
        </div>
        <div className="p-3">
          <div>
            <div>Ansiエスケープ文字が含まれた文字列をカラー付きで表示するためのフォーム</div>
            <div>主にAnsible実行失敗時の結果などで使える</div>
          </div>
        </div>
        <div className="w-full max-w-4xl mx-auto p-4">
          <div className="flex gap-4 mb-4">
            <details>
              <summary className="px-3 py-1">フォーマット変換</summary>
              <div className="flex gap-4">
                <button
                  onClick={() => setText(convertFormat.toRaw(text))}
                  className="px-3 py-1 rounded hover:opacity-80"
                  style={{ backgroundColor: solarizedColors.blue, color: solarizedColors.base3 }}
                >
                  生形式に変換
                </button>
                <button
                  onClick={() => setText(convertFormat.toJSON(text))}
                  className="px-3 py-1 rounded hover:opacity-80"
                  style={{ backgroundColor: solarizedColors.cyan, color: solarizedColors.base3 }}
                >
                  JSON形式に変換
                </button>
                <button
                  onClick={() => setText(convertFormat.toYAML(text))}
                  className="px-3 py-1 rounded hover:opacity-80"
                  style={{ backgroundColor: solarizedColors.green, color: solarizedColors.base3 }}
                >
                  YAML形式に変換
                </button>
              </div>
            </details>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 rounded mb-4 font-mono"
            rows={10}
            cols={100}
            placeholder="エスケープシーケンス付きのテキストを入力してください..."
          />

          <div className="mb-4">
            <div className="flex items-center gap-4 mb-2">
              <label className="text-sm">入力形式:</label>
              <select value={format} onChange={(e) => setFormat(e.target.value)} className="px-2 py-1 rounded text-sm">
                <option value="raw">生のエスケープシーケンス ([31m)</option>
                <option value="json">JSONエスケープ形式 (\u001b)</option>
                <option value="yaml">YAMLエスケープ形式 (\e)</option>
              </select>
            </div>
            <p className="text-sm">
              現在の形式:{' '}
              {format === 'raw' ? '[31mText[0m' : format === 'json' ? '\\u001b[31mText\\u001b[0m' : '\\e[31mText\\e[0m'}
            </p>
          </div>

          <div>結果</div>
          <div
            className="rounded p-4 min-h-[200px]"
            style={{
              backgroundColor: solarizedColors.base02,
              border: `1px solid ${solarizedColors.base01}`,
            }}
          >
            {parseANSI(text)}
          </div>
        </div>
      </div>
    </>
  );
};

export default ANSITextDisplay;
