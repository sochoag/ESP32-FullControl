import { useState, useEffect, useRef } from 'react';

export const useEsp32Socket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [serverLog, setServerLog] = useState([]);
  const ws = useRef(null);

  // Función para añadir logs con timestamp
  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setServerLog(prev => [`[${time}] ${msg}`, ...prev.slice(0, 14)]);
  };

  useEffect(() => {
    const hostname = window.location.hostname;
    // Lógica para detectar si estamos en desarrollo (localhost) o producción (ESP32)
    const wsUrl = `ws://${hostname === 'localhost' ? '192.168.1.45' : hostname}/ws`;
    
    const connect = () => {
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => {
        setIsConnected(true);
        addLog("SISTEMA: Conexión WebSocket establecida");
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        addLog("SISTEMA: Desconectado. Reintentando...");
        setTimeout(connect, 3000); // Reintento automático
      };

      ws.current.onmessage = (event) => {
        // Aquí procesarías mensajes entrantes si el ESP32 envía actualizaciones
      };
    };

    connect();
    return () => { if(ws.current) ws.current.close(); };
  }, []);

  // Función para enviar comandos JSON
  const sendCommand = (payload) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(payload));
      return true;
    }
    addLog("ERROR: No hay conexión para enviar comando");
    return false;
  };

  // Agregar función para limpiar
  const clearLogs = () => setServerLog([]);

  // Retornar clearLogs
  return { isConnected, serverLog, addLog, sendCommand, clearLogs };
};