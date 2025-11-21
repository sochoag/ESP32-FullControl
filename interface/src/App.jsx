import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [color, setColor] = useState("#000000")
  const [connectionStatus, setConnectionStatus] = useState("Desconectado 🔴")
  
  // Usamos useRef para mantener la conexión WebSocket persistente
  const ws = useRef(null);

  useEffect(() => {
    // 1. Determinar la dirección del WebSocket dinámicamente
    // Esto sirve tanto si entras por IP como por 'esp32s3.local'
    const hostname = window.location.hostname; 
    const wsUrl = `ws://${hostname}/ws`;
    
    console.log("Conectando a:", wsUrl);
    ws.current = new WebSocket(wsUrl);

    // 2. Eventos del Socket
    ws.current.onopen = () => {
      console.log("WebSocket Conectado");
      setConnectionStatus("Conectado 🟢");
    };

    ws.current.onclose = () => {
      console.log("WebSocket Desconectado");
      setConnectionStatus("Desconectado 🔴");
    };

    // Limpieza al cerrar la app
    return () => {
      if(ws.current) ws.current.close();
    }
  }, []);

  const handleColorChange = (event) => {
    const hex = event.target.value;
    setColor(hex);

    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);

    // 3. ENVIAR DATOS POR SOCKET
    // Solo enviamos si la conexión está abierta (readyState === 1)
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ r, g, b });
      ws.current.send(message);
    }
  };

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px', 
      fontFamily: 'Arial', backgroundColor: '#222', height: '100vh', color: 'white'
    }}>
      <h1>Control WebSocket S3</h1>
      
      {/* Indicador de estado */}
      <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
        Estado: {connectionStatus}
      </p>

      <div style={{
        padding: '20px', backgroundColor: '#333', borderRadius: '15px', textAlign: 'center'
      }}>
        <p>Mueve el color libremente:</p>
        
        <input 
          type="color" 
          value={color} 
          onChange={handleColorChange}
          style={{
            width: '100px', height: '100px', cursor: 'pointer', 
            border: 'none', background: 'none'
          }} 
        />
      </div>
    </div>
  )
}

export default App