#include <Arduino.h>
#include "LedController.h"
#include "NetworkManager.h"
#include "WebHandler.h"
#include "InputManager.h"

void setup() {
    Serial.begin(115200);
    delay(100);

    // Inicialización de Módulos
    initLeds();     // Luces
    initInput();    // Botones
    initWiFi();     // Red (o Portal de Configuración)
    initOTA();      // Actualizaciones Aéreas
    initServer();   // Web y WebSockets
    
    // Señal de "Sistema Listo"
    updateColor(0, 50, 0);
}

void loop() {
    // Ciclo de vida de los módulos
    handleOTA();      // Escuchar actualizaciones de firmware
    handleWebTasks(); // Gestionar clientes web y enviar telemetría
    handleInput();    // Escuchar botón físico (Reset)
    
    delay(10); // Pequeño respiro para la CPU
}