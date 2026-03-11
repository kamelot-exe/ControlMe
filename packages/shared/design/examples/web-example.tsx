/**
 * Web Components Usage Examples
 */

import React, { useState } from 'react';
import { Card, Button, Input, Badge } from '../components/web';
import { tokens } from '../tokens';

export const WebExamples: React.FC = () => {
  const [inputValue, setInputValue] = useState('');

  return (
    <div
      style={{
        padding: tokens.spacing[8],
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        fontFamily: tokens.typography.fontFamily.sans.join(', '),
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: tokens.colors.text.inverse, marginBottom: tokens.spacing[6] }}>
          Design System Examples
        </h1>

        {/* Cards */}
        <div style={{ marginBottom: tokens.spacing[8] }}>
          <h2 style={{ color: tokens.colors.text.inverse, marginBottom: tokens.spacing[4] }}>
            Cards
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[4] }}>
            <Card variant="light" shadow="sm">
              <div style={{ padding: tokens.spacing[4] }}>
                <h3>Light Card</h3>
                <p style={{ color: tokens.colors.text.secondary }}>
                  Glassmorphism light variant
                </p>
              </div>
            </Card>
            <Card variant="medium" shadow="md">
              <div style={{ padding: tokens.spacing[4] }}>
                <h3>Medium Card</h3>
                <p style={{ color: tokens.colors.text.secondary }}>
                  Glassmorphism medium variant
                </p>
              </div>
            </Card>
            <Card variant="dark" shadow="lg">
              <div style={{ padding: tokens.spacing[4] }}>
                <h3>Dark Card</h3>
                <p style={{ color: tokens.colors.text.secondary }}>
                  Glassmorphism dark variant
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ marginBottom: tokens.spacing[8] }}>
          <h2 style={{ color: tokens.colors.text.inverse, marginBottom: tokens.spacing[4] }}>
            Buttons
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[3] }}>
            <Button variant="primary" color="primary" size="md">
              Primary
            </Button>
            <Button variant="secondary" color="primary" size="md">
              Secondary
            </Button>
            <Button variant="ghost" color="primary" size="md">
              Ghost
            </Button>
            <Button variant="glass" size="md">
              Glass
            </Button>
            <Button variant="primary" color="secondary" size="sm">
              Small
            </Button>
            <Button variant="primary" color="tertiary" size="lg">
              Large
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </div>

        {/* Inputs */}
        <div style={{ marginBottom: tokens.spacing[8] }}>
          <h2 style={{ color: tokens.colors.text.inverse, marginBottom: tokens.spacing[4] }}>
            Inputs
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], maxWidth: '400px' }}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              fullWidth
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              fullWidth
            />
            <Input
              label="Error State"
              helperText="This field is required"
              error
              fullWidth
            />
            <Input
              size="sm"
              placeholder="Small input"
              fullWidth
            />
            <Input
              size="lg"
              placeholder="Large input"
              fullWidth
            />
          </div>
        </div>

        {/* Badges */}
        <div style={{ marginBottom: tokens.spacing[8] }}>
          <h2 style={{ color: tokens.colors.text.inverse, marginBottom: tokens.spacing[4] }}>
            Badges
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[3] }}>
            <Badge variant="accent" color="primary">Primary</Badge>
            <Badge variant="accent" color="secondary">Secondary</Badge>
            <Badge variant="accent" color="tertiary">Tertiary</Badge>
            <Badge variant="semantic" color="success">Success</Badge>
            <Badge variant="semantic" color="warning">Warning</Badge>
            <Badge variant="semantic" color="error">Error</Badge>
            <Badge variant="semantic" color="info">Info</Badge>
            <Badge variant="glass">Glass</Badge>
            <Badge size="sm">Small</Badge>
            <Badge size="lg">Large</Badge>
          </div>
        </div>

        {/* Combined Example */}
        <div style={{ marginBottom: tokens.spacing[8] }}>
          <h2 style={{ color: tokens.colors.text.inverse, marginBottom: tokens.spacing[4] }}>
            Combined Example
          </h2>
          <Card variant="medium" shadow="lg" rounded="xl">
            <div style={{ padding: tokens.spacing[6] }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
                <h3 style={{ margin: 0 }}>Task Item</h3>
                <Badge variant="semantic" color="success">Completed</Badge>
              </div>
              <p style={{ color: tokens.colors.text.secondary, marginBottom: tokens.spacing[4] }}>
                This is a task description with glassmorphism styling.
              </p>
              <div style={{ display: 'flex', gap: tokens.spacing[3] }}>
                <Button variant="primary" size="sm">Edit</Button>
                <Button variant="ghost" size="sm">Delete</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

