/** @jsx jsx */
import { useState } from 'react'
import { jsx, Input, Box, Button, Alert, Close, Spinner } from 'theme-ui'
import addToMailchimp from 'gatsby-plugin-mailchimp'
import { trackEvent } from '../utils'
import theme from '../theme'

const Newsletter = () => {
  const [name, setName] = useState()
  const [email, setEmail] = useState()
  const [shouldDisplayToast, setShouldDisplayToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState('error')
  const [sendingRequest, setSendingRequest] = useState(false)
  const updateName = e => {
    setName(e.target.value)
  }
  const updateEmail = e => {
    setEmail(e.target.value)
  }
  const hideToast = e => {
    e.preventDefault()
    setShouldDisplayToast(false)
  }
  const handleSubmit = async e => {
    e.preventDefault()
    let msg
    let result
    try {
      setSendingRequest(true)
      setShouldDisplayToast(false)
      trackEvent('Subscribe', { value: email })
      const response = await addToMailchimp(email, {
        PATHNAME: window.location.pathname,
        'group[177126][2]': '2'
      })
      result = response.result
      msg = response.msg || 'Success! Thanks for subscribing'
    } catch (error) {
      msg = error.message || 'Something went wrong. Please refresh and try again'
    } finally {
      setToastVariant(result === 'success' ? 'success' : 'error')
      setToastMessage(msg)
      setShouldDisplayToast(true)
      setSendingRequest(false)
    }
  }

  return (
    <Box as="form" onSubmit={handleSubmit} mb={10}>
      <Input
        type="email"
        name="email"
        id="email"
        value={email}
        onChange={updateEmail}
        placeholder='janedoe@gmail.com'
        sx={{
          mx: 'auto',
          my: 3,
          maxWidth: 500
        }}
      />
      <Button
        type='submit'
        disabled={sendingRequest}
        sx={{
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          height: '60px',
          fontWeight: 'bold',
          ':hover': {
            filter: 'opacity(0.9)'
          }
        }}>
        {sendingRequest ? <Spinner variant='styles.spinner'/> : 'Subscribe'}
      </Button>
      <Alert
        variant={toastVariant}
        sx={{
          position: 'fixed',
          top: 5,
          mx: 'auto',
          filter: `opacity(${shouldDisplayToast ? 1 : 0})`,
          transform: `translateY(${shouldDisplayToast ? 0 : -20}px)`,
          transition: 'all 0.2s ease',
          maxWidth: 500,
          display: 'flex',
          alignItems: 'self-start',
          boxShadow: theme.colors.shadow,
          zIndex: 1
        }}
      >
        <Box dangerouslySetInnerHTML={{ __html: toastMessage }}></Box>
        <Close 
          onClick={hideToast}
          sx={{
            ml: 'auto',
            mr: -2,
            cursor: 'pointer',
            minWidth: '50px'
          }}/>
      </Alert>
    </Box>
  )
}

export default Newsletter
