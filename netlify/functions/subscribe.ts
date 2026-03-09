import type { Handler } from '@netlify/functions'

const KEILA_API_URL = 'https://mail.houk.space/api/v1/contacts'
const KEILA_API_KEY = process.env.KEILA_API_KEY ?? ''

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const params = new URLSearchParams(event.body ?? '')
  const email = params.get('email')
  if (!email) {
    return { statusCode: 400, body: 'Email required' }
  }

  const source = params.get('source') ?? ''

  try {
    const res = await fetch(KEILA_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KEILA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          email,
          data: { source },
        },
      }),
    })

    if (res.status === 201 || res.status === 200) {
      return { statusCode: 200, body: 'OK' }
    }

    const responseText = await res.text()

    // Check if this is a duplicate contact (Keila returns 400 or 422 with "email" error)
    const isDuplicate = (res.status === 400 || res.status === 422) && responseText.includes('email')
    if (isDuplicate) {
      // Best-effort update of source data
      fetch(`${KEILA_API_URL}/${encodeURIComponent(email)}/data?id_type=email`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${KEILA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: { source } }),
      }).catch(() => {})

      return { statusCode: 200, body: JSON.stringify({ already_subscribed: true }) }
    }

    // Client errors (validation failures) pass through as 400
    // Server/upstream errors pass through as 502
    const statusCode = res.status >= 400 && res.status < 500 ? 400 : 502
    console.error('Keila responded with', res.status, responseText.slice(0, 500))
    return { statusCode, body: JSON.stringify({ error: 'Subscription failed', status: res.status }) }
  } catch (err) {
    console.error('Subscribe function error:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal error' }) }
  }
}
