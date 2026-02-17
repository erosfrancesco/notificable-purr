import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import './App.css'

interface ApiResponse {
  message: string
}

function App() {
  const [name, setName] = useState('World')

  // Example: Fetching health status
  const { data: healthData, isLoading: healthLoading } = useQuery<ApiResponse>({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await fetch('/api/health')
      if (!response.ok) throw new Error('Health check failed')
      return response.json()
    },
  })

  // Example: Fetching personalized greeting
  const { data: greetingData, isLoading: greetingLoading } = useQuery<ApiResponse>({
    queryKey: ['greeting', name],
    queryFn: async () => {
      const response = await fetch(`/api/hello/${encodeURIComponent(name)}`)
      if (!response.ok) throw new Error('Failed to fetch greeting')
      return response.json()
    },
    enabled: name.length > 0,
  })

  return (
    <div className="App">
      <header className="App-header">
        <h1>🐱 Notificable Purr</h1>
        <p>React + TypeScript + Rust + TanStack Query</p>
      </header>

      <main>
        <section className="section">
          <h2>Backend Status</h2>
          {healthLoading ? (
            <p>Checking backend...</p>
          ) : healthData ? (
            <p className="success">✅ {healthData.message}</p>
          ) : (
            <p className="error">❌ Backend is not responding</p>
          )}
        </section>

        <section className="section">
          <h2>Personalized Greeting</h2>
          <div className="input-group">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          {greetingLoading ? (
            <p>Loading...</p>
          ) : greetingData ? (
            <p className="success">👋 {greetingData.message}</p>
          ) : (
            <p>Enter a name to get a greeting</p>
          )}
        </section>

        <section className="section">
          <h2>Technology Stack</h2>
          <ul>
            <li>⚛️ React 18 with TypeScript</li>
            <li>🚀 TanStack Query for data fetching</li>
            <li>🦀 Rust backend with Actix-web</li>
            <li>⚡ Vite for fast development</li>
            <li>🎨 CORS enabled for seamless integration</li>
          </ul>
        </section>
      </main>
    </div>
  )
}

export default App
