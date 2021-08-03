type feedItem = {
  content: string
  contentSnippet: string
  creator: string
  'dc:creator': string
  enclosure: {
    url: string
    length: string
    type: string
  }
  guid: string
  isoDate: string
  itunes: {
    summary: string
    explicit: string
    duration: number
    image: string
  }
  link: string
  pubDate: string
  title: string
}

type feedData = {
  author?: string
  copyright?: string
  creator?: string
  description?: string
  feedUrl?: string
  generator?: string
  image?: {
    link: string
    url: string
    title: string
  }
  itunes?: {
    owner: {
      name: string
      email: string
    }
    image: string
    categories: Array<string>
    categoriesWithSubs: Array<{
      name: string
      subs: Array<{
        name: string
      }>
    }>
    author: string
  }
  language?: string
  lastBuildDate?: string
  link?: string
  title?: string
  items?: Array<feedItem>
}

type feedAPIResponseBody = {
  status: string
  data: feedData
}

interface SimplecastFeedItem {
  updated_at?: string
  type?: string
  token?: string
  title: string
  status?: string
  slug?: string
  season?: {
    href: string
    number: number
  }
  scheduled_for?: string
  published_at?: string
  number?: number
  is_hidden?: boolean
  image_url?: string
  image_path?: string
  id?: string
  href?: string
  guid?: string
  enclosure_url?: string
  description?: string
  analytics?: {
    href: string
  }
}

interface SimplecastFeedData {
  href?: string
  pages?: {
    total: number
    previous?: {
      href: string
    }
    next?: {
      href: string
    }
    limit: number
    current: number
  }
  dashboard_link?: string
  create?: string
  count?: number
  collection?: Array<SimplecastFeedItem>
}

interface FeedData extends feedData, SimplecastFeedData {

}

type Captions = Array<{
  text: string
  start: number
  duration: number
}>

interface Videos {
  [title: string]: {
    videoId?: string | null | undefined
    videoPublishedAt?: string | null | undefined
  }
}

interface Episode {
  guid?: string
  videoId?: string | null
  title?: string
  contentSnippet?: string
  slug?: string
  captions?: Captions
  pubDate?: string
  enclosure?: {
    url?: string
  }
  itunes?: {
    duration?: number | string
  }
}

export { feedData, feedItem, feedAPIResponseBody, Videos, Episode, Captions, SimplecastFeedItem, SimplecastFeedData, FeedData }
