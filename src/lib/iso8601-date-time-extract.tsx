export const iso8601DateTimeExtract = (datetime: string | undefined, index: number = 0) => {
  if (!datetime) return '';
  return index ? datetime.split('T')[index].replace('Z', '') : datetime.split('T')[index];
};
