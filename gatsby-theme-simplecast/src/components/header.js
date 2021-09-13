/** @jsx jsx */
import { jsx, useThemeUI, Box, Flex, Image, Link } from "theme-ui"
import { FaPlay as PlayIcon } from "react-icons/fa"
import VisuallyHidden from "@reach/visually-hidden"
import rawLogoFancy from '../images/raw-logo-fancy.webp'

function Header({ context, episode, image }) {
  const themeContext = useThemeUI()
  const { theme } = themeContext
  return (
    <Box
      as="header"
      sx={{
        ...theme.styles.Header,
        backgroundImage: image
          ? "none"
          : `linear-gradient(224deg, ${theme.colors.primaryLighten50} 0%, ${theme.colors.primaryDarken} 100%)`
      }}
    >
      {image && (
        <Image
          alt={episode.title}
          src={image}
          sx={{ objectFit: 'cover', borderRadius: ['none', '0 0 10px 0'], maxHeight: '100%', filter: `${theme.colors.imageFilter}` }}
        />
      )}
      <Box className="header_content">
        <Image src={rawLogoFancy} sx={{ maxWidth: '25%', position: 'absolute', left: 0, top: 0 }} />
        <Flex
          sx={{
            height: "100%",
            width: "100%",
            alignItems: "flex-end",
            flexDirection: "row",
            pb: 8,
          }}
        >
          <Flex sx={{ width: "100%" }}>
            <button onClick={() => context.setCurrentPlaying(episode)}>
              <VisuallyHidden>Play</VisuallyHidden>
              <PlayIcon aria-hidden="true" />
            </button>
            <div>
              <h1>{episode.title}</h1>
              <h5>EP{episode.number}</h5>
            </div>
          </Flex>
        </Flex>
      </Box>
    </Box>
  )
}

export default Header
