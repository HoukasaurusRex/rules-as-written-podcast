import { Box, Link, Flex, Spacer } from '@chakra-ui/react'
import { Link as GatsbyLink } from 'gatsby'
import React from 'react'
import ThemeToggle from './theme-toggle'
import Image from './image'

const Navbar = () => (
  <Box as="nav" position="fixed" width="100%" height="70px" p="5px 10px">
    <Flex>
      <Link as={GatsbyLink} to="/">
        <Box width="50px">
          <Image />
        </Box>
      </Link>
      <Spacer />
      <ThemeToggle />
    </Flex>
  </Box>
)

export default Navbar
