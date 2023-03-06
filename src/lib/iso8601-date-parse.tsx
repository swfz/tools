export const iso8601DateParse = (datetime: string) => {
  return datetime.split('T')[0];
};
