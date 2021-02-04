import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import Img from 'gatsby-image'
import { IconTitleQuery } from '../../types/graphql-types'

const RawImage = () => {
  const img = useStaticQuery<IconTitleQuery>(graphql`
    query IconTitle {
      src: file(relativePath: { eq: "raw-icon-title.png" }) {
        childImageSharp {
          fluid(maxWidth: 200) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
    }
  `)

  if (!img.src?.childImageSharp?.fluid) {
    return <div>Picture not found</div>
  }

  return <Img fluid={img.src.childImageSharp.fluid} />
}

export default RawImage
