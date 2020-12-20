import React from "react"
import PropTypes from "prop-types"
import { useStaticQuery, graphql } from "gatsby"
import { Box, Link } from '@chakra-ui/react'

import Navbar from "./navbar"
import "./layout.css"

const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <>
      <Navbar siteTitle={data.site.siteMetadata?.title || `Title`} />
      <Box>{children}</Box>
      <Box as="footer" marginTop="2rem" fontSize="sm">
        © {new Date().getFullYear()}, Built with
        {` `}
        <Link
          isExternal
          textDecor="underline"
          color="purple.500"
          href="https://www.gatsbyjs.com"
        >
          Gatsby
        </Link>
      </Box>
    </>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
