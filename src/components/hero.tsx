import React from 'react'
import { Box, Flex, Heading, Text, Button } from '@chakra-ui/react'
import { CgMouse } from 'react-icons/cg'
import RawImage from './raw-image'

const scrollDown = () => {
  window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
}

export default function Hero({
  title = 'Title',
  description = 'Description of site',
}) {
  return (
    <Box
      as="header"
      background="#bb4430"
      height="100vh"
      width="100%"
      textAlign="center"
      d="flex"
      alignContent="center"
    >
      <Box maxW="600px" m="auto">
        <Heading color="white">{title}</Heading>
        <Text padding="50px" color="white">{description}</Text>
        <Box maxW="300px" m="auto"><Box borderRadius="6px"><RawImage /></Box></Box>
        <Button marginTop="50px" onClick={scrollDown}>
          Latest <CgMouse /> Episodes
        </Button>
      </Box>
    </Box>
  )
}
