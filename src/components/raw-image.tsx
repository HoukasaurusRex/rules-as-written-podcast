import React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import Img from 'gatsby-image'
import { borderParser } from '@chakra-ui/react'

const RawImage = () => {
  const data = useStaticQuery(graphql`
    query {
      src: file(relativePath: { eq: "raw-image.png" }) {
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

  return <Img fluid={data.src.childImageSharp.fluid} style={{borderRadius: '10px'}} />
}

export default RawImage
