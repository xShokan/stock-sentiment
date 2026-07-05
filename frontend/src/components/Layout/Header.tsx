/* Layout - Header with search + add stock */
import { Search, TrendingUp, Plus, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { searchStocks, addCustomStock } from '../../services/api';
import { getCurrentSettings, saveSettings, hasAIKey } from '../../services/aiAnalyzer';

export default function Header() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addCode, setAddCode] = useState('');
  const [addName, setAddName] = useState('');
  const [addMarket, setAddMarket] = useState('a');
  const [addMsg, setAddMsg] = useState('');
  const [showAI, setShowAI] = useState(false);
  const [aiKey, setAiKey] = useState(getCurrentSettings().apiKey);
  const [aiUrl, setAiUrl] = useState(getCurrentSettings().baseUrl);
  const [aiModel, setAiModel] = useState(getCurrentSettings().model);
  const [aiMsg, setAiMsg] = useState('');

  const handleSearch = useCallback(async (keyword: string) => {
    setQ(keyword);
    if (keyword.trim().length < 1) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await searchStocks(keyword.trim());
      setResults(res);
      setShowDropdown(res.length > 0);
    } catch {
      setResults([]);
    }
  }, []);

  const handleSelect = (code: string) => {
    setShowDropdown(false);
    setQ('');
    navigate(`/stock/${code}`);
  };

  const handleAdd = async () => {
    if (!addCode.trim() || !addName.trim()) {
      setAddMsg('代码和名称不能为空');
      return;
    }
    try {
      await addCustomStock(addCode.trim(), addName.trim(), addMarket);
      setAddCode('');
      setAddName('');
      setAddMarket('a');
      setAddMsg('');
      setShowAdd(false);
    } catch (e: any) {
      setAddMsg(e?.response?.data?.detail || '添加失败');
    }
  };

  return (
    <>
      <header style={{
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        padding: '0 16px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }}
          onClick={() => navigate('/')}
        >
          <TrendingUp size={22} color="var(--blue)" />
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.5 }}>
            Stock<span style={{ color: 'var(--blue)' }}>Sense</span>
          </span>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 300, margin: '0 12px' }}>
          <Search size={15} color="var(--text-secondary)"
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
          <input
            type="text"
            placeholder="搜索 NVDA / 茅台 / 00700"
            value={q}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            style={{
              width: '100%', padding: '8px 12px 8px 32px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--bg-primary)',
              color: 'var(--text-primary)', fontSize: 13, outline: 'none', boxSizing: 'border-box',
            }}
          />
          {showDropdown && results.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
              background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)',
              overflow: 'hidden', zIndex: 200, maxHeight: 280, overflowY: 'auto',
            }}>
              {results.map(r => (
                <div key={r.code} onMouseDown={() => handleSelect(r.code)}
                  style={{
                    padding: '8px 12px', cursor: 'pointer', fontSize: 13,
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontWeight: 500 }}>{r.name}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{r.code} · {r.market_label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add stock button + Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <button
            onClick={() => { setShowAdd(true); setAddMsg(''); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 12px', borderRadius: 6, fontSize: 12,
              background: 'var(--blue)', color: '#fff', border: 'none', cursor: 'pointer',
            }}
          >
            <Plus size={14} /> 添加
          </button>
          <a onClick={() => navigate('/')} style={navLinkStyle}>市场情绪</a>
          <a onClick={() => navigate('/market')} style={navLinkStyle}>市场对比</a>
          <span
            onClick={() => { setShowAI(true); setAiKey(getCurrentSettings().apiKey); setAiMsg(''); }}
            style={{ ...navLinkStyle, display: 'flex', alignItems: 'center', gap: 4, color: aiKey ? '#69f0ae' : 'var(--text-secondary)' }}
          >
            <Sparkles size={14} /> AI
          </span>
        </div>
      </header>

      {/* Add Stock Modal */}
      {showAdd && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setShowAdd(false)}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 12, padding: 24,
            width: '90%', maxWidth: 380, border: '1px solid var(--border)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>添加自定义股票</h2>
              <button onClick={() => setShowAdd(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Market tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {[{ k: 'a', l: 'A股' }, { k: 'hk', l: '港股' }, { k: 'us', l: '美股' }].map(m => (
                <button key={m.k} onClick={() => setAddMarket(m.k)}
                  style={{
                    flex: 1, padding: '6px 0', borderRadius: 6, fontSize: 13, fontWeight: 500,
                    border: `1px solid ${addMarket === m.k ? 'var(--blue)' : 'var(--border)'}`,
                    background: addMarket === m.k ? '#448aff22' : 'transparent',
                    color: addMarket === m.k ? 'var(--blue)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >{m.l}</button>
              ))}
            </div>

            {/* Code */}
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
              股票代码
            </label>
            <input
              value={addCode} onChange={e => setAddCode(e.target.value)}
              placeholder={addMarket === 'us' ? '如 AAPL' : addMarket === 'hk' ? '如 00700' : '如 600519'}
              style={inputStyle}
            />

            {/* Name */}
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 4, marginTop: 12 }}>
              股票名称
            </label>
            <input
              value={addName} onChange={e => setAddName(e.target.value)}
              placeholder={addMarket === 'us' ? '如 Apple Inc.' : '如 贵州茅台'}
              style={inputStyle}
            />

            {addMsg && (
              <p style={{ fontSize: 12, color: '#ff6e40', marginTop: 10 }}>{addMsg}</p>
            )}

            <button onClick={handleAdd} style={{
              marginTop: 16, width: '100%', padding: '10px 0', borderRadius: 8,
              background: 'var(--blue)', color: '#fff', border: 'none',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              确认添加
            </button>
          </div>
        </div>
      )}

      {/* AI Settings Modal */}
      {showAI && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1001,
          background: 'rgba(0,0,0,0.6)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setShowAI(false)}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 12, padding: 24,
            width: '90%', maxWidth: 400, border: '1px solid var(--border)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} color="#69f0ae" /> AI 分析设置
              </h2>
              <button onClick={() => setShowAI(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
              支持 OpenAI 及兼容 API（DeepSeek、通义千问等）。API Key 仅储存在浏览器本地。
            </p>

            <label style={labelStyle}>API Base URL</label>
            <input value={aiUrl} onChange={e => setAiUrl(e.target.value)}
              placeholder="https://api.openai.com/v1" style={inputStyle} />

            <label style={{ ...labelStyle, marginTop: 10 }}>API Key</label>
            <input value={aiKey} onChange={e => setAiKey(e.target.value)}
              type="password" placeholder="sk-..." style={inputStyle} />

            <label style={{ ...labelStyle, marginTop: 10 }}>模型</label>
            <select value={aiModel} onChange={e => setAiModel(e.target.value)}
              style={{ ...inputStyle, appearance: 'auto' }}>
              <option value="gpt-4o-mini">gpt-4o-mini</option>
              <option value="gpt-4o">gpt-4o</option>
              <option value="deepseek-chat">deepseek-chat</option>
              <option value="qwen-turbo">qwen-turbo</option>
              <option value="glm-4">glm-4</option>
              <option value="moonshot-v1">moonshot-v1</option>
            </select>

            {aiMsg && <p style={{ fontSize: 12, color: '#ff6e40', marginTop: 10 }}>{aiMsg}</p>}

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={() => setShowAI(false)} style={{
                flex: 1, padding: '10px 0', borderRadius: 8, background: 'var(--bg-primary)',
                color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: 14, cursor: 'pointer',
              }}>取消</button>
              <button onClick={() => {
                saveSettings({ apiKey: aiKey, baseUrl: aiUrl, model: aiModel });
                setShowAI(false);
              }} style={{
                flex: 1, padding: '10px 0', borderRadius: 8, background: 'var(--blue)',
                color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>保存</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const navLinkStyle: React.CSSProperties = {
  color: 'var(--text-secondary)', cursor: 'pointer',
  transition: 'color 0.2s', textDecoration: 'none',
  whiteSpace: 'nowrap', fontSize: 13,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 6,
  border: '1px solid var(--border)', background: 'var(--bg-primary)',
  color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
};
