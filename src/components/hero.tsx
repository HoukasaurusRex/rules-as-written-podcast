import React from 'react'
import {
  Box,
  useBreakpointValue,
  Heading,
  Text,
  Button,
  Link,
  Icon,
  List,
  ListItem,
  Tooltip
} from '@chakra-ui/react'
import { CgMouse } from 'react-icons/cg'
import { SiApplepodcasts, SiGooglepodcasts, SiSpotify } from 'react-icons/si'
import ReactHtmlParser from 'react-html-parser'
import RawImage from './raw-image'

const scrollDown = () => {
  window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
}

/* eslint-disable prettier/prettier */
const bgMobile =
  'url("data:image/svg+xml,%3C%3Fxml version=\'1.0\' encoding=\'UTF-8\' standalone=\'no\' %3F%3E%3C!DOCTYPE svg PUBLIC \'-//W3C//DTD SVG 1.1//EN\' \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\'%3E%3Csvg xmlns=\'http://www.w3.org/2000/svg\' xmlns:xlink=\'http://www.w3.org/1999/xlink\' version=\'1.1\' width=\'320\' height=\'650\' viewBox=\'0 0 320 650\' xml:space=\'preserve\'%3E%3Cdesc%3ECreated with Fabric.js 4.2.0%3C/desc%3E%3Cdefs%3E%3C/defs%3E%3Cg transform=\'matrix(0 0 0 0 0 0)\' id=\'6a400e39-a632-4717-a801-784fb3ff21fb\' %3E%3C/g%3E%3Cg transform=\'matrix(1 0 0 1 160 325)\' id=\'facbd99a-c982-4819-9ee0-4f369fd58414\' %3E%3Crect style=\'stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-opacity: 0; fill-rule: nonzero; opacity: 0.8;\' vector-effect=\'non-scaling-stroke\' x=\'-160\' y=\'-325\' rx=\'0\' ry=\'0\' width=\'320\' height=\'650\' /%3E%3C/g%3E%3Cg transform=\'matrix(6.32 4.02 -2.97 4.67 100.62 551)\' id=\'4d646a53-10e8-4f25-a6de-c0364e0b871d\' %3E%3Crect style=\'stroke: rgb(0,0,0); stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(187,68,48); fill-rule: nonzero; opacity: 0.8;\' vector-effect=\'non-scaling-stroke\' x=\'-33.085\' y=\'-33.085\' rx=\'0\' ry=\'0\' width=\'66.17\' height=\'66.17\' /%3E%3C/g%3E%3Cg transform=\'matrix(-6.26 3.21 -2.2 -4.29 123.79 101.52)\' id=\'8234c781-7234-4eb9-8201-c5cff0dfa546\' %3E%3Crect style=\'stroke: rgb(0,0,0); stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(189,189,189); fill-rule: nonzero; opacity: 0.8;\' vector-effect=\'non-scaling-stroke\' x=\'-33.085\' y=\'-33.085\' rx=\'0\' ry=\'0\' width=\'66.17\' height=\'66.17\' /%3E%3C/g%3E%3C/svg%3E")'
const bgTablet =
  'url("data:image/svg+xml,%3C%3Fxml version=\'1.0\' encoding=\'UTF-8\' standalone=\'no\' %3F%3E%3C!DOCTYPE svg PUBLIC \'-//W3C//DTD SVG 1.1//EN\' \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\'%3E%3Csvg xmlns=\'http://www.w3.org/2000/svg\' xmlns:xlink=\'http://www.w3.org/1999/xlink\' version=\'1.1\' width=\'1024\' height=\'868\' viewBox=\'0 0 1024 868\' xml:space=\'preserve\'%3E%3Cdesc%3ECreated with Fabric.js 4.2.0%3C/desc%3E%3Cdefs%3E%3C/defs%3E%3Cg transform=\'matrix(0 0 0 0 0 0)\' id=\'6ee49dfe-e207-47a1-93c5-864b574ca985\' %3E%3C/g%3E%3Cg transform=\'matrix(1 0 0 1 512 434)\' id=\'c620494b-8a07-40ef-b279-c91250c79185\' %3E%3Crect style=\'stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-opacity: 0; fill-rule: nonzero; opacity: 0.8;\' vector-effect=\'non-scaling-stroke\' x=\'-512\' y=\'-434\' rx=\'0\' ry=\'0\' width=\'1024\' height=\'868\' /%3E%3C/g%3E%3Cg transform=\'matrix(16.73 5.89 -2.72 7.73 434.27 809.62)\' id=\'229c97a8-eff8-4a39-a58b-560f3a894ce3\' %3E%3Crect style=\'stroke: rgb(0,0,0); stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(187,68,48); fill-rule: nonzero; opacity: 0.8;\' vector-effect=\'non-scaling-stroke\' x=\'-33.085\' y=\'-33.085\' rx=\'0\' ry=\'0\' width=\'66.17\' height=\'66.17\' /%3E%3C/g%3E%3Cg transform=\'matrix(-16.94 7.22 -3.41 -8.01 415.06 118.14)\' id=\'fea73506-c041-4661-bc6b-89ed00beb47b\' %3E%3Crect style=\'stroke: rgb(0,0,0); stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(189,189,189); fill-rule: nonzero; opacity: 0.8;\' vector-effect=\'non-scaling-stroke\' x=\'-33.085\' y=\'-33.085\' rx=\'0\' ry=\'0\' width=\'66.17\' height=\'66.17\' /%3E%3C/g%3E%3C/svg%3E")'
