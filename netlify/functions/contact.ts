import type { Handler } from '@netlify/functions'

const RECIPIENT = 'toby@rulesaswrittenshow.com'
const KEILA_API_URL = 'https://mail.houk.space/api/v1/contacts'
const KEILA_API_KEY = process.env.KEILA_API_KEY ?? ''

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const params = new URLSearchParams(event.body ?? '')
  const name = params.get('name')
  const email = params.get('email')
  const message = params.get('message')

  if (!email || !message) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email and message are required' }) }
  }

  try {
    // Store as a contact with source "contact-form" for tracking
    try {
      await fetch(KEILA_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${KEILA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            email,
            first_name: name ?? '',
            data: { source: 'contact-form', message, contact_date: new Date().toISOString() },
          },
        }),
      })
    } catch (err) {
      console.error('Keila API error:', err)
    }

    // Log for Netlify function logs (viewable in dashboard)
    console.log(`Contact form: ${name} <${email}> - ${message.slice(0, 200)}`)

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, recipient: RECIPIENT }),
    }
  } catch (err) {
    console.error('Contact function error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal error' }) }
  }
}
