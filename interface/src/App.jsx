import React, { useState, useEffect, useCallback } from 'react';
import { Info } from 'lucide-react';

// Importación de Módulos
import BoardView from './components/BoardView';
import ControlPanel from './components/ControlPanel';
import LogTerminal from './components/LogTerminal';
import { useEsp32Socket } from './hooks/useEsp32Socket';
import { PIN_DEF } from './data/pinConfig';
import './App.css';

export default function ESP32Dashboard() {
  
  // 1. ESTADO VISUAL (Configuración de pines)
  const [pinData, setPinData] = useState({});
  const [selectedPin, setSelectedPin] = useState(null);

  // 2. MANEJADOR DE TELEMETRÍA (Datos que llegan del ESP32)
  // Usamos useCallback para que la función sea estable y no reinicie el socket
  // 2. MANEJADOR DE TELEMETRÍA
  const handleIncomingData = useCallback((data) => {
    // Debug en consola del navegador (F12) para ver si llegan datos
    // console.log("Datos recibidos:", data); 

    if (data.gpio) {
      setPinData(prev => {
        const nextState = { ...prev };
        let hasChanges = false;

        Object.keys(data.gpio).forEach(pinNum => {
          const pinName = pinNum === '48' ? 'GPIO48' : `GPIO${pinNum}`;
          const newVal = data.gpio[pinNum];
          
          // VERIFICACIÓN: ¿Tenemos este pin configurado en el Frontend?
          if (nextState[pinName]) {
            const mode = nextState[pinName].mode;
            
            // --- DEBUG VISUAL TEMPORAL ---
            // Si seleccionas el pin, veremos en la consola del navegador qué está pasando
            if (selectedPin === pinName) {
               // console.log(`Pin ${pinName} (${mode}) -> Nuevo Valor: ${newVal}`);
            }

            // LÓGICA INPUT (Digital)
            if (mode === 'INPUT') {
               // Actualizamos siempre para asegurar sincronía
               if (nextState[pinName].value !== newVal) {
                   nextState[pinName] = { ...nextState[pinName], value: newVal };
                   hasChanges = true;
               }
            }
            // LÓGICA SENSORES (Touch / ADC)
            else if (mode === 'TOUCH' || mode === 'ADC') {
               // Umbral de ruido: Solo actualizamos si cambia lo suficiente para evitar renderizados locos
               // O actualizamos siempre si es diferente.
               if (nextState[pinName].adcVal !== newVal) {
                   nextState[pinName] = { ...nextState[pinName], adcVal: newVal };
                   hasChanges = true;
               }
            }
          }
        });

        return hasChanges ? nextState : prev;
      });
    }
  }, [selectedPin]); // Agregamos selectedPin para el debug (opcional)

  // 3. CONEXIÓN WEBSOCKET
  // Pasamos el callback al hook para que procese los mensajes
  const { isConnected, serverLog, sendCommand, clearLogs: hookClearLogs } = useEsp32Socket(handleIncomingData);

  // Wrapper para limpiar logs (si el hook no lo exporta, usa recarga como fallback)
  const clearLogs = () => {
      if (hookClearLogs) hookClearLogs();
      else window.location.reload();
  };

  // Efecto inicial: Configurar LED onboard por defecto
  useEffect(() => {
    setPinData(prev => ({
      ...prev,
      'GPIO48': { mode: 'NEOPIXEL', value: 0, rgb: '#00ff00', pwm: 0 }
    }));
  }, []);

  // 4. ACCIONES DEL USUARIO
  const handlePinSelect = (pinName) => {
    const realPinName = pinName === 'RGB' ? 'GPIO48' : pinName;
    setSelectedPin(prev => prev === realPinName ? null : realPinName);
  };

  const clearPinConfig = (pin) => {
    setPinData(prev => {
      const newState = { ...prev };
      delete newState[pin];
      return newState;
    });
    
    // Enviar reset al hardware
    const pinNum = pin === 'GPIO48' ? 48 : parseInt(pin.replace('GPIO',''));
    if (!isNaN(pinNum)) {
        sendCommand({ pin: pinNum, mode: 'INPUT', val: 0, pwm: 0, rgb: null });
    }
  };

  const updatePinConfig = (pin, key, val) => {
    setPinData(prev => {
      const currentData = prev[pin] || { mode: 'OUTPUT', value: 0, pwm: 0, adcVal: 0, rgb: '#000000' };
      let newData = { ...currentData, [key]: val };
      
      // Resetear valores al cambiar de modo
      if (key === 'mode') {
        if (val === 'OUTPUT') newData.value = 0;
        if (val === 'PWM') newData.pwm = 0;
      }

      // Preparar y enviar comando
      const pinNum = pin === 'GPIO48' ? 48 : parseInt(pin.replace('GPIO',''));
      const payload = {
        pin: pinNum,
        mode: newData.mode,
        val: newData.value || 0,
        pwm: newData.pwm || 0,
        rgb: newData.rgb
      };
      
      sendCommand(payload);
      return { ...prev, [pin]: newData };
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-[#111827] text-white font-sans selection:bg-blue-500 selection:text-white">
      
      {/* PANEL IZQUIERDO (SVG PLACA) */}
      <BoardView 
        isConnected={isConnected}
        pinData={pinData}
        selectedPin={selectedPin}
        onPinSelect={handlePinSelect}
        onBackgroundClick={() => setSelectedPin(null)}
      />

      {/* PANEL DERECHO (CONTROLES) */}
      <div className="w-full md:w-[400px] bg-[#161b22] flex flex-col border-l border-gray-800 shadow-2xl z-20 h-full">
        
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
          <ControlPanel 
            selectedPin={selectedPin}
            pinDef={PIN_DEF}
            pinData={pinData}
            updateConfig={updatePinConfig}
            clearConfig={clearPinConfig}
          />
          
          {/* LEYENDA */}
          <div className="mt-6 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
             <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
               <Info size={12} /> Leyenda
             </h4>
             <div className="grid grid-cols-2 gap-2 text-xs">
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#3b82f6]"></div><span className="text-gray-300">Seleccionado</span></div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#22c55e]"></div><span className="text-gray-300">Output HIGH</span></div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-[#14532d]"></div><span className="text-gray-500">Output LOW</span></div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-500"></div><span className="text-gray-300">PWM</span></div>
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-purple-500"></div><span className="text-gray-300">ADC / Touch</span></div>
             </div>
          </div>
        </div>

        {/* PANEL INFERIOR (LOGS) */}
        <LogTerminal 
          logs={serverLog} 
          onClear={clearLogs} 
        />

      </div>
    </div>
  );
}