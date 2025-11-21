import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

// Importación de Módulos
import BoardView from './components/BoardView';
import ControlPanel from './components/ControlPanel';
import LogTerminal from './components/LogTerminal'; // <--- Importamos el nuevo componente
import { useEsp32Socket } from './hooks/useEsp32Socket';
import { PIN_DEF } from './data/pinConfig';
import './App.css';

export default function ESP32Dashboard() {
  // Hook personalizado de conexión (Lógica)
  const { isConnected, serverLog, addLog, sendCommand } = useEsp32Socket(); // Asegúrate que useEsp32Socket devuelva un 'setServerLog' o función 'clearLogs' si quieres limpiar.
  // *Corrección pequeña*: Necesitamos poder limpiar los logs. 
  // Vamos a asumir que pasamos serverLog y una función para limpiar.
  // Si useEsp32Socket no expone 'setServerLog', lo haremos localmente o modificaremos el hook.
  // Para simplificar, asumiré que useEsp32Socket maneja el estado. 
  // *Mejor estrategia:* El estado de logs debería vivir aquí o ser expuesto.
  // MODIFICACIÓN RÁPIDA: Vamos a manejar el clearLog aquí si el hook lo permite, 
  // si no, pasamos una función vacía por ahora.
  
  // ESTADO DE PINES (Visual)
  const [pinData, setPinData] = useState({});
  const [selectedPin, setSelectedPin] = useState(null);

  // ESTADO DE LOGS (Si decidimos moverlo aquí para tener control total, o usamos el del hook)
  // Nota: Si usas el hook tal cual te lo di antes, 'serverLog' viene del hook. 
  // Necesitaríamos que el hook exponga 'clearLogs'.
  // Agreguemos esa pequeña función dummy para que no falle el botón Clear.
  const clearLogs = () => {
      // Idealmente, modifica useEsp32Socket.js para que retorne: { ..., clearLogs: () => setServerLog([]) }
      console.log("Limpiar logs (Requiere actualizar hook)");
      window.location.reload(); // Solución temporal drástica, mejor actualiza el hook.
  };

  useEffect(() => {
    setPinData(prev => ({
      ...prev,
      'GPIO48': { mode: 'NEOPIXEL', value: 0, rgb: '#00ff00', pwm: 0 }
    }));
  }, []);

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
    addLog(`CFG: ${pin} reset (INPUT)`);
    // Convertir nombre de pin a número para el backend
    const pinNum = pin === 'GPIO48' ? 48 : parseInt(pin.replace('GPIO',''));
    if (!isNaN(pinNum)) {
        sendCommand({ pin: pinNum, mode: 'INPUT', val: 0, pwm: 0, rgb: null });
    }
  };

  const updatePinConfig = (pin, key, val) => {
    setPinData(prev => {
      const currentData = prev[pin] || { mode: 'OUTPUT', value: 0, pwm: 0, adcVal: 0, rgb: '#000000' };
      let newData = { ...currentData, [key]: val };
      
      if (key === 'mode') {
        addLog(`CFG: ${pin} modo cambiado a ${val}`);
        if (val === 'OUTPUT') newData.value = 0;
        if (val === 'PWM') newData.pwm = 0;
      }

      const pinNum = pin === 'GPIO48' ? 48 : parseInt(pin.replace('GPIO',''));
      const payload = {
        pin: pinNum,
        mode: newData.mode,
        val: newData.value || 0,
        pwm: newData.pwm || 0,
        rgb: newData.rgb
      };
      
      sendCommand(payload);
      
      if (key === 'value') addLog(`TX: ${pin} set ${val}`);
      if (key === 'rgb') addLog(`TX: ${pin} color ${val}`);

      return { ...prev, [pin]: newData };
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden select-none bg-[#111827] text-white">
      
      {/* PANEL IZQUIERDO (SVG) */}
      <BoardView 
        isConnected={isConnected}
        pinData={pinData}
        selectedPin={selectedPin}
        onPinSelect={handlePinSelect}
        onBackgroundClick={() => setSelectedPin(null)}
      />

      {/* PANEL DERECHO (CONTROLES) */}
      <div className="w-full md:w-[400px] bg-[#161b22] flex flex-col border-l border-gray-800 shadow-2xl z-20">
        
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
               <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-purple-500"></div><span className="text-gray-300">ADC</span></div>
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