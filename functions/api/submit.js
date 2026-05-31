export async function onRequest(context) {
  const { request, env } = context

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let hodnoceni, coSeLibilo, coZlepsit
  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const body = await request.json()
    hodnoceni = body.hodnoceni
    coSeLibilo = body.co_se_libilo
    coZlepsit = body.co_zlepsit
  } else {
    const fd = await request.formData()
    hodnoceni = fd.get('hodnoceni')
    coSeLibilo = fd.get('co_se_libilo')
    coZlepsit = fd.get('co_zlepsit')
  }

  if (!hodnoceni || !coSeLibilo || !coZlepsit) {
    return new Response(JSON.stringify({ error: 'All fields are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const id = crypto.randomUUID()
  const timestamp = Date.now()
  const submission = {
    id,
    timestamp,
    hodnoceni: hodnoceni.trim(),
    co_se_libilo: coSeLibilo.trim(),
    co_zlepsit: coZlepsit.trim(),
  }

  try {
    await env.FORM_SUBMISSIONS.put(
      `submission:${timestamp}:${id}`,
      JSON.stringify(submission)
    )

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to save submission' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
