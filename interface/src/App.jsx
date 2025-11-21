import { useState, useEffect, useRef } from 'react'
import './App.css'

// Función auxiliar: Convierte RGB (0-255) a Hex string (#RRGGBB)
const rgbToHex = (r, g, b) => {
  const toHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return "#" + toHex(r) + toHex(g) + toHex(b);
}

function App() {
  const [color, setColor] = useState("#000000")
  const [status, setStatus] = useState({
    rssi: 0,
    uptime: 0,
    heap: 0,
    connected: false
  })
  
  const ws = useRef(null);

  useEffect(() => {
    const hostname = window.location.hostname; 
    // Si estamos en desarrollo (localhost), asume la IP del ESP32 (cambiala si es necesario)
    // Si estamos en producción (cargado desde el ESP32), usa su propio hostname.
    const wsUrl = `ws://${hostname === 'localhost' ? '192.168.1.45' : hostname}/ws`;
    
    console.log("Conectando a:", wsUrl);
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setStatus(prev => ({...prev, connected: true}));
    };

    ws.current.onclose = () => {
      setStatus(prev => ({...prev, connected: false}));
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // 1. Actualizar Telemetría
        setStatus(prev => ({
          ...prev,
          rssi: data.rssi,
          uptime: data.uptime,
          heap: data.heap
        }));

        // 2. Actualizar Color (Sincronización Bidireccional)
        // Solo actualizamos si vienen los datos R, G, B
        if (data.r !== undefined && data.g !== undefined && data.b !== undefined) {
           const newColorHex = rgbToHex(data.r, data.g, data.b);
           // Solo actualizamos el input si es diferente para evitar loops raros
           setColor(newColorHex);
        }

      } catch (e) {
        console.error("Error parsing JSON", e);
      }
    };

    return () => {
      if(ws.current) ws.current.close();
    }
  }, []);

  const handleColorChange = (event) => {
    const hex = event.target.value;
    setColor(hex); // Actualización visual inmediata (optimista)

    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ r, g, b });
      ws.current.send(message);
    }
  };

  // Función para formatear el tiempo
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  }

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      fontFamily: 'Arial', backgroundColor: '#1a1a1a', minHeight: '100vh', color: 'white',
      padding: '20px'
    }}>
      <h1>🚀 Panel IoT S3</h1>
      
      {/* Dashboard de Telemetría */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', 
        width: '100%', maxWidth: '400px', marginBottom: '30px' 
      }}>
        <div style={cardStyle}>
          <span style={{fontSize: '20px'}}>📶</span>
          <p style={{margin: '5px 0', fontSize: '0.8rem'}}>Señal</p>
          <strong>{status.rssi} dBm</strong>
        </div>
        <div style={cardStyle}>
          <span style={{fontSize: '20px'}}>⏱️</span>
          <p style={{margin: '5px 0', fontSize: '0.8rem'}}>Activo</p>
          <strong>{formatTime(status.uptime)}</strong>
        </div>
        <div style={cardStyle}>
          <span style={{fontSize: '20px'}}>💾</span>
          <p style={{margin: '5px 0', fontSize: '0.8rem'}}>RAM</p>
          <strong>{Math.round(status.heap / 1024)} KB</strong>
        </div>
      </div>

      <div style={{
        padding: '30px', backgroundColor: '#2d2d2d', borderRadius: '20px', 
        textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
      }}>
        <p style={{marginBottom: '15px'}}>Control de Color</p>
        <input 
          type="color" 
          value={color} 
          onChange={handleColorChange}
          style={{
            width: '120px', height: '120px', cursor: 'pointer', 
            border: 'none', background: 'none'
          }} 
        />
        <p style={{marginTop: '10px', color: '#888'}}>{color}</p>
      </div>

      <p style={{marginTop: 'auto', color: status.connected ? '#4CAF50' : '#f44336'}}>
        {status.connected ? "● Conectado al ESP32" : "● Desconectado"}
      </p>
    </div>
  )
}

const cardStyle = {
  backgroundColor: '#333', padding: '15px', borderRadius: '10px', textAlign: 'center'
}

export default App