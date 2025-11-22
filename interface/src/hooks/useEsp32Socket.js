import { useState, useEffect, useRef } from 'react';

export const useEsp32Socket = (onMessageReceived) => {
  const [isConnected, setIsConnected] = useState(false);
  const [serverLog, setServerLog] = useState([]);
  const ws = useRef(null);
  
  // TRUCO PROFESIONAL: Guardamos el callback en una referencia mutable.
  // Así, el WebSocket siempre tiene acceso a la "última versión" de tu función
  // sin tener que desconectarse y reconectarse cada vez que renderizas.
  const onMessageRef = useRef(onMessageReceived);

  useEffect(() => {
    onMessageRef.current = onMessageReceived;
  }, [onMessageReceived]);

  const addLog = (msg) => {
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setServerLog(prev => [`[${time}] ${msg}`, ...prev.slice(0, 14)]);
  };

  useEffect(() => {
    const hostname = window.location.hostname;
    const wsUrl = `ws://${hostname === 'localhost' ? '192.168.1.45' : hostname}/ws`;
    
    const connect = () => {
      console.log("Intentando conectar WS a:", wsUrl);
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => {
        setIsConnected(true);
        addLog("SISTEMA: Conexión WebSocket establecida");
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        addLog("SISTEMA: Desconectado. Reintentando...");
        setTimeout(connect, 3000);
      };

      ws.current.onmessage = (event) => {
        try {
          // console.log("WS Raw Data:", event.data); // <--- Descomenta si quieres ver TODO el tráfico en consola F12
          const data = JSON.parse(event.data);
          
          // Llamamos a la función que nos pasó App.jsx usando la referencia segura
          if (onMessageRef.current) {
            onMessageRef.current(data);
          }
        } catch (e) {
          console.error("JSON Error", e);
        }
      };
    };

    connect();
    return () => { if(ws.current) ws.current.close(); };
  }, []); // Array vacío: La conexión solo se crea UNA vez al montar

  const sendCommand = (payload) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(payload));
      return true;
    }
    addLog("ERROR: No hay conexión para enviar comando");
    return false;
  };

  const clearLogs = () => setServerLog([]);

  return { isConnected, serverLog, addLog, sendCommand, clearLogs };
};