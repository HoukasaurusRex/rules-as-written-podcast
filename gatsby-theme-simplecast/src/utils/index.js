module.exports.slugify = (s) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')

module.exports.trackEvent = (name, options = {}) => pa && pa.track({ name, ...options })

module.exports.getDescriptionFromHTML = (html) =>  typeof DOMParser !== 'undefined'
  ? new DOMParser()
    .parseFromString(html, "text/html")
    .querySelector('p')
    .textContent
  : html
    .match(/<p>(.*?)<\/p>/)[0]
    .replace(/(<p>|<\/p>)/g, '')