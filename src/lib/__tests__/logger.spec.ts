import { logger } from '../logger';

describe('logger', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-02T03:04:05.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const levels = ['debug', 'info', 'warn', 'error'] as const;

  test.each(levels)('%s は同名の console メソッドに 1 行の JSON を出す', (level) => {
    const spy = jest.spyOn(console, level).mockImplementation(() => {});

    logger[level]('hello');

    expect(spy).toHaveBeenCalledTimes(1);
    const [line] = spy.mock.calls[0];
    expect(line).not.toContain('\n');
    expect(JSON.parse(line)).toEqual({ level, msg: 'hello', ts: '2026-01-02T03:04:05.000Z' });
  });

  test('info は fields をトップレベルに展開する', () => {
    const spy = jest.spyOn(console, 'info').mockImplementation(() => {});

    logger.info('fetched', { status: 200, nested: { a: 1 } });

    expect(JSON.parse(spy.mock.calls[0][0])).toEqual({
      level: 'info',
      msg: 'fetched',
      ts: '2026-01-02T03:04:05.000Z',
      status: 200,
      nested: { a: 1 },
    });
  });

  test('error は fields の Error を name / message / stack に展開する', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new TypeError('Failed to fetch');

    logger.error('request failed', { error });

    expect(JSON.parse(spy.mock.calls[0][0])).toEqual({
      level: 'error',
      msg: 'request failed',
      ts: '2026-01-02T03:04:05.000Z',
      error: { name: 'TypeError', message: 'Failed to fetch', stack: error.stack },
    });
  });

  test('他のレベルの console メソッドは呼ばない', () => {
    const spies = levels.map((level) => jest.spyOn(console, level).mockImplementation(() => {}));

    logger.warn('only warn');

    expect(spies.map((spy) => spy.mock.calls.length)).toEqual([0, 0, 1, 0]);
  });
});
