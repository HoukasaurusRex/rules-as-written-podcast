import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import Img from 'gatsby-image'

const RawImage = () => {
  const data = useStaticQuery(graphql`
    query {
      src: file(relativePath: { eq: "raw-icon-title.png" }) {
        childImageSharp {
          fluid(maxWidth: 300) {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
  `)

  if (!data?.src?.childImageSharp?.fluid) {
    return <div>Picture not found</div>
  }

  return <Img fluid={data.src.childImageSharp.fluid} style={{borderRadius: '6px'}} />
}

export default RawImage
