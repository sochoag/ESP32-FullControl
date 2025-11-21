import React from 'react';
import { Zap, Settings, Activity, Trash2, Eye, Lightbulb } from 'lucide-react';

export default function ControlPanel({ selectedPin, pinDef, pinData, updateConfig, clearConfig }) {
  
  // Si no hay pin seleccionado
  if (!selectedPin) return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-500 animate-fade-in">
      <Activity className="w-12 h-12 mb-4 opacity-20" />
      <p className="italic text-center text-sm">Selecciona un pin en la placa<br/>para configurarlo.</p>
    </div>
  );

  const def = pinDef[selectedPin];
  const state = pinData[selectedPin];

  // Pines de Potencia/Control (No configurables)
  if (def.type === 'power' || def.type === 'control') {
    return (
      <div className="p-4 bg-gray-800/50 rounded border border-gray-700 animate-fade-in">
        <h3 className="text-lg font-bold text-white mb-1">{def.label}</h3>
        <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 uppercase">{def.type}</span>
        <p className="text-gray-400 text-sm mt-3">{def.desc}</p>
      </div>
    );
  }

  // Pines GPIO Configurables
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-start border-b border-gray-700 pb-3">
        <div>
          <h3 className="text-2xl font-bold text-white">{selectedPin}</h3>
          <p className="text-xs text-gray-400 font-mono">{def.desc}</p>
        </div>
        <div className="flex gap-2 items-center">
           {state && (
             <button onClick={() => clearConfig(selectedPin)} className="p-2 hover:bg-red-900/30 text-gray-500 hover:text-red-400 rounded transition-colors">
               <Trash2 size={18} />
             </button>
           )}
           {def.special === 'RGB_LED' && <Lightbulb className="text-yellow-400" />}
        </div>
      </div>

      {/* SELECCIÓN DE MODO */}
      <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
        <label className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-2">
          <Settings size={12} /> Configurar Modo
        </label>
        <div className="flex flex-wrap gap-2">
          {def.modes.map(m => (
            <button
              key={m}
              onClick={() => updateConfig(selectedPin, 'mode', m)}
              className={`text-xs py-1.5 px-3 rounded font-medium transition-all border ${
                state?.mode === m 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.3)]' 
                  : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* CONTROLES SEGÚN MODO */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 min-h-[120px] flex flex-col justify-center">
        {!state ? (
           <div className="text-center text-gray-500 text-xs italic flex flex-col items-center gap-2">
             <Settings size={24} className="opacity-20" />
             <span>Configura un modo para operar.</span>
           </div>
        ) : (
           <>
             {/* OUTPUT DIGITAL */}
             {state.mode === 'OUTPUT' && (
               <div className="text-center">
                 <button
                   onClick={() => updateConfig(selectedPin, 'value', state.value ? 0 : 1)}
                   className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                     state.value 
                       ? 'bg-green-500 hover:bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                       : 'bg-gray-700 hover:bg-gray-600 text-gray-400'
                   }`}
                 >
                   <Zap size={20} className={state.value ? 'fill-current' : ''} />
                   {state.value ? 'HIGH (3.3V)' : 'LOW (GND)'}
                 </button>
               </div>
             )}

             {/* PWM SLIDER */}
             {state.mode === 'PWM' && (
                <div>
                  <div className="text-xs text-gray-400 mb-4 uppercase tracking-widest flex justify-between">
                    <span>Salida PWM</span>
                    <span className="font-mono text-white">{state.pwm || 0}</span>
                  </div>
                  <input 
                    type="range" min="0" max="255" value={state.pwm || 0}
                    onChange={(e) => updateConfig(selectedPin, 'pwm', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg cursor-pointer accent-amber-500"
                  />
                </div>
             )}

             {/* NEOPIXEL RGB */}
             {state.mode === 'NEOPIXEL' && (
                <div>
                  <div className="text-xs text-gray-400 mb-3 uppercase tracking-widest">Color RGB</div>
                  <input 
                    type="color" value={state.rgb || '#000000'}
                    onChange={(e) => updateConfig(selectedPin, 'rgb', e.target.value)}
                    className="w-full h-12 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                </div>
             )}
             
             {/* INPUT / ADC (Solo visualización) */}
             {(state.mode === 'INPUT' || state.mode === 'ADC') && (
                <div className="text-center text-gray-500 text-sm">
                    Modo lectura activo. <br/>Esperando datos del ESP32...
                </div>
             )}
           </>
        )}
      </div>
    </div>
  );
}