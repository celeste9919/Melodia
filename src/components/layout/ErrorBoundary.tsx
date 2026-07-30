import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-app-bg p-8">
          <span className="text-4xl">&#x1F6A7;</span>
          <h1 className="text-xl font-semibold text-app-text">Something went wrong</h1>
          <p className="text-sm text-app-text-secondary">{this.state.error?.message || 'Unknown error'}</p>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
            className="rounded-lg bg-app-primary px-6 py-2 text-sm font-medium text-white hover:bg-app-primary-hover"
          >
            Reload
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
