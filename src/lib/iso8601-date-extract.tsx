export const iso8601DateExtract = (datetime: string) => {
  return datetime.split('T')[0];
};
