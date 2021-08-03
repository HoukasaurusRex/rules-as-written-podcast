export const toSlug = (s: string): string =>
  `/${s
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')}`
