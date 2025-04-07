import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import Dashboard from './components/Dashboard';
import { checkAPIHealth } from './api/api';
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000, // 30 seconds
    },
  },
});

const App: React.FC = () => {
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const healthy = await checkAPIHealth();
        setApiHealthy(healthy);
      } catch (error) {
        setApiHealthy(false);
        console.error('Failed to check API health:', error);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
          <div className="api-status loading">
            <div className="spinner"></div>
            <p>Connecting to server...</p>
          </div>
      );
    }

    if (apiHealthy === false) {
      return (
          <div className="api-status error">
            <h2>Server Connection Error</h2>
            <p>
              Unable to connect to the backend server. Please check if the server is running and
              refresh the page.
            </p>
            <button onClick={() => window.location.reload()}>Retry Connection</button>
          </div>
      );
    }

    return <Dashboard />;
  };

  return (
      <QueryClientProvider client={queryClient}>
        <div className="App">
          <header className="App-header">
            <h1>Ontario Operations Dashboard</h1>
          </header>
          <main>{renderContent()}</main>
          <footer>
            <p>© {new Date().getFullYear()} Everest Technologies Inc</p>
            <p className="version">Version 1.0.0</p>
          </footer>
        </div>
      </QueryClientProvider>
  );
};

export default App;