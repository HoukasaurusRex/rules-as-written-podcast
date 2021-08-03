import React from "react"
import GatsbyLink from "gatsby-link"

const Link = ({ children, to, isExternal, ...other }) => {
  const internal = /^\/(?!\/)/.test(to)
  const target = isExternal ? '_blank' : '_self'
  if (internal) {
    return (
      <GatsbyLink to={to} {...other}>
        {children}
      </GatsbyLink>
    )
  }

  return (
    <a href={to} target={target} {...other}>
      {children}
    </a>
  )
}

export default Link
