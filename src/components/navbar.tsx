import { Box, Link, Flex, Spacer } from '@chakra-ui/react'
import { Link as GatsbyLink } from 'gatsby'
import React from 'react'
import ThemeToggle from './theme-toggle'
import Icon from './icon'

const Navbar = () => (
  <Box as="nav" position="fixed" width="100%" height="70px" p="5px 10px" zIndex="1" maxWidth="100vw">
    <Flex>
      <Link as={GatsbyLink} to="/">
        <Box width="50px">
          <Icon />
        </Box>
      </Link>
      <Spacer />
      <ThemeToggle />
    </Flex>
  </Box>
)

export default Navbar
