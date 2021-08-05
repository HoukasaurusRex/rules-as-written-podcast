const crypto = require("crypto")
const { slugify } = require("./src/utils/utils")
const { fetchFeedData, createCollection } = require("./src/feed")
const mockupEpisodes = require("./data/mockupEpisodes.json")
const { Client, LogLevel } = require("@notionhq/client")
const YAML = require('yaml')
const fs = require('fs').promises

const blockToMD = (block) => {
  const { type } = block
  const text = block[type].text.map(val => val.text.content).join('\n')
  switch (type) {
    case 'paragraph':
      return `${text}`
    case 'heading_1':
      return `# ${text}`
    case 'heading_2':
      return `## ${text}`
    case 'heading_3':
      return `### ${text}`
    case 'numbered_list_item':
      return `- ${text}`
    case 'bulleted_list_item':
      return `${text}`
    default:
      return `${text}`
  }
}

const shapeMetadata = (meta) => ({
  createdTime: meta.created_time,
  lastEditedTime: meta.last_edited_time,
  page_id: meta.id,
  id: meta.properties['id'].rich_text[0]?.plain_text,
  show: meta.properties['Show'].select?.name,
  summary: meta.properties['Summary'].rich_text[0]?.plain_text,
  image: meta.properties['Image']?.url,
  resources: meta.properties['Resources'].rich_text[0]?.plain_text.split(',').map(link => `[${link}](${link})`),
  guestName: meta.properties['Guest Name'].rich_text[0]?.plain_text,
  guestPhoto: meta.properties['Guest Photo']?.url,
  guestSummary: meta.properties['Guest Summary'].rich_text[0]?.plain_text,
  status: meta.properties['Status'].select.name
})

const getPagesMeta = async(notion, { notionPagesDatabaseId }) => {
  const pagesMeta = await notion.databases.query({
    database_id: notionPagesDatabaseId,
    filter: {
      property: "Status",
      select: {
        does_not_equal: "Ideas",
      },
    }
  })
  return pagesMeta.results.map(meta => shapeMetadata(meta))
}

const getPageContent = async(notion, { pageId }) => {
  const pageContent = await notion.blocks.children.list({
    block_id: pageId
  })
  return pageContent
}

exports.onPreInit = async({ actions }, options ) => {
  const notion = new Client({
    auth: options.notion_token,
    logLevel: LogLevel[process.env.LOG_LEVEL] || LogLevel.WARN
  })
  const pagesMeta = await getPagesMeta(notion, { notionPagesDatabaseId: options.notion_pages_database_id })
  await Promise.all(pagesMeta.map(async(meta) => {
    const pageContent = await getPageContent(notion, { pageId: meta.page_id })
    const md = pageContent.results.map(block => blockToMD(block)).join('\n\n')
    const pageDir = `${options.markdownPath}/${meta.id}`
    await fs.mkdir(pageDir, { recursive: true })
    await fs.writeFile(`${pageDir}/index.md`, `---\n${YAML.stringify(meta)}---\n\n${md}\n`)
  }))

}

exports.sourceNodes = async (
  { actions: { createNode, createNodeField }, plugins },
  options
  ) => {
  let data = options.rssFeedURL
    ? await fetchFeedData({ rssFeedURL: options.rssFeedURL })
    : mockupEpisodes

  const packagePodcast = p => {
    p.spotify_url = p.spotify_url || options.spotify_url
    p.apple_podcasts_url = p.apple_podcasts_url || options.apple_podcasts_url
    p.google_podcasts_url = p.google_podcasts_url || options.google_podcasts_url
    p.patreon_url = p.patreon_url || options.patreon_url
    const nodeContent = JSON.stringify(p)
    const nodeContentDigest = crypto
      .createHash("md5")
      .update(nodeContent)
      .digest("hex")
    const node = {
      ...p,
      content: nodeContent,
      internal: {
        type: "Episode",
        contentDigest: nodeContentDigest,
      },
    }
    createNode(node)
  }
  
  data.collection = data.collection || createCollection(data)
  data.collection.map(packagePodcast)
}

exports.createPages = async ({ actions, graphql }, options) => {
  const { data } = await graphql(`
    {
      site {
        siteMetadata {
          title
        }
      }
      allEpisode {
        edges {
          node {
            id
            title
            number
          }
        }
      }
      allMarkdownRemark {
        edges {
          node {
            id
            html
            frontmatter {
              title
            }
          }
        }
      }
    }
  `)

  data.allEpisode.edges.forEach(({ node }, options) => {
    actions.createPage({
      path: `${options.episodeSlug ? options.episodeSlug : "show"}/${
        node.number
      }/${slugify(node.title)}`,
      component: require.resolve(`./src/templates/episode.js`),
      context: {
        slug: slugify(node.title),
        id: node.id,
        title: node.title,
      },
    })
  })
}

exports.onCreateNode = ({ node, getNode, actions }, options) => {
  const { createNodeField } = actions
  const showsSlug = options.episodeSlug ? options.episodeSlug : "show"
  createNodeField({
    name: "slug",
    node,
    value: "/" + showsSlug + "/" + node.number + "/" + slugify(`${node.title}`),
  })
}
