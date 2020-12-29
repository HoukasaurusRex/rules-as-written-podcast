import React from 'react'
import { Box, useBreakpointValue, Heading, Text, Button } from '@chakra-ui/react'
import { CgMouse } from 'react-icons/cg'
import RawImage from './raw-image'

const scrollDown = () => {
  window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
}

const redSlant =  {
  content: `""`,
  position: 'absolute',
  top: 'calc(50% - 1000px)',
  left: 0,
  width: '500px',
  height: '2000px',
  background: '#bb4430',
  transform: 'skew(-30deg)',
  transformOrigin: 'top'
}

/**
 * 
 * {
  content: "",
  position: fixed,
  top: calc(50% - 1000px),
  left: 0,
  width: 500px,
  height:2000px,
  background: #000,
  transform: skew(-15deg),
  transform-origin:top,
}
 */

// background="#BDBDBD"
const bgWide = `url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no' %3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' width='1080' height='750' viewBox='0 0 1080 750' xml:space='preserve'%3E%3Cdesc%3ECreated with Fabric.js 4.2.0%3C/desc%3E%3Cdefs%3E%3C/defs%3E%3Crect x='0' y='0' width='100%25' height='100%25' fill='transparent'%3E%3C/rect%3E%3Cg transform='matrix(0 0 0 0 0 0)' id='dd60ccc4-f30f-44fe-a10a-543cedb84eb8' %3E%3C/g%3E%3Cg transform='matrix(1 0 0 1 540 375)' id='a8430af2-d138-47ba-ad95-075ded119f52' %3E%3Crect style='stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;' vector-effect='non-scaling-stroke' x='-540' y='-375' rx='0' ry='0' width='1080' height='750' /%3E%3C/g%3E%3Cg transform='matrix(15.94 5.72 -2.62 7.31 465.39 692.24)' id='51e7d258-1b88-4f14-9afd-7da2a335fa2d' %3E%3Crect style='stroke: rgb(0,0,0); stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(187,68,48); fill-rule: nonzero; opacity: 1;' vector-effect='non-scaling-stroke' x='-37.165' y='-37.165' rx='0' ry='0' width='74.33' height='74.33' /%3E%3C/g%3E%3Cg transform='matrix(-18.82 15.95 -7.6 -8.97 259.31 186.65)' id='bfb453be-890c-4473-8b8c-10570b322c51' %3E%3Crect style='stroke: rgb(0,0,0); stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(189,189,189); fill-rule: nonzero; opacity: 1;' vector-effect='non-scaling-stroke' x='-33.085' y='-33.085' rx='0' ry='0' width='66.17' height='66.17' /%3E%3C/g%3E%3C/svg%3E")`
const bgTall = `url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no' %3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' width='500' height='1000' viewBox='0 0 500 1000' xml:space='preserve'%3E%3Cdesc%3ECreated with Fabric.js 4.2.0%3C/desc%3E%3Cdefs%3E%3C/defs%3E%3Crect x='0' y='0' width='100%25' height='100%25' fill='transparent'%3E%3C/rect%3E%3Cg transform='matrix(1 0 0 1 250 500)' id='a8430af2-d138-47ba-ad95-075ded119f52' %3E%3Crect style='stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(255,255,255); fill-rule: nonzero; opacity: 1;' vector-effect='non-scaling-stroke' x='-250' y='-500' rx='0' ry='0' width='500' height='1000' /%3E%3C/g%3E%3Cg transform='matrix(Infinity NaN NaN Infinity 0 0)' id='dd60ccc4-f30f-44fe-a10a-543cedb84eb8' %3E%3C/g%3E%3Cg transform='matrix(9.33 3.35 -2.8 7.81 177.19 898.63)' id='51e7d258-1b88-4f14-9afd-7da2a335fa2d' %3E%3Crect style='stroke: rgb(0,0,0); stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(187,68,48); fill-rule: nonzero; opacity: 1;' vector-effect='non-scaling-stroke' x='-37.167' y='-37.167' rx='0' ry='0' width='74.334' height='74.334' /%3E%3C/g%3E%3Cg transform='matrix(-12.13 10.28 -6.92 -8.17 39.93 163.91)' id='bfb453be-890c-4473-8b8c-10570b322c51' %3E%3Crect style='stroke: rgb(0,0,0); stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-dashoffset: 0; stroke-linejoin: miter; stroke-miterlimit: 4; fill: rgb(189,189,189); fill-rule: nonzero; opacity: 1;' vector-effect='non-scaling-stroke' x='-33.0835' y='-33.0835' rx='0' ry='0' width='66.167' height='66.167' /%3E%3C/g%3E%3C/svg%3E")`

export default function Hero({
  title = 'Title',
  description = 'Description of site',
}) {
  const variant = useBreakpointValue({ base: bgTall, sm: bgWide })
  return (
    <Box
      as="header"
      background="#fff"
      height="100vh"
      width="100%"
      maxWidth="100vw"
      textAlign="center"
      d="flex"
      alignContent="center"
      _before={{
        backgroundImage: variant,
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        content: `""`,
        height: '125vh',
        width: '135vw',
        position: 'absolute',
        top: '-25vh',
        left: '-25vw'
      }}
    >
      <Box maxW="600px" m="auto" position="relative">
        <Heading color="black">{title}</Heading>
        <Text padding="50px" color="black">{description}</Text>
        <Box maxW="200px" m="auto"><RawImage /></Box>
        <Button marginTop="50px" onClick={scrollDown}>
          Latest <CgMouse /> Episodes
        </Button>
      </Box>
      {/* <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '10vw',
        fill: '#bb4430'
      }}>
        <polygon points="0,100 100,0 100,100" />
      </svg> */}
    </Box>
  )
}
