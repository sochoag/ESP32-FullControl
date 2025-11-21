import React, { useEffect, useRef } from 'react';
import { Terminal, Trash2 } from 'lucide-react';

export default function LogTerminal({ logs, onClear }) {
  const endRef = useRef(null);

  // Auto-scroll al final cuando llega un nuevo log
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="h-64 bg-black border-t border-gray-700 flex flex-col font-mono text-xs">
      {/* Barra de herramientas del Terminal */}
      <div className="px-3 py-2 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
        <span className="font-bold text-gray-400 flex items-center gap-2 select-none">
          <Terminal size={12} /> MONITOR SERIAL / WS
        </span>
        <button 
          onClick={onClear} 
          className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-white uppercase transition-colors px-2 py-1 rounded hover:bg-gray-700"
          title="Limpiar consola"
        >
          <Trash2 size={10} /> Clear
        </button>
      </div>

      {/* Área de Logs */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-600 italic select-none">
            Esperando actividad del sistema...
          </div>
        ) : (
          logs.map((line, i) => (
            <div key={i} className="break-all hover:bg-white/5 px-1 rounded leading-relaxed">
              {/* Timestamp (Primeros 10 caracteres "[HH:MM:SS]") */}
              <span className="text-gray-600 mr-2 select-none font-bold">
                {line.substring(0, 10)}
              </span>
              
              {/* Coloreado según tipo de mensaje */}
              <span className={`
                ${line.includes("TX") ? "text-blue-400" : ""}
                ${line.includes("CFG") ? "text-yellow-500" : ""}
                ${line.includes("SISTEMA") ? "text-purple-400 font-bold" : ""}
                ${!line.includes("TX") && !line.includes("CFG") && !line.includes("SISTEMA") ? "text-green-400" : ""}
              `}>
                {line.substring(11)}
              </span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}