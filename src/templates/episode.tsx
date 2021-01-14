import React from 'react'
import { graphql } from 'gatsby'
import ReactHtmlParser from 'react-html-parser'
import { feedItem } from '../types'

const Episode: React.FunctionComponent<{
  data: {
    markdownRemark: {
      html: string
      frontmatter: {
        date: string
        slug: string
        title: string
      }
    }
  }
}> = ({ data }) => {
  const { markdownRemark } = data // data.markdownRemark holds your post data
  const { frontmatter, html } = markdownRemark
  return (
    <div className="blog-post-container">
      <div className="blog-post">
        <h1>{frontmatter.title}</h1>
        <h2>{frontmatter.date}</h2>
        <div className="blog-post-content">{ReactHtmlParser(html)}</div>
      </div>
    </div>
  )
}

export default Episode

export const pageQuery = graphql`
  query($slug: String!) {
    markdownRemark(frontmatter: { slug: { eq: $slug } }) {
      html
      frontmatter {
        date
        guid
        title
        videoId
      }
    }
  }
`
