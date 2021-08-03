import React, { FC } from 'react'
import { Helmet } from 'react-helmet'
import { useStaticQuery, graphql } from 'gatsby'

interface componentSEOProps {
  title: string
  pathname?: string
  description?: string
  meta?: Array<React.DetailedHTMLProps<React.MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>>
  image?: HTMLImageElement
}

const SEO: FC<componentSEOProps> = ({ description, meta, image: metaImage, title, pathname }) => {
  const { site } = useStaticQuery(
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
            lang
          }
        }
      }
    `
  )
  const lang = site.siteMetadata.lang || 'en'
  const metaDescription = description || site.siteMetadata.description
  const defaultTitle = site.siteMetadata?.title
  const image =
    metaImage && metaImage.src
      ? `${site.siteMetadata.siteUrl}${metaImage.src}`
      : site.siteMetadata.image
  const canonical = pathname ? `${site.siteMetadata.siteUrl}${pathname}` : null
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
          content: site.siteMetadata.keywords.join(',')
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
          content: site.siteMetadata?.author || ''
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
        // @ts-ignore
        .concat(meta || [])}
    >
      <script
        data-host="https://microanalytics.io"
        data-dnt="false"
        src="https://microanalytics.io/js/script.js"
        id="ZwSg9rf6GA"
        async
        defer
      />
    </Helmet>
  )
}
/**
 * 
      script={[
        {
          'data-host': 'https://microanalytics.io',
          'data-dnt': 'false',
          src: 'https://microanalytics.io/js/script.js',
          id: 'ZwSg9rf6GA',
          async: true,
          defer: true
        }
      ]}
 */
// <script data-host="https://microanalytics.io" data-dnt="false" src="https://microanalytics.io/js/script.js" id="ZwSg9rf6GA" async defer></script>

export default SEO
