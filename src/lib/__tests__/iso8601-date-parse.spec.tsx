import { iso8601DateParse } from '../iso8601-date-parse';

describe('iso8601DateParse', () => {
  test('check', () => {
    expect(iso8601DateParse("2022-09-22T11:26:19Z")).toBe("2022-09-22")
  });
});
