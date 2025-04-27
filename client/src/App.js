import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [mensaje, setMensaje] = useState('Cargando…');

  useEffect(() => {
    axios.get('/api')
      .then(res => setMensaje(res.data))
      .catch(() => setMensaje('Error al conectar al servidor'));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>{mensaje}</h1>
    </div>
  );
}

export default App;

