const ADMIN_KEY = 'gril2026'

export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const key = url.searchParams.get('key')

  if (key !== ADMIN_KEY) {
    return new Response(renderLogin(), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  try {
    const list = await env.FORM_SUBMISSIONS.list({ prefix: 'submission:' })

    const submissions = []
    for (const k of list.keys) {
      const val = await env.FORM_SUBMISSIONS.get(k.name)
      if (val) submissions.push(JSON.parse(val))
    }

    submissions.sort((a, b) => b.timestamp - a.timestamp)

    return new Response(renderResults(submissions), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (err) {
    return new Response(renderError(err), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
}

function renderLogin() {
  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Přístup zamítnut</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f3f4f6; display: flex; align-items: center;
      justify-content: center; min-height: 100vh; margin: 0; padding: 20px;
    }
    .box {
      background: #fff; border-radius: 16px; padding: 40px;
      max-width: 400px; width: 100%; text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
    }
    h1 { font-size: 20px; color: #111827; margin-bottom: 16px; }
    input {
      width: 100%; padding: 12px 16px; border: 1.5px solid #d1d5db;
      border-radius: 10px; font-size: 15px; margin-bottom: 16px;
      box-sizing: border-box;
    }
    button {
      width: 100%; padding: 14px; background: #6366f1; color: #fff;
      border: none; border-radius: 10px; font-size: 16px;
      font-weight: 600; cursor: pointer;
    }
    button:hover { background: #4f46e5; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Admin - Výsledky</h1>
    <form method="GET">
      <input type="password" name="key" placeholder="Admin klíč" required>
      <button type="submit">Přejít do výsledků</button>
    </form>
  </div>
</body></html>`
}

function renderResults(submissions) {
  const rows = submissions.map(s => {
    const d = new Date(s.timestamp)
    const dateStr = d.toLocaleDateString('cs-CZ', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
    return `<tr>
      <td>${dateStr}</td>
      <td>${esc(s.hodnoceni)}</td>
      <td>${esc(s.co_se_libilo)}</td>
      <td>${esc(s.co_zlepsit)}</td>
    </tr>`
  }).join('')

  const avg = submissions.length > 0
    ? (submissions.reduce((a, s) => a + parseInt(s.hodnoceni), 0) / submissions.length).toFixed(1)
    : '—'

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Výsledky - Grilovačka 2026</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f3f4f6; padding: 20px; margin: 0;
    }
    .container { max-width: 900px; margin: 0 auto; }
    h1 { font-size: 24px; color: #111827; margin-bottom: 8px; }
    .sub { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
    .summary { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .card {
      background: #fff; border-radius: 12px; padding: 20px;
      flex: 1; min-width: 150px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1); text-align: center;
    }
    .card-value { font-size: 28px; font-weight: 700; color: #6366f1; }
    .card-label { font-size: 13px; color: #6b7280; margin-top: 4px; }
    table {
      width: 100%; border-collapse: collapse; background: #fff;
      border-radius: 12px; overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
    }
    th {
      background: #6366f1; color: #fff; padding: 12px 16px;
      text-align: left; font-size: 14px; font-weight: 600;
    }
    td {
      padding: 12px 16px; border-bottom: 1px solid #e5e7eb;
      font-size: 14px; color: #374151;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f9fafb; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Výsledky - Grilovačka 2026</h1>
    <p class="sub">Celkem ${submissions.length} hodnocení</p>
    <div class="summary">
      <div class="card">
        <div class="card-value">${submissions.length}</div>
        <div class="card-label">Počet odpovědí</div>
      </div>
      <div class="card">
        <div class="card-value">${avg}</div>
        <div class="card-label">Průměrné hodnocení</div>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Datum</th>
          <th>Hodnocení</th>
          <th>Líbilo se</th>
          <th>Zlepšit</th>
        </tr>
      </thead>
      <tbody>
        ${rows || '<tr><td colspan="4" style="text-align:center;color:#9ca3af;padding:40px">Zatím žádná hodnocení</td></tr>'}
      </tbody>
    </table>
  </div>
</body></html>`
}

function renderError(err) {
  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chyba</title>
  <style>
    body { font-family: sans-serif; background: #fef2f2; padding: 40px; }
    h1 { color: #dc2626; }
    pre { background: #fff; padding: 16px; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>Chyba</h1>
  <pre>${esc(err.message || err)}</pre>
</body></html>`
}

function esc(text) {
  if (!text) return ''
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
