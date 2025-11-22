#include <Arduino.h>
#include "NetworkManager.h"
#include "WebHandler.h"
#include "InputManager.h"
#include "GpioController.h"

void setup() {
    Serial.begin(115200);
    delay(100);

    // Inicialización de Módulos

    initGpio();     // GPIOs
    initInput();    // Botones
    initWiFi();     // Red (o Portal de Configuración)
    initOTA();      // Actualizaciones Aéreas
    initServer();   // Web y WebSockets
}

void loop() {
    // Ciclo de vida de los módulos
    handleOTA();      // Escuchar actualizaciones de firmware
    handleWebTasks(); // Gestionar clientes web y enviar telemetría
    handleInput();    // Escuchar botón físico (Reset)
    
    delay(10); // Pequeño respiro para la CPU
}