module.exports.slugify = (s) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')

module.exports.trackEvent = (name, options = {}) => {
  if (typeof pa !== 'undefined') pa.track({ name, ...options })
}