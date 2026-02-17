import React from 'react'
import { Header } from './layout/Header'
import { Card } from './layout/Card'
import { Text, TextError, TextHeading, TextSubheading, TextSuccess } from './components/Text'
import { List, ListItem } from './layout/List'
import { Page } from './layout/Page'
import { Input } from './components/Input'
import { useHealthStatus } from './hooks/useHealthStatus'
import { useGreeting } from './hooks/useGreeting'
import { Button } from './components/Button'



function App() {
  const { data: healthData, isLoading: healthLoading } = useHealthStatus();
  const { data: greetingData, isLoading: greetingLoading, name, setName,  } = useGreeting('World');


  return (
    <Page Header={<Header>
      <TextHeading>🐱 Notificable Purr</TextHeading>
      <Text>React + Rust + TypeScript + TanStack Query + TailwindCSS (RRTTT)</Text>
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
        <Input type="text"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          placeholder="Enter your name"
        />
        <Button onClick={console.log}>Send</Button>
        <br />
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
          <ListItem>🌐 Tailwind CSS for styling</ListItem>
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
