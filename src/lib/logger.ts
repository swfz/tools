// Vercel のログをレベルで絞り込み、機械的に読めるよう 1 行 JSON で出す。
// console を直接呼ぶのはこのファイルだけにする
type Level = 'debug' | 'info' | 'warn' | 'error';
type Fields = Record<string, unknown>;

// Error は JSON.stringify すると {} になるため、中身を展開する
const replacer = (_key: string, value: unknown) =>
  value instanceof Error ? { name: value.name, message: value.message, stack: value.stack } : value;

const write = (level: Level, msg: string, fields: Fields = {}) => {
  console[level](JSON.stringify({ level, msg, ts: new Date().toISOString(), ...fields }, replacer));
};

export const logger = {
  debug: (msg: string, fields?: Fields) => write('debug', msg, fields),
  info: (msg: string, fields?: Fields) => write('info', msg, fields),
  warn: (msg: string, fields?: Fields) => write('warn', msg, fields),
  error: (msg: string, fields?: Fields) => write('error', msg, fields),
};
