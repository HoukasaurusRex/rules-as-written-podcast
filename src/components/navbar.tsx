import {
  Box,
  Link,
  Flex,
  Spacer,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuGroup,
  MenuDivider,
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react'
import { MoonIcon, SunIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import TransitionLink from 'gatsby-plugin-transition-link/AniLink'
import React from 'react'
import { CgMenu } from '@react-icons/all-files/cg/CgMenu'
import { FaCommentMedical } from '@react-icons/all-files/fa/FaCommentMedical'
import Icon from './icon'

const Navbar: React.FC = () => {
  const { toggleColorMode: toggleMode } = useColorMode()
  const ToggleIcon = useColorModeValue(SunIcon, MoonIcon)
  return (
    <Box
      as="nav"
      position="fixed"
      width="100%"
      height="70px"
      p="5px 10px"
      zIndex="2"
      maxWidth="100vw"
    >
      <Flex>
        <TransitionLink paintDrip to="/" color="unset" duration={0.6}>
          <Box width="50px">
            <Icon />
          </Box>
        </TransitionLink>

        <Spacer />
        <Menu>
          <MenuButton as={Button}>
            <CgMenu />
          </MenuButton>
          <MenuList>
            <MenuItem icon={<ToggleIcon />} onClick={toggleMode}>
              Toggle Theme
            </MenuItem>
            <Link
              href="https://anchor.fm/rules-as-written/message"
              target="_blank"
              rel="noreferrer noopener"
              width="100%"
              _hover={{ textDecor: 'none' }}
            >
              <MenuItem icon={<FaCommentMedical />}>
                Audio Comment
                <ExternalLinkIcon style={{ position: 'relative', float: 'right' }} />
              </MenuItem>
            </Link>
            <MenuDivider />
            <MenuGroup title="Pages">
              <TransitionLink paintDrip to="/" color="unset" duration={0.6}>
                <MenuItem>Home</MenuItem>
              </TransitionLink>
              <TransitionLink paintDrip to="/about" color="unset" duration={0.6}>
                <MenuItem>About</MenuItem>
              </TransitionLink>
              <TransitionLink paintDrip to="/roadmap" color="unset" duration={0.6}>
                <MenuItem>Roadmap</MenuItem>
              </TransitionLink>
              <TransitionLink paintDrip to="/privacy" color="unset" duration={0.6}>
                <MenuItem>Privacy Policy</MenuItem>
              </TransitionLink>
            </MenuGroup>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  )
}

export default Navbar
