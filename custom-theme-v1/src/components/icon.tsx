import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import { IconQuery } from '../../types/graphql-types'

const Icon = (): JSX.Element => {
  const img: IconQuery = useStaticQuery(graphql`
    query Icon {
      src: file(relativePath: { eq: "icon.png" }) {
        childImageSharp {
          gatsbyImageData(layout: CONSTRAINED, width: 50)
        }
      }
    }
  `)

  if (!img.src?.childImageSharp?.gatsbyImageData) {
    return <div>Picture not found</div>
  }

  return <GatsbyImage image={img.src.childImageSharp.gatsbyImageData} alt="" />
}

export default Icon
