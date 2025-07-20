// Minimal React app to test if the issue is with React itself
function MinimalApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Minimal Test App</h1>
      <p>If you can see this, React is working properly.</p>
      <button onClick={() => alert('Button clicked!')}>Test Button</button>
    </div>
  );
}

export default MinimalApp;