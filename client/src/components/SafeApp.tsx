import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// Safe wrapper component that catches all errors including useRef issues
class SafeApp extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.warn('Safe error boundary caught:', error.message);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error but don't let it break the app
    console.warn('Error boundary details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Simple fallback UI that doesn't use any complex React features
      return (
        <div style={{ 
          minHeight: '100vh', 
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <h1 style={{ marginBottom: '1rem', color: '#333' }}>Homeschool Planner</h1>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              Welcome to your education management platform
            </p>
            <a 
              href="/api/login"
              style={{
                display: 'inline-block',
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            >
              Sign In with Replit
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SafeApp;