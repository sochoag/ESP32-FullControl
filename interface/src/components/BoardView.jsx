import React from 'react';
import { Activity } from 'lucide-react';

export default function BoardView({ isConnected, pinData, selectedPin, onPinSelect, onBackgroundClick }) {
  
  // --- 1. HELPERS VISUALES ---
  const getBoardRGBColor = () => {
    const p48 = pinData['GPIO48'];
    if (!p48) return '#222'; 
    if (p48.mode === 'NEOPIXEL') return p48.rgb || '#222';
    if (p48.mode === 'PWM' && p48.pwm > 0) return `rgba(0, 255, 0, ${p48.pwm / 255})`;
    if (p48.mode === 'OUTPUT' && p48.value === 1) return '#00ff00';
    return '#222';
  };

  const getPinFill = (pinName) => {
    if (pinName === 'RGB') return getBoardRGBColor();
    if (selectedPin === pinName) return "#3b82f6"; // Azul brillante si está seleccionado
    
    const state = pinData[pinName];
    if (!state) return "#ffd700"; // Dorado por defecto

    switch (state.mode) {
      case 'INPUT': return state.value ? "#06b6d4" : "#164e63"; // Cyan encendido/apagado
      case 'OUTPUT': return state.value ? "#22c55e" : "#14532d"; // Verde encendido/apagado
      case 'PWM': return `rgba(245, 158, 11, ${0.4 + (state.pwm / 255) * 0.6})`; // Ambar variable
      case 'ADC': return `rgba(168, 85, 247, ${0.4 + (state.adcVal / 4095) * 0.6})`; // Violeta variable
      case 'NEOPIXEL': return state.rgb;
      default: return "#ffd700";
    }
  };

  // --- 2. DATOS DE DIBUJO (PATHS DE TODOS LOS PINES) ---
  const pinPaths = [
    // LADO IZQUIERDO
    { name: "3V3", d: "m6.4961 29.793c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008" },
    { name: "3V3", d: "m6.4961 36.992c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008" },
    { name: "RST", d: "m6.4961 44.195c-2.543 0-2.543 3.8125 0 3.8125h1.8008c2.5469 0 2.5469-3.8125 0-3.8125h-1.8008" },
    { name: "GPIO4", d: "m6.4961 51.395c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO5", d: "m6.4961 58.594c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO6", d: "m6.4961 65.793c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO7", d: "m6.4961 72.992c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO15", d: "m6.4961 80.195c-2.543 0-2.543 3.8125 0 3.8125h1.8008c2.5469 0 2.5469-3.8125 0-3.8125h-1.8008" },
    { name: "GPIO16", d: "m6.4961 87.395c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO17", d: "m6.4961 94.594c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO18", d: "m6.4961 101.79c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO8", d: "m6.4961 108.99c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO3", d: "m6.4961 116.2c-2.543 0-2.543 3.8125 0 3.8125h1.8008c2.5469 0 2.5469-3.8125 0-3.8125h-1.8008" },
    { name: "GPIO46", d: "m6.4961 123.39c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO9", d: "m6.4961 130.59c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO10", d: "m6.4961 137.79c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO11", d: "m6.4961 144.99c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO12", d: "m6.4961 152.2c-2.543 0-2.543 3.8125 0 3.8125h1.8008c2.5469 0 2.5469-3.8125 0-3.8125h-1.8008" },
    { name: "GPIO13", d: "m6.4961 159.39c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO14", d: "m6.4961 166.59c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008" },
    { name: "5V", d: "m6.4961 173.79c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008" },
    { name: "GND", d: "m6.4961 180.99c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008" },
    // LADO DERECHO
    { name: "GND", d: "m71.297 29.793c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008" },
    { name: "TX", d: "m71.297 36.992c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008" },
    { name: "RX", d: "m71.297 44.195c-2.543 0-2.543 3.8125 0 3.8125h1.8008c2.543 0 2.543-3.8125 0-3.8125h-1.8008" },
    { name: "GPIO1", d: "m71.297 51.395c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO2", d: "m71.297 58.594c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO42", d: "m71.297 65.793c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO41", d: "m71.297 72.992c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO40", d: "m71.297 80.195c-2.543 0-2.543 3.8125 0 3.8125h1.8008c2.543 0 2.543-3.8125 0-3.8125h-1.8008" },
    { name: "GPIO39", d: "m71.297 87.395c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO38", d: "m71.297 94.594c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO37", d: "m71.297 101.79c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO36", d: "m71.297 108.99c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO35", d: "m71.297 116.2c-2.543 0-2.543 3.8125 0 3.8125h1.8008c2.543 0 2.543-3.8125 0-3.8125h-1.8008" },
    { name: "GPIO0", d: "m71.297 123.39c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO45", d: "m71.297 130.59c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO48", d: "m71.297 137.79c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO47", d: "m71.297 144.99c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO21", d: "m71.297 152.2c-2.543 0-2.543 3.8125 0 3.8125h1.8008c2.543 0 2.543-3.8125 0-3.8125h-1.8008" },
    { name: "GPIO20", d: "m71.297 159.39c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008" },
    { name: "GPIO19", d: "m71.297 166.59c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008" },
    { name: "GND", d: "m71.297 173.79c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008" },
    { name: "GND", d: "m71.297 180.99c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008" },
  ];

  return (
    <div 
      className="flex-1 bg-[#1a1a1a] relative overflow-hidden flex flex-col items-center justify-center p-0 border-r border-gray-800"
      onClick={onBackgroundClick}
    >
       {/* --- STATUS BAR --- */}
       <div className="absolute top-4 left-4 z-10 flex gap-3">
          <div className="bg-gray-800/90 backdrop-blur px-3 py-2 rounded shadow border border-gray-700 flex items-center gap-2 text-white">
            <Activity size={16} className="text-blue-400" /> 
            <span className="font-bold text-sm">ESP32-S3 DevKit</span>
          </div>
          <div className="bg-gray-800/90 backdrop-blur px-3 py-2 rounded shadow border border-gray-700 flex items-center gap-2 text-xs text-white">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-red-500'}`}></div>
            {isConnected ? 'Online' : 'Offline'}
          </div>
       </div>

       {/* --- MAIN SVG VISUALIZER --- */}
       <div className="relative w-full h-full flex items-center justify-center p-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 72.36 198.59" 
            className="w-auto h-auto max-h-[95vh] max-w-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs id="defs391"/>
            <rect style={{opacity:1, fill:'#3e3e3e', fillOpacity:1, stroke:'#030303', strokeWidth:0.36, strokeDasharray:'none', strokeOpacity:1, paintOrder:'stroke markers fill'}} id="rect391" width="54.930031" height="18.082945" x="8.7149849" y="0.18000001" />
            <g id="layer1" />
            <g transform="translate(-3.6168 -9.4766)" id="g391">
              <rect x="3.8447" y="27.266" width="72.034" height="178.25" ry="1.3163" fill="#3e3e3e" id="rect1" style={{stroke:'none', strokeOpacity:1}}/>
              <g fill="none" stroke="#000" strokeLinecap="round" strokeMiterlimit="10" strokeWidth=".36" id="g8">
                <path d="m3.7968 204.05c0 0.78516 0.63677 1.418 1.418 1.418" id="path1"/>
                <path d="m5.2148 205.46h69.164" id="path2"/>
                <path d="m74.379 205.46c0.78516 0 1.418-0.63288 1.418-1.418" id="path3"/>
                <path d="m75.797 204.05v-175.36" id="path4"/>
                <path d="m75.797 28.684c0-0.78127-0.63288-1.418-1.418-1.418" id="path5"/>
                <path d="m74.379 27.266h-69.164" id="path6"/>
                <path d="m5.2148 27.266c-0.7812 0-1.418 0.63648-1.418 1.418" id="path7"/>
                <path d="m3.7968 28.684v175.36" id="path8"/>
              </g>
              {/* PINS GROUP - INTERACTIVE */}
              <g fillRule="evenodd" id="g156">
                {[
                  { d: "m6.4961 29.793c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008", name: "3V3" },
                  { d: "m6.4961 36.992c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008", name: "3V3" },
                  { d: "m6.4961 44.195c-2.543 0-2.543 3.8125 0 3.8125h1.8008c2.5469 0 2.5469-3.8125 0-3.8125h-1.8008", name: "RST" },
                  { d: "m6.4961 51.395c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008", name: "GPIO4" },
                  { d: "m6.4961 58.594c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008", name: "GPIO5" },
                  { d: "m6.4961 65.793c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008", name: "GPIO6" },
                  { d: "m6.4961 72.992c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008", name: "GPIO7" },
                  { d: "m6.4961 80.195c-2.543 0-2.543 3.8125 0 3.8125h1.8008c2.5469 0 2.5469-3.8125 0-3.8125h-1.8008", name: "GPIO15" },
                  { d: "m6.4961 87.395c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008", name: "GPIO16" },
                  { d: "m6.4961 94.594c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008", name: "GPIO17" },
                  { d: "m6.4961 101.79c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008", name: "GPIO18" },
                  { d: "m6.4961 108.99c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008", name: "GPIO8" },
                  { d: "m6.4961 116.2c-2.543 0-2.543 3.8125 0 3.8125h1.8008c2.5469 0 2.5469-3.8125 0-3.8125h-1.8008", name: "GPIO3" },
                  { d: "m6.4961 123.39c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008", name: "GPIO46" },
                  { d: "m6.4961 130.59c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008", name: "GPIO9" },
                  { d: "m6.4961 137.79c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008", name: "GPIO10" },
                  { d: "m6.4961 144.99c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008", name: "GPIO11" },
                  { d: "m6.4961 152.2c-2.543 0-2.543 3.8125 0 3.8125h1.8008c2.5469 0 2.5469-3.8125 0-3.8125h-1.8008", name: "GPIO12" },
                  { d: "m6.4961 159.39c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008", name: "GPIO13" },
                  { d: "m6.4961 166.59c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008", name: "GPIO14" },
                  { d: "m6.4961 173.79c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008", name: "5V" },
                  { d: "m6.4961 180.99c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.5469 0 2.5469-3.8164 0-3.8164h-1.8008", name: "GND" },
                  { d: "m71.297 29.793c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008", name: "GND" },
                  { d: "m71.297 36.992c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008", name: "TX" },
                  { d: "m71.297 44.195c-2.543 0-2.543 3.8125 0 3.8125h1.8008c2.543 0 2.543-3.8125 0-3.8125h-1.8008", name: "RX" },
                  { d: "m71.297 51.395c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008", name: "GPIO1" },
                  { d: "m71.297 58.594c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008", name: "GPIO2" },
                  { d: "m71.297 65.793c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008", name: "GPIO42" },
                  { d: "m71.297 72.992c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008", name: "GPIO41" },
                  { d: "m71.297 80.195c-2.543 0-2.543 3.8125 0 3.8125h1.8008c2.543 0 2.543-3.8125 0-3.8125h-1.8008", name: "GPIO40" },
                  { d: "m71.297 87.395c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008", name: "GPIO39" },
                  { d: "m71.297 94.594c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008", name: "GPIO38" },
                  { d: "m71.297 101.79c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008", name: "GPIO37" },
                  { d: "m71.297 108.99c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008", name: "GPIO36" },
                  { d: "m71.297 116.2c-2.543 0-2.543 3.8125 0 3.8125h1.8008c2.543 0 2.543-3.8125 0-3.8125h-1.8008", name: "GPIO35" },
                  { d: "m71.297 123.39c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008", name: "GPIO0" },
                  { d: "m71.297 130.59c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008", name: "GPIO45" },
                  { d: "m71.297 137.79c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008", name: "GPIO48" },
                  { d: "m71.297 144.99c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008", name: "GPIO47" },
                  { d: "m71.297 152.2c-2.543 0-2.543 3.8125 0 3.8125h1.8008c2.543 0 2.543-3.8125 0-3.8125h-1.8008", name: "GPIO21" },
                  { d: "m71.297 159.39c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008", name: "GPIO20" },
                  { d: "m71.297 166.59c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008", name: "GPIO19" },
                  { d: "m71.297 173.79c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008", name: "GND" },
                  { d: "m71.297 180.99c-2.543 0-2.543 3.8164 0 3.8164h1.8008c2.543 0 2.543-3.8164 0-3.8164h-1.8008", name: "GND" },
                ].map((pin, i) => (
                  <path 
                    key={i}
                    d={pin.d}
                    fill={getPinFill(pin.name)}
                    onClick={(e) => { e.stopPropagation(); onPinSelect(pin.name); }}
                    className="hover:opacity-80 transition-all cursor-pointer"
                    style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
                  />
                ))}
              </g>

              <g fill="none" stroke="#131313" strokeLinecap="round" strokeMiterlimit="10" strokeWidth=".36" id="g161">
                <path d="m3.7968 204.05c0 0.78516 0.63677 1.418 1.418 1.418" id="path157"/>
                <path d="m5.2148 205.46h69.164" id="path158"/>
                <path d="m74.379 205.46c0.78516 0 1.418-0.63288 1.418-1.418" id="path159"/>
                <path d="m75.797 204.05v-175.36" id="path160"/>
                <path d="m75.797 28.684c0-0.78127-0.63288-1.418-1.418-1.418" id="path161"/>
              </g>
              <g stroke="#030303" strokeLinecap="round" strokeMiterlimit="10" strokeWidth=".36" id="g164">
                <path d="m74.379 27.266h-69.164" id="path162"/>
                <path d="m5.2148 27.266c-0.7812 0-1.418 0.63648-1.418 1.418" id="path163"/>
                <path d="m3.7968 28.684v175.36" id="path164"/>
              </g>
              <g fill="none" stroke="#fff" strokeLinecap="round" strokeMiterlimit="10" strokeWidth=".288" id="g288">
                <path d="m48.602 170.5h11.906" />
                <path d="m60.508 167.88v-3.9687" />
                <path d="m60.508 161.29h-11.906" />
                <path d="m48.602 163.91v3.9687" />
                <path d="m60.508 170.5v-0.49608" />
                <path d="m48.602 170.5v-0.49608" />
                <path d="m60.508 161.79v-0.49608" />
                <path d="m48.602 161.79v-0.49608" />
                <path d="m55.688 169.02h-2.2696" />
                <path d="m53.418 162.78c-4.1562 0-4.1562 6.2344 0 6.2344" />
                <path d="m53.418 162.78h2.2696" />
                <path d="m55.688 169.02c4.1562 0 4.1562-6.2344 0-6.2344" />
                <path d="m59.238 105.75h-2.5937" />
                <path d="m56.645 105.75 1.2969 1.2969" />
                <path d="m57.941 107.04 1.2969-1.2969" />
                <path d="m30 118.07v9.9219" />
                <path d="m20.785 127.99-0.70704-0.71093" />
                <path d="m20.078 127.28v-9.211" />
                <path d="m29.289 118.07h0.71064" />
                <path d="m30 127.99h-0.71093" />
                <path d="m25.746 127.99h-1.418" />
                <path d="m25.746 118.07h-1.418" />
                <path d="m20.078 118.07h0.70704" />
                <path d="m47.297 207.64v0.28124" />
                <path d="m48.008 207.83v0.0859" />
                <path d="m48.125 207.83v0.0859" />
                <path d="m48.148 192.05v13.898" />
                <path d="m48.859 206.41v-0.19533" />
                <path d="m48.922 206.22v0.19533" />
                <path d="m49.191 206.41v-0.19533" />
                <path d="m49.426 206.22v1.6992" />
                <path d="m68.367 206.41 0.65239 0.83203" />
                <path d="m68.699 206.41 0.85154 1.418" />
                <path d="m69.551 206.45 0.70704 1.1836" />
                <path d="m68.633 206.41 0.38671 0.83203" />
                <path d="m68.133 206.22v1.6992" />
                <path d="m68.367 206.41v-0.19533" />
                <path d="m68.633 206.41v-0.19533" />
                <path d="m68.699 206.41v-0.19533" />
                <path d="m69.41 205.95v-13.898" />
                <path d="m69.434 207.83v0.0859" />
                <path d="m69.551 207.83v0.0859" />
                <path d="m70.258 207.64v0.28124" />
                <path d="m48.922 206.41-0.38275 0.83203" />
                <path d="m48.008 206.45-0.71093 1.1836" />
                <path d="m48.859 206.41-0.85154 1.418" />
                <path d="m49.191 206.41-0.65232 0.83203" />
                <path d="m68.133 207.92h-18.707" />
                <path d="m47.297 207.92h0.82814" />
                <path d="m69.434 207.92h0.82426" />
                <path d="m69.551 207.83h-0.11722" />
                <path d="m48.125 207.83h-0.11722" />
                <path d="m49.426 207.64h18.707" />
                <path d="m68.699 206.41h-0.33206" />
                <path d="m49.191 206.41h-0.33206" />
                <path d="m49.426 206.22h-1.3164" />
                <path d="m68.133 206.22h1.3164" />
                <path d="m69.41 205.95h-21.262" />
                <path d="m48.148 192.05h21.262" />
                <path d="m69.41 205.95c0 0.17971 0.04687 0.35546 0.1404 0.50782" />
                <path d="m48.008 206.45c0.0936-0.15236 0.1404-0.32811 0.1404-0.50782" />
                <path d="m19.176 170.5h11.906" />
                <path d="m31.082 167.88v-3.9687" />
                <path d="m31.082 161.29h-11.906" />
                <path d="m19.176 163.91v3.9687" />
                <path d="m31.082 170.5v-0.49608" />
                <path d="m19.176 170.5v-0.49608" />
                <path d="m31.082 161.79v-0.49608" />
                <path d="m19.176 161.79v-0.49608" />
                <path d="m26.262 169.02h-2.2656" />
                <path d="m23.996 162.78c-4.1563 0-4.1563 6.2344 0 6.2344" />
                <path d="m23.996 162.78h2.2656" />
                <path d="m26.262 169.02c4.1602 0 4.1602-6.2344 0-6.2344" />
                <path d="m47.422 155.46h1.9844" />
                <path d="m49.406 155.46v-1.9844" />
                <path d="m37.215 141.28h-1.9844" />
                <path d="m35.23 141.28v1.9844" />
                <path d="m37.215 155.46h-1.9844" />
                <path d="m35.23 155.46v-1.9844" />
                <path d="m49.406 143.41v-1.418" />
                <path d="m49.406 141.99-0.71064-0.71064" />
                <path d="m48.695 141.28h-1.418" />
                <path d="m50.605 141c0-0.84376-1.2656-0.84376-1.2656 0 0 0.84377 1.2656 0.84377 1.2656 0" />
                <path d="m9.3125 207.64v0.28124" />
                <path d="m10.023 207.83v0.0859" />
                <path d="m10.141 207.83v0.0859" />
                <path d="m10.164 192.05v13.898" />
                <path d="m10.875 206.41v-0.19533" />
                <path d="m10.938 206.22v0.19533" />
                <path d="m11.207 206.41v-0.19533" />
                <path d="m11.441 206.22v1.6992" />
                <path d="m30.383 206.41 0.65232 0.83203" />
                <path d="m30.715 206.41 0.85154 1.418" />
                <path d="m31.566 206.45 0.70704 1.1836" />
                <path d="m30.652 206.41 0.38282 0.83203" />
                <path d="m30.148 206.22v1.6992" />
                <path d="m30.383 206.41v-0.19533" />
                <path d="m30.652 206.41v-0.19533" />
                <path d="m30.715 206.41v-0.19533" />
                <path d="m31.426 205.95v-13.898" />
                <path d="m31.449 207.83v0.0859" />
                <path d="m31.566 207.83v0.0859" />
                <path d="m32.273 207.64v0.28124" />
                <path d="m10.938 206.41-0.38282 0.83203" />
                <path d="m10.023 206.45-0.71093 1.1836" />
                <path d="m10.875 206.41-0.85162 1.418" />
                <path d="m11.207 206.41-0.65232 0.83203" />
                <path d="m30.148 207.92h-18.707" />
                <path d="m9.3125 207.92h0.82814" />
                <path d="m31.449 207.92h0.82418" />
                <path d="m31.566 207.83h-0.11714" />
                <path d="m10.141 207.83h-0.11722" />
                <path d="m11.441 207.64h18.707" />
                <path d="m30.715 206.41h-0.33199" />
                <path d="m11.207 206.41h-0.33199" />
                <path d="m11.441 206.22h-1.3164" />
                <path d="m30.148 206.22h1.3164" />
                <path d="m10.164 192.05h21.262" />
                <path d="m31.426 205.95c0 0.17971 0.04687 0.35546 0.1404 0.50782" />
                <path d="m10.023 206.45c0.0936-0.15236 0.1404-0.32811 0.1404-0.50782" />
              </g>
              <g id="g334">
                <rect x="16.591" y="29.302" width="46.702" height="49.718" ry=".52358" fill="#ccc" id="rect328"/>
                <g transform="matrix(3.8052 0 0 3.8052 -22.561 -270.04)" fill="#808080" strokeWidth=".26458" id="g333">
                  <path d="m15.481 86.507a0.39158 0.39158 0 1 1-0.39158-0.39158 0.39158 0.39158 0 0 1 0.39158 0.39158" id="path329"/>
                  <path d="m18.897 86.099a4.0587 4.0587 0 0 0-3.4396-3.4396 2.5744 2.5744 0 0 0-0.56885 0.4101v0.37835a3.2226 3.2226 0 0 1 3.22 3.2173h0.37835a2.712 2.712 0 0 0 0.4101-0.56621" id="path330"/>
                  <path d="m19.203 84.911a2.5453 2.5453 0 0 0-2.5585-2.5453c-0.08996 0-0.17727 0-0.26458 0.01323l-0.05821 0.16933a4.3789 4.3789 0 0 1 2.6829 2.6802l0.16933-0.06086c0-0.08467 0.01588-0.16933 0.01588-0.26458" id="path331"/>
                  <path d="m16.674 87.922a3.0268 3.0268 0 0 1-3.0268-3.0136 3.0057 3.0057 0 0 1 0.88635-2.1405l0.17198 0.1614a2.794 2.794 0 0 0 0 3.9688 2.794 2.794 0 0 0 3.9688 0l0.1614 0.1614a3.003 3.003 0 0 1-2.1616 0.86254" id="path332"/>
                  <path d="m16.64 86.84a1.7595 1.7595 0 0 0-0.69056-1.5637 1.7224 1.7224 0 0 0-0.88635-0.35983 0.1614 0.1614 0 0 1-0.14023-0.16933 0.1561 0.1561 0 0 1 0.17198-0.14288 2.077 2.077 0 0 1 1.8521 2.2701 1.8124 1.8124 0 0 1-0.06879 0.35719l0.46038 0.12965a2.5559 2.5559 0 0 0 0.39688-0.15081 2.8152 2.8152 0 0 0 0.05027-0.5424 2.9104 2.9104 0 0 0-2.4686-2.8734 1.2806 1.2806 0 0 0-0.46302 0 1.0081 1.0081 0 0 0-0.50006 0.30956 0.98954 0.98954 0 0 0 0.44186 1.5875 2.2913 2.2913 0 0 0 0.24871 0.04498 0.92869 0.92869 0 0 1 0.77258 0.91546 0.9181 0.9181 0 0 1-0.14817 0.50006l0.3175 0.20373a2.3574 2.3574 0 0 0 0.47625 0.07937 1.741 1.741 0 0 0 0.17462-0.60854" id="path333"/>
                </g>
                <text x="18.515459" y="35.471416" fill="#808080" fontFamily="sans-serif" fontSize="4.0283px" letterSpacing="0px" strokeWidth="0.10071" wordSpacing="0px" style={{lineHeight:1.25}} xmlSpace="preserve" id="text333"><tspan x="18.515459" y="35.471416" fill="#808080" fontFamily="'Ubuntu Mono'" strokeWidth="0.10071" id="tspan333">ESP32-S3-WROOM-1</tspan></text>
              </g>
              <g transform="matrix(.43209 0 0 .43209 112.78 76.464)" id="g336">
                <path d="m-218.38-119.09v-30.238h15.667v18.742h17.719v-18.452h17.252v18.356h17.812v-18.549h32.92v33.426" fill="none" stroke="#5c5c5c" strokeLinecap="round" strokeWidth="3.9877" id="path334"/>
                <path d="m-133.61-115.67v-33.523" fill="none" stroke="#5c5c5c" strokeLinecap="round" strokeWidth="3.9877" id="path335"/>
                <ellipse cx="-117.05" cy="-115.75" rx="1.9123" ry="1.9811" fill="#a80" fillOpacity=".99608" id="ellipse335"/>
                <ellipse cx="-133.6" cy="-115.61" rx="1.9123" ry="1.9811" fill="#a80" fillOpacity=".99608" id="ellipse336"/>
              </g>
              <g transform="translate(130.91 80.253)" id="g337">
                <path d="m-110.84 37.814v9.2148l0.70704 0.70704h9.2148v-9.9219z" fill="#f9f9f9" id="path336"/>
                {/* EL LED RGB - CONECTADO A GPIO48 */}
                <circle 
                  cx="-105.88" 
                  cy="42.774" 
                  r="3.8358" 
                  fill={getBoardRGBColor()}
                  onClick={(e) => handlePinSelect('RGB', e)}
                  style={{ cursor: 'pointer', transition: 'fill 0.3s ease' }}
                  id="circle335" 
                />
                <rect x="-106.54" y="44.585" width="1.323" height="1.323" fill="#a80" id="rect336"/>
              </g>
              <rect x="35.23" y="141.28" width="14.176" height="14.172" ry="0" fill="#1a1a1a" id="rect337"/>
              <text x="37.007381" y="149.4816" fill="#333333" fontFamily="'Noto Sans SC'" fontSize="3.0366px" letterSpacing="0px" strokeWidth=".18979" wordSpacing="0px" style={{lineHeight:1.25}} xmlSpace="preserve" id="text337"><tspan x="37.007381" y="149.4816" fill="#333333" strokeWidth=".18979" id="tspan337"/></text>
              <g transform="translate(130.99 71.683)" id="g339">
                <rect x="-111.81" y="89.61" width="11.906" height="9.211" fill="#9d9d9d" id="rect338"/>
                <rect x="-110.55" y="91.313" width="9.393" height="5.8052" ry="2.9026" id="rect339"/>
              </g>
              <g transform="translate(160.41 71.683)" id="g341">
                <rect x="-111.81" y="89.61" width="11.906" height="9.211" fill="#9d9d9d" id="rect340"/>
                <rect x="-110.55" y="91.313" width="9.393" height="5.8052" ry="2.9026" id="rect341"/>
              </g>
              <g id="g343">
                <path d="m10.164 192.04h21.262l0.0391 14.176 0.80856 1.414v0.28519l-0.82418 3e-5 -1.3008-1.6992v1.6992h-18.707v-1.6992l-1.418 1.6992-0.71093-3e-5v-0.28519l0.81252-1.414z" fill="#9d9d9d" id="path341"/>
                <path d="m48.148 192.04h21.262l0.0391 14.176 0.80856 1.414v0.28519l-0.82418 3e-5 -1.3008-1.6992v1.6992h-18.707v-1.6992l-1.418 1.6992-0.71093-3e-5v-0.28519l0.81252-1.414z" fill="#9d9d9d" id="path342"/>
                <rect x="36.054" y="92.867" width="12.012" height="18.992" ry="0" fill="#1a1a1a" id="rect342"/>
                <rect x="56.441" y="103.82" width="2.9941" height="5.1906" ry="0" fill="#e3dedb" id="rect343"/>
              </g>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="10.460472" y="39.739395" style={{lineHeight:1.25}} xmlSpace="preserve" id="text344"><tspan x="10.460472" y="39.739395" fill="#ffffff" strokeWidth="0.072952" id="tspan344">3V3</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="10.383829" y="47.127853" style={{lineHeight:1.25}} xmlSpace="preserve" id="text345"><tspan x="10.383829" y="47.127853" fill="#ffffff" strokeWidth="0.072952" id="tspan345">RST</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="11.838689" y="54.355518" style={{lineHeight:1.25}} xmlSpace="preserve" id="text346"><tspan x="11.838689" y="54.355518" fill="#ffffff" strokeWidth="0.072952" id="tspan346">4</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="11.681954" y="61.534996" style={{lineHeight:1.25}} xmlSpace="preserve" id="text347"><tspan x="11.681954" y="61.534996" fill="#ffffff" strokeWidth="0.072952" id="tspan347">5</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="11.753198" y="68.810844" style={{lineHeight:1.25}} xmlSpace="preserve" id="text348"><tspan x="11.753198" y="68.810844" fill="#ffffff" strokeWidth="0.072952" id="tspan348">6</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="11.728975" y="76.241493" style={{lineHeight:1.25}} xmlSpace="preserve" id="text349"><tspan x="11.728975" y="76.241493" fill="#ffffff" strokeWidth="0.072952" id="tspan349">7</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="11.130691" y="83.334846" style={{lineHeight:1.25}} xmlSpace="preserve" id="text350"><tspan x="11.130691" y="83.334846" fill="#ffffff" strokeWidth="0.072952" id="tspan350">15</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="11.12069" y="90.257263" style={{lineHeight:1.25}} xmlSpace="preserve" id="text351"><tspan x="11.12069" y="90.257263" fill="#ffffff" strokeWidth="0.072952" id="tspan351">16</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="11.12069" y="97.360077" style={{lineHeight:1.25}} xmlSpace="preserve" id="text352"><tspan x="11.12069" y="97.360077" fill="#ffffff" strokeWidth="0.072952" id="tspan352">17</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="11.12069" y="104.72987" style={{lineHeight:1.25}} xmlSpace="preserve" id="text353"><tspan x="11.12069" y="104.72987" fill="#ffffff" strokeWidth="0.072952" id="tspan353">18</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="11.642968" y="111.86045" style={{lineHeight:1.25}} xmlSpace="preserve" id="text354"><tspan x="11.642968" y="111.86045" fill="#ffffff" strokeWidth="0.072952" id="tspan354">8</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="11.588849" y="118.78944" style={{lineHeight:1.25}} xmlSpace="preserve" id="text355"><tspan x="11.588849" y="118.78944" fill="#ffffff" strokeWidth="0.072952" id="tspan355">3</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="11.417087" y="126.14117" style={{lineHeight:1.25}} xmlSpace="preserve" id="text356"><tspan x="11.417087" y="126.14117" fill="#ffffff" strokeWidth="0.072952" id="tspan356">46</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="11.665792" y="133.272" style={{lineHeight:1.25}} xmlSpace="preserve" id="text357"><tspan x="11.665792" y="133.272" fill="#ffffff" strokeWidth="0.072952" id="tspan357">9</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="11.130691" y="140.27087" style={{lineHeight:1.25}} xmlSpace="preserve" id="text358"><tspan x="11.130691" y="140.27087" fill="#ffffff" strokeWidth="0.072952" id="tspan358">10</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="11.130691" y="147.66386" style={{lineHeight:1.25}} xmlSpace="preserve" id="text359"><tspan x="11.130691" y="147.66386" fill="#ffffff" strokeWidth="0.072952" id="tspan359">11</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="11.130691" y="155.00754" style={{lineHeight:1.25}} xmlSpace="preserve" id="text360"><tspan x="11.130691" y="155.00754" fill="#ffffff" strokeWidth="0.072952" id="tspan360">12</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="11.130691" y="162.23564" style={{lineHeight:1.25}} xmlSpace="preserve" id="text361"><tspan x="11.130691" y="162.23564" fill="#ffffff" strokeWidth="0.072952" id="tspan361">13</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="11.130691" y="169.41655" style={{lineHeight:1.25}} xmlSpace="preserve" id="text362"><tspan x="11.130691" y="169.41655" fill="#ffffff" strokeWidth="0.072952" id="tspan362">14</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="21.216141" y="160.29483" style={{lineHeight:1.25}} xmlSpace="preserve" id="text363"><tspan x="21.216141" y="160.29483" fill="#ffffff" strokeWidth=".072952" id="tspan363">BOOT</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="11.260352" y="176.76085" style={{lineHeight:1.25}} xmlSpace="preserve" id="text364"><tspan x="11.260352" y="176.76085" fill="#ffffff" strokeWidth="0.072952" id="tspan364">5V</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="11.366997" y="183.99532" style={{lineHeight:1.25}} xmlSpace="preserve" id="text365"><tspan x="11.366997" y="183.99532" fill="#ffffff" strokeWidth="0.072952" id="tspan365">G</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="65.957573" y="32.943142" style={{lineHeight:1.25}} xmlSpace="preserve" id="text368"><tspan x="65.957573" y="32.943142" fill="#ffffff" strokeWidth="0.072952" id="tspan368">G</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="65.71122" y="183.67845" style={{lineHeight:1.25}} xmlSpace="preserve" id="text369"><tspan x="65.71122" y="183.67845" fill="#ffffff" strokeWidth="0.072952" id="tspan369">G</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="65.828247" y="176.59435" style={{lineHeight:1.25}} xmlSpace="preserve" id="text370"><tspan x="65.828247" y="176.59435" fill="#ffffff" strokeWidth="0.072952" id="tspan370">G</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="64.775978" y="169.42194" style={{lineHeight:1.25}} xmlSpace="preserve" id="text371"><tspan x="64.775978" y="169.42194" fill="#ffffff" strokeWidth="0.072952" id="tspan371">19</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="64.966629" y="162.07704" style={{lineHeight:1.25}} xmlSpace="preserve" id="text372"><tspan x="64.966629" y="162.07704" fill="#ffffff" strokeWidth="0.072952" id="tspan372">20</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="64.958267" y="155.03503" style={{lineHeight:1.25}} xmlSpace="preserve" id="text373"><tspan x="64.958267" y="155.03503" fill="#ffffff" strokeWidth="0.072952" id="tspan373">21</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="64.814697" y="147.66441" style={{lineHeight:1.25}} xmlSpace="preserve" id="text374"><tspan x="64.814697" y="147.66441" fill="#ffffff" strokeWidth="0.072952" id="tspan374">47</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="64.873451" y="140.48215" style={{lineHeight:1.25}} xmlSpace="preserve" id="text375"><tspan x="64.873451" y="140.48215" fill="#ffffff" strokeWidth="0.072952" id="tspan375">48</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="64.927902" y="133.3483" style={{lineHeight:1.25}} xmlSpace="preserve" id="text376"><tspan x="64.927902" y="133.3483" fill="#ffffff" strokeWidth="0.072952" id="tspan376">45</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="66.232567" y="126.2131" style={{lineHeight:1.25}} xmlSpace="preserve" id="text377"><tspan x="66.232567" y="126.2131" fill="#ffffff" strokeWidth="0.072952" id="tspan377">0</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="64.729881" y="118.82946" style={{lineHeight:1.25}} xmlSpace="preserve" id="text378"><tspan x="64.729881" y="118.82946" fill="#ffffff" strokeWidth="0.072952" id="tspan378">35</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="64.722878" y="111.66489" style={{lineHeight:1.25}} xmlSpace="preserve" id="text379"><tspan x="64.722878" y="111.66489" fill="#ffffff" strokeWidth="0.072952" id="tspan379">36</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="64.89447" y="104.48494" style={{lineHeight:1.25}} xmlSpace="preserve" id="text380"><tspan x="64.89447" y="104.48494" fill="#ffffff" strokeWidth="0.072952" id="tspan380">37</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="64.841736" y="97.313347" style={{lineHeight:1.25}} xmlSpace="preserve" id="text381"><tspan x="64.841736" y="97.313347" fill="#ffffff" strokeWidth="0.072952" id="tspan381">38</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="64.662766" y="90.139435" style={{lineHeight:1.25}} xmlSpace="preserve" id="text382"><tspan x="64.662766" y="90.139435" fill="#ffffff" strokeWidth="0.072952" id="tspan382">39</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="65.007683" y="82.910072" style={{lineHeight:1.25}} xmlSpace="preserve" id="text383"><tspan x="65.007683" y="82.910072" fill="#ffffff" strokeWidth="0.072952" id="tspan383">40</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="64.820717" y="75.745499" style={{lineHeight:1.25}} xmlSpace="preserve" id="text384"><tspan x="64.820717" y="75.745499" fill="#ffffff" strokeWidth="0.072952" id="tspan384">41</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="64.894836" y="68.536179" style={{lineHeight:1.25}} xmlSpace="preserve" id="text385"><tspan x="64.894836" y="68.536179" fill="#ffffff" strokeWidth="0.072952" id="tspan385">42</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="66.298698" y="61.38464" style={{lineHeight:1.25}} xmlSpace="preserve" id="text386"><tspan x="66.298698" y="61.38464" fill="#ffffff" strokeWidth="0.072952" id="tspan386">2</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="66.45063" y="54.112865" style={{lineHeight:1.25}} xmlSpace="preserve" id="text387"><tspan x="66.45063" y="54.112865" fill="#ffffff" strokeWidth="0.072952" id="tspan387">1</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="64.582176" y="47.078388" style={{lineHeight:1.25}} xmlSpace="preserve" id="text388"><tspan x="64.582176" y="47.078388" fill="#ffffff" strokeWidth="0.072952" id="tspan388">RX</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="64.92009" y="39.831326" style={{lineHeight:1.25}} xmlSpace="preserve" id="text389"><tspan x="64.92009" y="39.831326" fill="#ffffff" strokeWidth="0.072952" id="tspan389">TX</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="55.431389" y="187.22548" style={{lineHeight:1.25}} xmlSpace="preserve" id="text390"><tspan x="55.431389" y="187.22548" fill="#ffffff" strokeWidth=".072952" id="tspan390">USB</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="49.828423" y="160.43681" style={{lineHeight:1.25}} xmlSpace="preserve" id="text391"><tspan x="49.828423" y="160.43681" fill="#ffffff" strokeWidth=".072952" id="tspan391">RESET</tspan></text>
              <text fill="#ffffff" fontFamily="sans-serif" fontSize="2.9181px" x="10.370093" y="32.993908" style={{lineHeight:1.25}} xmlSpace="preserve" id="text343"><tspan x="10.370093" y="32.993908" fill="#ffffff" strokeWidth="0.072952" id="tspan343">3V3</tspan></text>
            </g>
          </svg>
       </div>
    </div>
  );
}