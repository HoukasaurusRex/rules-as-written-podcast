require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})
const crypto = require("crypto")
const { slugify } = require("./src/utils/utils")
const { fetchFeedData, createCollection } = require("./src/feed")
const mockupEpisodes = require("./data/mockupEpisodes.json")
const { config } = require("dotenv")

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
