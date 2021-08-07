import React from 'react'
import { Helmet } from 'react-helmet'
import { useStaticQuery, graphql } from 'gatsby'

const SEO = ({ description, meta, image: metaImage, title, pathname }) => {
  const { site: { siteMetadata } } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            title
            description
            author
            keywords
            siteUrl
            image
            lang,
            microanalyticsId
          }
        }
      }
    `
  )
  const lang = siteMetadata.lang || 'en'
  const metaDescription = description || siteMetadata.description
  const defaultTitle = siteMetadata && siteMetadata.title
  const image =
    metaImage && metaImage.src
      ? `${siteMetadata.siteUrl}${metaImage.src}`
      : siteMetadata.image
  const canonical = pathname ? `${siteMetadata.siteUrl}${pathname}` : null
  return (
    <Helmet
      htmlAttributes={{
        lang
      }}
      title={title}
      titleTemplate={defaultTitle ? `%s | ${defaultTitle}` : undefined}
      link={
        canonical
          ? [
              {
                rel: 'canonical',
                href: canonical
              }
            ]
          : []
      }
      meta={[
        {
          name: 'description',
          content: metaDescription
        },
        {
          name: 'keywords',
          content: siteMetadata.keywords.join(',')
        },
        {
          property: 'og:title',
          content: title
        },
        {
          property: 'og:description',
          content: metaDescription
        },
        {
          property: 'og:type',
          content: 'website'
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image'
        },
        {
          name: 'twitter:image',
          content: image
        },
        {
          name: 'twitter:creator',
          content: siteMetadata.author || ''
        },
        {
          name: 'twitter:title',
          content: title
        },
        {
          name: 'twitter:description',
          content: metaDescription
        }
      ]
        .concat(
          image
            ? [
                {
                  property: 'og:image',
                  content: image
                },
                {
                  property: 'og:image:width',
                  content: 2560
                },
                {
                  property: 'og:image:height',
                  content: 1440
                },
                {
                  name: 'twitter:card',
                  content: 'summary_large_image'
                }
              ]
            : [
                {
                  name: 'twitter:card',
                  content: 'summary'
                }
              ]
        )
        .concat(meta || [])}
    >
      <script
        data-host="https://microanalytics.io"
        data-dnt="false"
        src="https://microanalytics.io/js/script.js"
        id={siteMetadata.microanalyticsId}
        async
        defer
      />
    </Helmet>
  )
}

export default SEO
