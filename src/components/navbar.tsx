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
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react'

import { MoonIcon, SunIcon, ExternalLinkIcon } from '@chakra-ui/icons'

import { Link as GatsbyLink } from 'gatsby'
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
      zIndex="1"
      maxWidth="100vw"
    >
      <Flex>
        <Link as={GatsbyLink} to="/">
          <Box width="50px">
            <Icon />
          </Box>
        </Link>

        <Spacer />
        <Menu>
          <MenuButton as={Button}>
            <CgMenu />
          </MenuButton>
          <MenuList>
            <Link
              href="https://anchor.fm/rules-as-written/message"
              target="_blank"
              rel="noreferrer noopener"
              width="100%"
            >
              <MenuItem icon={<FaCommentMedical />}>
                Make Audio Comment
                <ExternalLinkIcon style={{ position: 'relative', float: 'right' }} />
              </MenuItem>
            </Link>
            <MenuItem icon={<ToggleIcon />} onClick={toggleMode}>
              Toggle Theme
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  )
}

export default Navbar
