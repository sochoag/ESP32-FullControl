import { useState } from 'react'
import './App.css'

function App() {
  const [color, setColor] = useState("#000000")

  // Función para convertir HEX (#ff0000) a RGB y enviarlo
  const handleColorChange = async (event) => {
    const hex = event.target.value;
    setColor(hex);

    // Magia para convertir Hex a R, G, B
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);

    try {
      // Enviamos los datos como parámetros en la URL
      // No esperamos respuesta (await) para que se sienta fluido al deslizar
      fetch(`/color?r=${r}&g=${g}&b=${b}`)
    } catch (error) {
      console.error("Error enviando color", error)
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      marginTop: '50px', 
      fontFamily: 'Arial',
      backgroundColor: '#222', // Fondo oscuro para resaltar el LED
      height: '100vh',
      color: 'white'
    }}>
      <h1>Control ESP32-S3</h1>
      
      <div style={{
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#333',
        borderRadius: '15px',
        textAlign: 'center'
      }}>
        <p>Selecciona el color del Neopixel:</p>
        
        {/* El input nativo de color */}
        <input 
          type="color" 
          value={color} 
          onChange={handleColorChange}
          style={{
            width: '100px',
            height: '100px',
            cursor: 'pointer',
            border: 'none',
            background: 'none'
          }} 
        />
        
        <p style={{marginTop: '10px', fontFamily: 'monospace'}}>
          {color}
        </p>
      </div>
    </div>
  )
}

export default App