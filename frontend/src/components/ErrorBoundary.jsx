import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Rewards component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Something went wrong</h2>
          <div className="text-red-600">
            Please try refreshing the page. If the problem persists, contact support.
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 