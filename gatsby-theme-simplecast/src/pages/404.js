/** @jsx jsx */
import { jsx, Flex } from "theme-ui"
import SEO from "../components/seo"

const NotFoundPage = () => (
  <Flex sx={{ px: 30, height: '100vh', flexDirection: 'column', justifyContent: 'center' }}>
    <SEO title="404: Not found" />
    <h1>NOT FOUND</h1>
    <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
  </Flex>
)

export default NotFoundPage
