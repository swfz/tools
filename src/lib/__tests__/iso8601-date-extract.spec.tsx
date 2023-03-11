import { iso8601DateExtract } from '../iso8601-date-extract';

describe('iso8601DateExtract', () => {
  test('extraction date only', () => {
    expect(iso8601DateExtract("2022-09-22T11:26:19Z")).toBe("2022-09-22")
  });
});
