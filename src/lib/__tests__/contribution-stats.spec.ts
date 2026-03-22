import { calculateCurrentStreak, calculateCoverage } from '../contribution-stats';

describe('calculateCurrentStreak', () => {
  test('今日の貢献>0の場合、最初の0までの日数を返す', () => {
    // 今日=3, 昨日=2, 一昨日=1, 3日前=0
    expect(calculateCurrentStreak([3, 2, 1, 0, 5])).toBe(3);
  });

  test('今日の貢献=0の場合、昨日から最初の0までの日数を返す', () => {
    // 今日=0, 昨日=2, 一昨日=1, 3日前=0
    expect(calculateCurrentStreak([0, 2, 1, 0, 5])).toBe(2);
  });

  test('全て0の場合、0を返す', () => {
    expect(calculateCurrentStreak([0, 0, 0, 0])).toBe(0);
  });

  test('全て非0の場合、配列の長さを返す（バグ修正: indexOf=-1のケース）', () => {
    expect(calculateCurrentStreak([1, 2, 3, 4, 5])).toBe(5);
  });

  test('今日=0で昨日以降すべて非0の場合、配列長-1を返す', () => {
    expect(calculateCurrentStreak([0, 1, 2, 3])).toBe(3);
  });

  test('今日だけ貢献がある場合、1を返す', () => {
    expect(calculateCurrentStreak([5, 0, 0, 0])).toBe(1);
  });

  test('nullを含む場合、0を返す', () => {
    expect(calculateCurrentStreak([null, null])).toBe(0);
  });

  test('空配列の場合、0を返す', () => {
    expect(calculateCurrentStreak([])).toBe(0);
  });
});

describe('calculateCoverage', () => {
  test('全日貢献ありなら100を返す', () => {
    const contributions = Array(365).fill(1);
    expect(calculateCoverage(contributions)).toBe(100);
  });

  test('全日0なら0を返す', () => {
    const contributions = Array(365).fill(0);
    expect(calculateCoverage(contributions)).toBe(0);
  });

  test('半分だけ貢献ありなら50を返す', () => {
    const contributions = [...Array(183).fill(1), ...Array(182).fill(0)];
    expect(calculateCoverage(contributions)).toBe(50);
  });

  test('365日未満のデータでも365日基準で計算する', () => {
    // 100日分のデータで全部貢献あり → 100/365 = 27%
    const contributions = Array(100).fill(1);
    expect(calculateCoverage(contributions)).toBe(27);
  });

  test('365日を超えるデータがあっても最初の365日だけ使う', () => {
    const contributions = [...Array(365).fill(1), ...Array(100).fill(0)];
    expect(calculateCoverage(contributions)).toBe(100);
  });

  test('nullの日は貢献なしとして扱う', () => {
    const contributions = [...Array(365).fill(null)];
    expect(calculateCoverage(contributions)).toBe(0);
  });
});