const bgLaptop =
  'url("data:image/svg+xml,%3C%3Fxml version=\'1.0\' encoding=\'UTF-8\' standalone=\'no\' %3F%3E%3C!DOCTYPE svg PUBLIC \'-//W3C//DTD SVG 1.1//EN\' \'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\'%3E%3Csvg xmlns=\'http://www.w3.org/2000/svg\' xmlns:xlink=\'http://www.w3.org/1999/xlink\' version=\'1.1\' width=\'1600\' height=\'1000\' viewBox=\'0 0 1600 1000\' xml:space=\'preserve\'%3E%3Cdesc%3ECreated with Fabric.js 4.2.0%3C/desc%3E%3Cdefs%3E%3C/defs%3E%3Cg transform=\'matrix(1 0 0 1 800 500)\' id=\'db94a3dc-7261-4668-8875-c0a51af45bd2\' %3E%3Crect style=\'stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-opacity: 0; fill-rule: nonzero; opacity: 0.8;\' vector-effect=\'non-scaling-stroke\' x=\'-800\' y=\'-500\' rx=\'0\' ry=\'0\' width=\'1600\' height=\'1000\' /%3E%3C/g%3E%3Cg transform=\'matrix(0 0 0 0 0 0)\' id=\'c54e4925-8f3f-4039-88ea-7bbf326904e7\' %3E%3C/g%3E%3Cg transform=\'matrix(25.57 10.83 -5.34 12.6 655.5 971.39)\' id=\'ac35c885-7e9f-4ac8-b2c8-58d5324c51de\' %3E%3Crect style=\'stroke: rgb(0,0,0); stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(187,68,48); fill-rule: nonzero; opacity: 0.8;\' vector-effect=\'non-scaling-stroke\' x=\'-33.085\' y=\'-33.085\' rx=\'0\' ry=\'0\' width=\'66.17\' height=\'66.17\' /%3E%3C/g%3E%3Cg transform=\'matrix(-25.83 5.83 -2.13 -9.42 776.88 117.37)\' id=\'bdae82e1-bbe1-41c5-803b-b9ee75216ba2\' %3E%3Crect style=\'stroke: rgb(0,0,0); stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(189,189,189); fill-rule: nonzero; opacity: 0.8;\' vector-effect=\'non-scaling-stroke\' x=\'-33.085\' y=\'-33.085\' rx=\'0\' ry=\'0\' width=\'66.17\' height=\'66.17\' /%3E%3C/g%3E%3C/svg%3E")'

export default function Hero({ title = 'Title', description = 'Description of site' }: { title: string, description: string}): JSX.Element {
  const variant = useBreakpointValue({ base: bgMobile, sm: bgTablet, lg: bgLaptop })
  return (
    <Box
      as="header"
      position="relative"
      height="100vh"
      textAlign="center"
      d="flex"
      alignContent="center"
      _before={{
        backgroundImage: variant,
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '105% 125%',
        content: '""',
        height: '100%',
        width: '100%',
        position: 'absolute'
      }}
    >
      <Box
        mx="auto"
        maxW="600px"
        position="relative"
        w="100%"
        d="flex"
        justifyContent="space-between"
        flexDir="column"
        alignItems="center"
      >
        <Box>
          <Heading as="h1" marginTop="70px">{title}</Heading>
          <Text py="20px" px="30px" fontSize="xs">
            {ReactHtmlParser(description)}
          </Text>
        </Box>
        <Box maxW="200px" w="100%">
          <RawImage />
        </Box>
        <Box my="70px" minH="30px">
          <Button w="fit-content" onClick={scrollDown}>
            Latest <CgMouse /> Episodes
          </Button>

          <List display="flex" justifyContent="space-evenly" alignItems="center" pt="2rem" h="auto">
            <ListItem>
              <Tooltip shouldWrapChildren label="Listen on Spotify" hasArrow fontSize="xs" offset={[0, 15]}>
                <Link href="https://open.spotify.com/show/3QsthThGhfigIwbGHauPfQ" target="_blank" rel="noreferrer noopener">
                  <Icon as={SiSpotify} boxSize={6}/>
                </Link>
              </Tooltip>
            </ListItem>
            <ListItem>
              <Tooltip shouldWrapChildren label="Coming soon to Apple Podcasts!" hasArrow fontSize="xs" offset={[0, 15]}>
                <Button disabled bg="none" _hover={{ bg: 'none' }}>
                  <Icon as={SiApplepodcasts} boxSize={6}/>
                </Button>
              </Tooltip>
            </ListItem>
            <ListItem>
              <Tooltip shouldWrapChildren label="Listen on Google Podcasts" hasArrow fontSize="xs" offset={[0, 15]}>
                <Link href="https://www.google.com/podcasts?feed=aHR0cHM6Ly9hbmNob3IuZm0vcy80NGE0Mjc3Yy9wb2RjYXN0L3Jzcw==" target="_blank" rel="noreferrer noopener">
                  <Icon as={SiGooglepodcasts} boxSize={6}/>
                </Link>
              </Tooltip>
            </ListItem>
          </List>
        </Box>
      </Box>
    </Box>
  )
}
