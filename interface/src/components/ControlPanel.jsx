import React from 'react';
import { Zap, Settings, Activity, Trash2, Lightbulb, Fingerprint, Gauge, Radio } from 'lucide-react';

export default function ControlPanel({ selectedPin, pinDef, pinData, updateConfig, clearConfig }) {
  
  // 1. Estado Vacío (Ningún pin seleccionado)
  if (!selectedPin) return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-500 animate-fade-in select-none">
      <Activity className="w-12 h-12 mb-4 opacity-20" />
      <p className="italic text-center text-sm">Selecciona un pin en la placa<br/>para configurarlo.</p>
    </div>
  );

  const def = pinDef[selectedPin];
  const state = pinData[selectedPin];

  // 2. Pines de Potencia/Control (Solo información)
  if (def.type === 'power' || def.type === 'control' || def.type === 'comm') {
    return (
      <div className="p-4 bg-gray-800/50 rounded border border-gray-700 animate-fade-in">
        <h3 className="text-lg font-bold text-white mb-1">{def.label}</h3>
        <div className="flex gap-2 mt-2">
            <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 uppercase font-bold">{def.type}</span>
            {def.modes && <span className="text-xs bg-blue-900/50 text-blue-200 px-2 py-1 rounded border border-blue-800">{def.modes.join('/')}</span>}
        </div>
        <p className="text-gray-400 text-sm mt-3 leading-relaxed">{def.desc}</p>
      </div>
    );
  }

  // 3. Pines GPIO Configurables
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header del Pin */}
      <div className="flex justify-between items-start border-b border-gray-700 pb-3">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight">{selectedPin}</h3>
          <p className="text-xs text-gray-400 font-mono mt-1">{def.desc}</p>
        </div>
        <div className="flex gap-2 items-center">
           {/* Icono especial si es el pin RGB */}
           {def.special === 'RGB_LED' && <Lightbulb className="text-yellow-400 animate-pulse" size={20} />}
           
           {/* Botón de Reset solo si hay configuración */}
           {state && (
             <button 
                onClick={() => clearConfig(selectedPin)} 
                className="p-2 hover:bg-red-900/30 text-gray-500 hover:text-red-400 rounded-md transition-colors border border-transparent hover:border-red-900/50"
                title="Resetear Pin"
             >
               <Trash2 size={18} />
             </button>
           )}
        </div>
      </div>

      {/* Selector de Modo */}
      <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-inner">
        <label className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
          <Settings size={14} /> Configurar Modo
        </label>
        <div className="flex flex-wrap gap-2">
          {def.modes.map(m => (
            <button
              key={m}
              onClick={() => updateConfig(selectedPin, 'mode', m)}
              className={`text-xs py-1.5 px-3 rounded-md font-bold transition-all border ${
                state?.mode === m 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)] scale-105' 
                  : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Panel de Control Dinámico */}
      <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 min-h-[140px] flex flex-col justify-center relative overflow-hidden">
        
        {!state ? (
           <div className="text-center text-gray-500 text-xs italic flex flex-col items-center gap-3">
             <Settings size={32} className="opacity-10" />
             <span>Selecciona un modo arriba para comenzar.</span>
           </div>
        ) : (
           <>
             {/* --- MODO: SALIDA DIGITAL (OUTPUT) --- */}
             {state.mode === 'OUTPUT' && (
               <div className="text-center">
                 <button
                   onClick={() => updateConfig(selectedPin, 'value', state.value ? 0 : 1)}
                   className={`w-full py-6 rounded-xl font-bold text-xl transition-all flex items-center justify-center gap-3 border ${
                     state.value 
                       ? 'bg-green-600 border-green-500 text-white shadow-[0_0_20px_rgba(22,163,74,0.4)]' 
                       : 'bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600'
                   }`}
                 >
                   <Zap size={24} className={state.value ? 'fill-current' : ''} />
                   {state.value ? 'ENCENDIDO (3.3V)' : 'APAGADO (GND)'}
                 </button>
                 <p className="text-[10px] text-gray-500 mt-3 uppercase tracking-widest">Control Digital Simple</p>
               </div>
             )}

             {/* --- MODO: PWM (ANALOG OUTPUT) --- */}
             {state.mode === 'PWM' && (
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-xs text-amber-500 font-bold uppercase tracking-widest flex items-center gap-2">
                        <Activity size={14}/> Salida PWM
                    </span>
                    <span className="font-mono text-2xl font-bold text-white">{state.pwm || 0}</span>
                  </div>
                  <input 
                    type="range" min="0" max="255" value={state.pwm || 0}
                    onChange={(e) => updateConfig(selectedPin, 'pwm', parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-amber-500 border border-gray-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-mono">
                      <span>0% (0V)</span>
                      <span>100% (3.3V)</span>
                  </div>
                </div>
             )}

             {/* --- MODO: NEOPIXEL (RGB) --- */}
             {state.mode === 'NEOPIXEL' && (
                <div>
                  <div className="text-xs text-gray-400 mb-3 uppercase tracking-widest font-bold">Selector de Color</div>
                  <div className="flex gap-4 items-center">
                      <input 
                        type="color" value={state.rgb || '#000000'}
                        onChange={(e) => updateConfig(selectedPin, 'rgb', e.target.value)}
                        className="w-16 h-16 rounded-full cursor-pointer bg-transparent border-none p-0 overflow-hidden shadow-lg"
                      />
                      <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">Código Hexadecimal:</p>
                          <code className="bg-black px-2 py-1 rounded text-blue-400 font-mono text-sm border border-gray-700 block w-full text-center">
                              {state.rgb || '#000000'}
                          </code>
                      </div>
                  </div>
                </div>
             )}
             
             {/* --- MODO: ENTRADA DIGITAL (INPUT) - TELEMETRÍA --- */}
             {state.mode === 'INPUT' && (
                <div className="text-center">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Radio size={14}/> Lectura Digital
                        </span>
                        <span className="animate-pulse w-2 h-2 bg-cyan-500 rounded-full"></span>
                    </div>
                    
                    <div className={`py-4 rounded-lg border transition-all duration-300 ${
                        state.value 
                        ? 'bg-cyan-900/30 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                        : 'bg-gray-900 border-gray-700'
                    }`}>
                        <span className={`text-3xl font-mono font-bold ${state.value ? 'text-cyan-400' : 'text-gray-600'}`}>
                            {state.value ? 'HIGH' : 'LOW'}
                        </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-3">
                        Estado físico del pin (Lectura en tiempo real)
                    </p>
                </div>
             )}

             {/* --- MODO: ANALÓGICO (ADC) - TELEMETRÍA --- */}
             {state.mode === 'ADC' && (
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs text-purple-400 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Gauge size={14}/> Sensor ADC
                        </span>
                        <span className="font-mono text-xl font-bold text-white">
                            {state.adcVal || 0} <span className="text-xs text-gray-500 font-normal">/ 4095</span>
                        </span>
                    </div>
                    
                    {/* Barra de Progreso */}
                    <div className="h-4 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-700">
                        <div 
                            className="h-full bg-gradient-to-r from-purple-900 to-purple-500 transition-all duration-300 ease-out"
                            style={{ width: `${((state.adcVal || 0) / 4095) * 100}%` }}
                        />
                    </div>
                    
                    <div className="text-[10px] text-gray-500 mt-2 font-mono text-right">
                        Voltaje aprox: {(((state.adcVal || 0) / 4095) * 3.3).toFixed(2)}V
                    </div>
                </div>
             )}

             {/* --- MODO: TOUCH (CAPACITIVO) - TELEMETRÍA --- */}
             {state.mode === 'TOUCH' && (
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs text-pink-400 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Fingerprint size={14}/> Sensor Táctil
                        </span>
                        <span className="font-mono text-xl font-bold text-white">
                            {state.adcVal || 0}
                        </span>
                    </div>
                    
                    {/* Barra de Progreso (Touch suele ir de 0 a ~100,000 dependiendo del pin) */}
                    <div className="h-4 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-700">
                        <div 
                            className="h-full bg-gradient-to-r from-pink-900 to-pink-500 transition-all duration-200 ease-out"
                            // Usamos un maximo estimado de 80000 para visualización
                            style={{ width: `${Math.min(((state.adcVal || 0) / 80000) * 100, 100)}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2">
                        Valores altos = Tocado / Valores bajos = Aire
                    </p>
                </div>
             )}

           </>
        )}
      </div>
    </div>
  );
}