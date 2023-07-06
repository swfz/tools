import { iso8601DateTimeExtract } from '../iso8601-date-time-extract';

describe('iso8601DateExtract', () => {
  const dateTime = '2022-09-22T11:26:19Z';
  test('extraction date only', () => {
    expect(iso8601DateTimeExtract(dateTime)).toBe('2022-09-22');
  });
  test('extraction time only', () => {
    expect(iso8601DateTimeExtract(dateTime, 1)).toBe('11:26:19');
  });
});
