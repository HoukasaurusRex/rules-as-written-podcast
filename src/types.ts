type feedItem = {
  content: string,
  contentSnippet: string,
  creator: string,
  'dc:creator': string,
  enclosure: {
    url: string,
    length: string,
    type: string
  }
  guid: string,
  isoDate: string,
  itunes: {
    summary: string,
    explicit: string,
    duration: number,
    image: string
  },
  link: string,
  pubDate: string,
  title: string
}

type feedData = {
  author?: string,
  copyright?: string,
  creator?: string,
  description?: string,
  feedUrl?: string,
  generator?: string,
  image?: {
    link: string,
    url: string,
    title: string,
  }
  itunes?: {
    owner: {
      name: string,
      email: string
    },
    image: string,
    categories: Array<string>,
    categoriesWithSubs: Array<{
      name: string,
      subs: Array<{
        name: string
      }>
    }>,
    author: string,
  }
  language?: string,
  lastBuildDate?: string,
  link?: string,
  title?: string,
  items?: Array<feedItem>
}

export { feedData, feedItem }
