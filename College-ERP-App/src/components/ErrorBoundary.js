import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#fecaca' }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#b91c1c', marginBottom: 10 }}>App Crashed!</Text>
          <Text style={{ fontSize: 16, color: '#991b1b', marginBottom: 10 }}>{this.state.error?.toString()}</Text>
          <Text style={{ fontSize: 12, color: '#7f1d1d' }}>{this.state.errorInfo?.componentStack}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}
