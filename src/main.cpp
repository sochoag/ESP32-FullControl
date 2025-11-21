#include <Arduino.h>
#include "AppConfig.h"
#include "LedController.h"
#include "NetworkManager.h"
#include "WebHandler.h"

unsigned long lastTelemetryTime = 0;

void setup() {
    Serial.begin(115200);
    delay(100);

    // Iniciamos módulos uno por uno
    initLeds();
    initWiFi();
    initOTA();
    initServer();
    
    // Señal visual de inicio correcto (Verde suave)
    updateColor(0, 50, 0);
}

void loop() {
    // Mantenimiento constante
    handleOTA();
    handleWebSockets();

    // Telemetría periódica
    unsigned long currentMillis = millis();
    if (currentMillis - lastTelemetryTime >= TELEMETRY_INTERVAL) {
        lastTelemetryTime = currentMillis;
        sendTelemetry();
    }
    
    delay(2);
}