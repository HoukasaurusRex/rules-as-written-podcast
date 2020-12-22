import React from 'react'
import { Box, Text, Image, useBreakpointValue } from '@chakra-ui/react'

const AudioCard = ({ episodeData: { title, pubDate, contentSnippet, enclosure, itunes: { image } } }) => {
  // console.log(episodeData)
  // title
  // pubDate
  // contentSnippet
  // enclosure [length, type, url]
  // itunes [image]
  // const { title, pubDate, contentSnippet, enclosure, itunes: { image } } = episodeData
  console.log(image)
  const variant = useBreakpointValue({})
  return (
    <Box d="flex" h="125px" minWidth="300px" w="100%" p="20px">
      <Image src={image} alt="RAW shield icon" height="100%" />
    </Box>
  )

  // return (
  //   <Box maxW="sm" borderWidth="1px" borderRadius="lg" m="0 auto">
  //     <Image src={property.imageUrl} alt={property.imageAlt} />

  //     <Box p="6">
  //       <Box d="flex" alignItems="baseline">
  //         <Badge borderRadius="full" px="2" colorScheme="teal">
  //           New
  //         </Badge>
  //         <Box
  //           color="gray.500"
  //           fontWeight="semibold"
  //           letterSpacing="wide"
  //           fontSize="xs"
  //           textTransform="uppercase"
  //           ml="2"
  //         >
  //           {property.beds} beds &bull; {property.baths} baths
  //         </Box>
  //       </Box>

  //       <Box
  //         mt="1"
  //         fontWeight="semibold"
  //         as="h4"
  //         lineHeight="tight"
  //         isTruncated
  //       >
  //         {property.title}
  //       </Box>

  //       <Box>
  //         {property.formattedPrice}
  //         <Box as="span" color="gray.600" fontSize="sm">
  //           / wk
  //         </Box>
  //       </Box>

  //     </Box>
  //   </Box>
  // )
}

export default AudioCard
