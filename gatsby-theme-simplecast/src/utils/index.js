module.exports.slugify = (s) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')

module.exports.trackEvent = (name, options = {}) => pa && pa.track({ name, ...options })