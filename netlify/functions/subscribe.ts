import type { Handler } from '@netlify/functions'

const KEILA_API_URL = 'https://mail.houk.space/api/v1/contacts'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const apiKey = process.env.KEILA_API_KEY
  if (!apiKey) {
    console.error('KEILA_API_KEY is not configured')
    return { statusCode: 500, body: 'Internal error' }
  }

  const params = new URLSearchParams(event.body ?? '')
  const email = params.get('email')
  if (!email) {
    return { statusCode: 400, body: 'Email required' }
  }

  try {
    const res = await fetch(KEILA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        data: {
          email,
          data: { source: 'rulesaswritten.com' },
        },
      }),
    })

    if (res.status === 201 || res.status === 200) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ already_subscribed: false }),
      }
    }

    if (res.status === 422) {
      try {
        await fetch(
          `${KEILA_API_URL}/${encodeURIComponent(email)}/data?id_type=email`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({ data: { source: 'rulesaswritten.com' } }),
          },
        )
      } catch (err) {
        console.error('PATCH source update failed:', err)
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ already_subscribed: true }),
      }
    }

    return { statusCode: 502, body: 'Subscription failed' }
  } catch (err) {
    console.error('Subscribe error:', err)
    return { statusCode: 500, body: 'Internal error' }
  }
}
