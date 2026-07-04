/* App - Router Setup */
import { Component } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import StockDetail from './pages/StockDetail';
import MarketOverview from './pages/MarketOverview';

// 全局错误边界 — 捕获渲染时崩溃，防止白屏
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  componentDidCatch(error: Error) {
    console.error('App ErrorBoundary caught:', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', minHeight: '100vh', background: '#0f1117',
          color: '#e8eaed', padding: 24, textAlign: 'center', gap: 16,
        }}>
          <AlertTriangle size={48} color="#ff6e40" />
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>页面加载异常</h2>
          <p style={{ fontSize: 13, color: '#9aa0b0', maxWidth: 400 }}>
            {this.state.error || '应用渲染时发生错误，请刷新页面重试'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8, padding: '10px 24px', borderRadius: 8,
              background: '#448aff', color: '#fff', border: 'none',
              fontSize: 14, cursor: 'pointer',
            }}
          >
            刷新页面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Header />
        <main style={{ minHeight: 'calc(100vh - 56px)' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stock/:code" element={<StockDetail />} />
            <Route path="/market" element={<MarketOverview />} />
          </Routes>
        </main>
      </HashRouter>
    </ErrorBoundary>
  );
}
