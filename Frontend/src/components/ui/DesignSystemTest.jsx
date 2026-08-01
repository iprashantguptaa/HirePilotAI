// ============================================================================
// HirePilot AI Design System - Integration Test
// This file verifies all components can be imported and used together
// ============================================================================

import React, { useState } from 'react'
import {
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Skeleton,
  SkeletonCard,
  EmptyState,
  Modal,
  Badge,
  Alert,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  StatCard,
  Sparkline,
  ProgressBar
} from './index'

// This component is for testing only - verifies all imports work
export const DesignSystemTest = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>HirePilot AI Design System - Component Test</h1>
      
      {/* Buttons */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Buttons</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button loading>Loading</Button>
        </div>
      </section>

      {/* Inputs */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Inputs</h2>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <Textarea
          label="Description"
          placeholder="Enter description..."
          rows={4}
        />
      </section>

      {/* Cards */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Cards</h2>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          <Card variant="default" hoverable>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>With hover effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card content goes here</p>
            </CardContent>
          </Card>
          
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
            </CardHeader>
            <CardContent>
              <p>With shadow</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Badges */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Badges</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Badge variant="default">Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="info">Info</Badge>
        </div>
      </section>

      {/* Alerts */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Alerts</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Alert variant="success" title="Success">Operation completed successfully</Alert>
          <Alert variant="warning" title="Warning">Please review your input</Alert>
          <Alert variant="error" title="Error">Something went wrong</Alert>
          <Alert variant="info" title="Info">Here's some information</Alert>
        </div>
      </section>

      {/* Tabs */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Tabs</h2>
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" contentValue="tab1">Content 1</TabsContent>
          <TabsContent value="tab2" contentValue="tab2">Content 2</TabsContent>
          <TabsContent value="tab3" contentValue="tab3">Content 3</TabsContent>
        </Tabs>
      </section>

      {/* Modal */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Modal</h2>
        <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Test Modal"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
            </>
          }
        >
          <p>This is a modal dialog.</p>
        </Modal>
      </section>

      {/* Skeleton */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Skeleton</h2>
        <SkeletonCard height="200px" />
      </section>

      {/* Empty State */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Empty State</h2>
        <EmptyState
          title="No data available"
          description="Try adding some content to get started."
        />
      </section>

      {/* Legacy Components */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Legacy Components (Refactored)</h2>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <StatCard label="Total Users" value="1,234" />
          <StatCard label="Active Sessions" value="567" />
        </div>
        <ProgressBar label="Progress" value={75} />
        <Sparkline values={[10, 20, 15, 30, 25, 40, 35, 50]} />
      </section>
    </div>
  )
}

export default DesignSystemTest
