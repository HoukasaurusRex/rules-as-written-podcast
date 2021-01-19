import path from 'path'
import type { GatsbyNode } from 'gatsby'

export const createPages: GatsbyNode['createPages'] = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions
  const episodePostTemplate = path.resolve('src/templates/episode.tsx')
  const result: {
    errors?: any
    data?: {
      allMarkdownRemark: {
        edges: Array<{
          node: {
            frontmatter: {
              slug: string
              title: string
              guid: string
              date: string
              videoId: string
            }
          }
        }>
      }
    }
  } = await graphql(`
    {
      allMarkdownRemark(sort: { order: DESC, fields: [frontmatter___date] }, limit: 1000) {
        edges {
          node {
            frontmatter {
              date
              slug
              title
              guid
              videoId
            }
          }
        }
      }
    }
  `)
  if (result.errors) {
    reporter.panicOnBuild('Error while running GraphQL query.')
    return
  }
  result.data?.allMarkdownRemark.edges.forEach(({ node }) => {
    if (!node.frontmatter.slug) return
    reporter.info(JSON.stringify(node.frontmatter, null, 2))
    createPage({
      path: node.frontmatter.slug,
      component: episodePostTemplate,
      context: {
        slug: node.frontmatter.slug,
        date: node.frontmatter.date,
        title: node.frontmatter.title,
        guid: node.frontmatter.guid,
        videoId: node.frontmatter.videoId
      }
    })
  })
}
