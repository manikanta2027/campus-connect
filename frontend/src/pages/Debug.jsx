import { useEffect, useState } from 'react'

/**
 * Diagnostic page to check API connectivity
 * Add this to your routes: <Route path="/debug" element={<Debug />} />
 */
export default function Debug() {
  const [apiUrl, setApiUrl] = useState('')
  const [backendStatus, setBackendStatus] = useState('checking...')
  const [corsTest, setCorsTest] = useState('checking...')

  useEffect(() => {
    const url = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    setApiUrl(url)

    // Test backend health
    fetch(`${url}/health`)
      .then(r => r.json())
      .then(d => setBackendStatus(`✅ OK - ${JSON.stringify(d)}`))
      .catch(e => setBackendStatus(`❌ FAILED - ${e.message}`))

    // Test CORS
    fetch(`${url.replace('/api', '')}/`, {
      headers: { 'Accept': 'application/json' }
    })
      .then(r => setCorTest(`✅ Root OK - Status ${r.status}`))
      .catch(e => setCorsTest(`❌ Root FAILED - ${e.message}`))
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🔍 Campus Connect Diagnostic</h2>
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <p><strong>API URL:</strong></p>
        <code>{apiUrl}</code>
        <p style={{ fontSize: '12px', color: '#666' }}>
          Set VITE_API_URL environment variable to override (currently: {import.meta.env.VITE_API_URL || 'not set'})
        </p>
      </div>
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <p><strong>Backend Health Check:</strong></p>
        <code>{backendStatus}</code>
      </div>
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <p><strong>CORS Test:</strong></p>
        <code>{corsTest}</code>
      </div>
      <hr />
      <p style={{ fontSize: '12px', color: '#666' }}>
        If you see errors, check:<br/>
        1. Backend is running<br/>
        2. VITE_API_URL is set correctly in Render<br/>
        3. Backend CORS allows frontend origin<br/>
        4. Backend certificate is valid (if using HTTPS)
      </p>
    </div>
  )
}
