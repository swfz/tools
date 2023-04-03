export const iso8601DateTimeExtract = (datetime: string, index: number = 0) => {
  return index ? datetime.split('T')[index].replace('Z', '') : datetime.split('T')[index];
};
