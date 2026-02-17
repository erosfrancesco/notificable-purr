import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Header } from './layout/Header'
import { Card } from './layout/Card'
import { Text, TextError, TextHeading, TextSubheading, TextSuccess } from './components/Text'
import { List, ListItem } from './layout/List'
import { Page } from './layout/Page'
import { Input } from './components/Input'

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
    <Page Header={<Header>
      <TextHeading>🐱 Notificable Purr</TextHeading>
      <Text>React + TypeScript + Rust + TanStack Query</Text>
    </Header>}>
      <Card>
        <TextSubheading>Backend Status</TextSubheading>
        {healthLoading ? (
          <Text>Checking backend...</Text>
        ) : healthData ? (
          <TextSuccess>✅ {healthData.message}</TextSuccess>
        ) : (
          <TextError>❌ Backend is not responding</TextError>
        )}
      </Card>

      <Card>
        <TextSubheading>Personalized Greeting</TextSubheading>
        <div className="input-group">

          <Input type="text"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="Enter your name"
          />


        </div>
        {greetingLoading ? (
          <Text>Loading...</Text>
        ) : greetingData ? (
          <Text className="text-green">👋 {greetingData.message}</Text>
        ) : (
          <Text>Enter a name to get a greeting</Text>
        )}
      </Card>

      <Card>
        <TextSubheading>Technology Stack</TextSubheading>
        <List className="list-disc list-inside text-start">
          <ListItem>⚛️ React 18 with TypeScript</ListItem>
          <ListItem>🚀 TanStack Query for data fetching</ListItem>
          <ListItem>🦀 Rust backend with Actix-web</ListItem>
          <ListItem>⚡ Vite for fast development</ListItem>
          <ListItem>🎨 CORS enabled for seamless integration</ListItem>
        </List>
      </Card>
    </Page>
  )
}

export default App
