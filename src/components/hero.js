import React from 'react'
import { Box, Flex, Heading, Text, Button } from '@chakra-ui/react'
import { CgMouse } from 'react-icons/cg'

export default function Hero ({title = 'Title', description = 'Description of site'}) {
  return (
    <Box as="header" background="#bb4430" height="100vh" width="100%" textAlign="center">
      <Flex height="80%" margin="0 auto" alignItems="center" justifyContent="center" direction="column" maxWidth="600px">
        <Heading>{title}</Heading>
        <Text padding="50px">{description}</Text>
      </Flex>
      <Button>Latest <CgMouse/> Episode</Button>
    </Box>
  )
}