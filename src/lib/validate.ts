export const isValidOpenAIKey = (key: string): boolean => {
  const pattern = /^sk-[a-zA-Z0-9-_]{1,250}$/;
  return pattern.test(key);
};
