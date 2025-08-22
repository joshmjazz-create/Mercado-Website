// Minimal App.tsx for debugging - bypasses all complex components

function MinimalApp() {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '3rem', color: '#daa520', marginBottom: '2rem' }}>
        Joshua Mercado
      </h1>
      <div style={{ fontSize: '1.5rem', color: '#b19cd9', marginBottom: '2rem' }}>
        Jazz Trumpet & Composition
      </div>
      <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px' }}>
        <h2 style={{ color: '#daa520', marginBottom: '1rem' }}>Debug Information</h2>
        <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
          <div>React App: ✅ Rendering Successfully</div>
          <div>JavaScript: ✅ Executing</div>
          <div>CSS: ✅ Styling Applied</div>
          <div>Environment: {import.meta.env.NODE_ENV || 'development'}</div>
          <div>Mode: {import.meta.env.MODE || 'development'}</div>
          <div>Google API Key: {import.meta.env.VITE_GOOGLE_API_KEY ? '✅ Present' : '❌ Missing'}</div>
        </div>
      </div>
      <div style={{ marginTop: '2rem', padding: '20px', backgroundColor: 'rgba(218, 165, 32, 0.1)', borderRadius: '8px' }}>
        <strong>Status:</strong> Minimal app working correctly. Issue is with complex components or routing.
      </div>
    </div>
  );
}

export default MinimalApp;