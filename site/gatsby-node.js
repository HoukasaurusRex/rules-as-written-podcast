const downloadNotionPages = require('./src/utils/notion')
const options = require('./gatsby-config')

exports.onPreInit = async() => {
  await downloadNotionPages({
    notion_token: options.siteMetadata.notion_token,
    notion_pages_database_id: options.siteMetadata.notion_pages_database_id,
    markdownPath: options.siteMetadata.markdownPath
  })
}
