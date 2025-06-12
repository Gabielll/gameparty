import React from 'react';
import SceneCanvas from './components/SceneCanvas';
import './App.css'; // Keep App.css for global styles if any

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <SceneCanvas />
    </div>
  );
}

export default App;
