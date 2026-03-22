import { iso8601DateTimeExtract } from '../iso8601-date-time-extract';

describe('iso8601DateExtract', () => {
  const dateTime = '2022-09-22T11:26:19Z';

  test('index省略時（デフォルト=0）は日付部分を返す', () => {
    expect(iso8601DateTimeExtract(dateTime)).toBe('2022-09-22');
  });

  test('index=0で日付部分を返す', () => {
    expect(iso8601DateTimeExtract(dateTime, 0)).toBe('2022-09-22');
  });

  test('index=1で時刻部分（Zなし）を返す', () => {
    expect(iso8601DateTimeExtract(dateTime, 1)).toBe('11:26:19');
  });

  test('Tが含まれない入力の場合、index=0で全体を返す', () => {
    expect(iso8601DateTimeExtract('2022-09-22')).toBe('2022-09-22');
  });

  test('Tが含まれない入力でindex=1の場合、エラーが発生する', () => {
    expect(() => iso8601DateTimeExtract('2022-09-22', 1)).toThrow();
  });
});
