const path = require('path')
const fs = require('fs').promises
const fetch = require('node-fetch')

const fetchFeedData = async ({
  request = fetch,
  rssFeedURL = `https://anchor.fm/s/44a4277c/podcast/rss`,
  requestConfig = {}
}) => {
  if (!rssFeedURL) throw Error('rssFeedURL is required')
  const res = await request(`https://api.houk.space/feed-to-json?url=${encodeURIComponent(rssFeedURL)}`, requestConfig)
  const body = await res.json()
  return body.data
}

const createCollection = (feed) => feed.items
  ?.map((item, idx) => ({
    id: item.guid,
    title: item.title,
    number: feed.items?.length ? feed.items?.length - idx : 0,
    description: item.itunes.summary,
    enclosure_url: item.enclosure.url,
    season: item.season || 1
  }))
  ?.sort((a, b) => b.number - a.number)


const downloadRSSFeedData = async ({ feed, dataFolder = path.join(__dirname, '/data') }) => {
  await fs.writeFile(`${dataFolder}/rss.json`, JSON.stringify(feed, null, 2))
  return feed
}

module.exports = { fetchFeedData, createCollection, downloadRSSFeedData }
