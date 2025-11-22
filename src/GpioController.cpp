#include "GpioController.h"
#include <Adafruit_NeoPixel.h>

#define ONBOARD_NEO_PIN 48
#define MAX_PINS 50 // El S3 tiene hasta GPIO 48 aprox

Adafruit_NeoPixel onboardLed(1, ONBOARD_NEO_PIN, NEO_GRB + NEO_KHZ800);

// --- MEMORIA DE ESTADO ---
// 0: Nada/Output, 1: Input, 2: Touch, 3: ADC
uint8_t activeModes[MAX_PINS] = {0}; 

uint32_t hexToColor(String hex) {
    if (hex.startsWith("#")) hex = hex.substring(1);
    return (uint32_t)strtol(hex.c_str(), NULL, 16);
}

void initGpio() {
    onboardLed.begin();
    onboardLed.setBrightness(50);
    // Limpiamos el array de modos
    memset(activeModes, 0, sizeof(activeModes));
}

void handleGpioCommand(int pin, String mode, int val, int pwm, String rgb) {
    if (pin < 0 || pin >= MAX_PINS) return;

    Serial.printf("CMD -> Pin: %d | Mode: %s\n", pin, mode.c_str());

    // Actualizamos el registro de modos para saber qué leer luego
    if (mode == "INPUT") activeModes[pin] = 1;
    else if (mode == "TOUCH") activeModes[pin] = 2; // "TOUCH" no es nativo de Arduino String, pero lo recibimos del frontend
    else if (mode == "ADC") activeModes[pin] = 3;
    else activeModes[pin] = 0; // Output, PWM o Neopixel no necesitan leerse periódicamente

    // --- EJECUCIÓN DE HARDWARE ---
    if (mode == "OUTPUT") {
        pinMode(pin, OUTPUT);
        digitalWrite(pin, val);
    }
    else if (mode == "INPUT") {
        pinMode(pin, INPUT_PULLUP); // Usamos PULLUP por defecto para botones simples
    }
    else if (mode == "PWM") {
        pinMode(pin, OUTPUT);
        analogWrite(pin, pwm);
    }
    else if (mode == "NEOPIXEL") {
        if (pin == ONBOARD_NEO_PIN) {
            onboardLed.setPixelColor(0, hexToColor(rgb));
            onboardLed.show();
        }
    }
    // Touch y ADC solo configuran, la lectura es en getGpioReadings
}

// --- NUEVO: RECOLECTOR DE DATOS ---
String getGpioReadings() {
    // Creamos un JSON ligero: {"gpio": { "4": 1, "15": 3200 }}
    // Usamos DynamicJsonDocument porque el tamaño puede variar
    DynamicJsonDocument doc(2048);
    JsonObject root = doc.createNestedObject("gpio");
    bool hasData = false;

    for (int i = 0; i < MAX_PINS; i++) {
        // Si es INPUT (Digital)
        if (activeModes[i] == 1) {
            root[String(i)] = digitalRead(i); 
            hasData = true;
        }
        // Si es TOUCH (Capacitivo)
        else if (activeModes[i] == 2) {
            // touchRead es nativo en ESP32 Arduino Core
            root[String(i)] = touchRead(i); 
            hasData = true;
        }
        // Si es ADC (Analógico)
        else if (activeModes[i] == 3) {
            root[String(i)] = analogRead(i);
            hasData = true;
        }
    }

    if (!hasData) return "{}"; // No enviar nada si no hay inputs configurados

    String json;
    serializeJson(doc, json);
    return json;
}