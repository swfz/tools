export const calculateCurrentStreak = (contributions: (number | null)[]): number => {
  const todayContributionCount = contributions[0];

  if (todayContributionCount === null || todayContributionCount === undefined) {
    return 0;
  }

  if (todayContributionCount > 0) {
    const index = contributions.indexOf(0);
    return index === -1 ? contributions.length : index;
  }

  const index = contributions.slice(1).indexOf(0);
  return index === -1 ? contributions.length - 1 : index;
};

export const calculateCoverage = (contributions: (number | null)[], days: number = 365): number => {
  const slice = contributions.slice(0, days);
  const activeDays = slice.filter((c) => c !== null && c > 0).length;
  return Math.floor((activeDays / days) * 100);
};
