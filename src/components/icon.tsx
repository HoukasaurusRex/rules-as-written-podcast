import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import Img from 'gatsby-image'
import { IconQuery } from '../../types/graphql-types'

const Icon = (): JSX.Element => {
  const img: IconQuery = useStaticQuery(graphql`
    query Icon {
      src: file(relativePath: { eq: "icon.png" }) {
        childImageSharp {
          fluid(maxWidth: 50) {
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

export default Icon
