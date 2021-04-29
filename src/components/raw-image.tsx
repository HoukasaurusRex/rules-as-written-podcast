import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import { IconTitleQuery } from '../../types/graphql-types'

const RawImage = () => {
  const img = useStaticQuery<IconTitleQuery>(graphql`
    query IconTitle {
      src: file(relativePath: { eq: "raw-icon-title.png" }) {
        childImageSharp {
          gatsbyImageData(layout: CONSTRAINED, width: 200)
        }
      }
    }
  `)


if (!img.src?.childImageSharp?.gatsbyImageData) {
  return <div>Picture not found</div>
}

return <GatsbyImage image={img.src.childImageSharp.gatsbyImageData} alt="" />
}

export default RawImage
