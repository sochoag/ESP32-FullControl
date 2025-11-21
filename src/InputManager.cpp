#include <Arduino.h>
#include "InputManager.h"
#include "AppConfig.h"
#include "LedController.h"
#include "NetworkManager.h"

// Variables internas de estado
unsigned long _buttonPressStartTime = 0;
bool _isButtonPressing = false;
const int _LONG_PRESS_TIME = 3000; // 3 segundos

void initInput() {
    pinMode(PIN_BOOT, INPUT_PULLUP);
}

void handleInput() {
    // GPIO 0 (BOOT) es LOW cuando se presiona
    if (digitalRead(PIN_BOOT) == LOW) {
        
        // Inicio de la presión
        if (!_isButtonPressing) {
            _isButtonPressing = true;
            _buttonPressStartTime = millis();
            Serial.println("Botón presionado...");
        }
        
        unsigned long pressDuration = millis() - _buttonPressStartTime;

        // Feedback: Naranja mientras espera
        if (pressDuration > 500 && pressDuration < _LONG_PRESS_TIME) {
             updateColor(255, 165, 0); 
        }

        // Acción: Resetear si supera el tiempo
        if (pressDuration >= _LONG_PRESS_TIME) {
            updateColor(255, 0, 0); // Rojo
            resetWiFiSettings();    // Llamada a NetworkManager
        }

    } else {
        // Al soltar el botón
        if (_isButtonPressing) {
            _isButtonPressing = false;
            updateColor(0, 50, 0); // Volver a Verde
            Serial.println("Botón liberado.");
        }
    }
}