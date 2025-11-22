#include "WebHandler.h"
#include "GpioController.h" // <--- IMPORTANTE: Conexión con el hardware
#include "AppConfig.h"
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <LittleFS.h>
#include <ArduinoJson.h>

// Objetos globales del servidor
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

// Variables para el control de tiempo
unsigned long _lastTelemetryTime = 0;
const long FAST_TELEMETRY_INTERVAL = 200; // 200ms = 5 veces por segundo (Rápido para botones/sensores)

// --- MANEJADOR DE EVENTOS WEBSOCKET ---
void onWsEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
    
    // 1. Cliente se conecta
    if (type == WS_EVT_CONNECT) {
        Serial.printf("WS: Cliente conectado ID: %u\n", client->id());
        // Opcional: Enviar estado inicial aquí si fuera necesario
    } 
    
    // 2. Recibimos datos (JSON desde React)
    else if (type == WS_EVT_DATA) {
        AwsFrameInfo *info = (AwsFrameInfo*)arg;
        if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
            
            data[len] = 0; // Asegurar terminación de string
            
            StaticJsonDocument<512> doc; // Buffer suficiente para el JSON
            DeserializationError error = deserializeJson(doc, (char*)data);

            if (!error) {
                // Verificamos si es un comando de control de pines
                // Ejemplo recibido: {"pin": 48, "mode": "OUTPUT", "val": 1, ...}
                if (doc.containsKey("pin") && doc.containsKey("mode")) {
                    
                    int pin = doc["pin"];
                    String mode = doc["mode"];
                    
                    // Valores opcionales (usamos defaults seguros si no vienen)
                    int val = doc.containsKey("val") ? doc["val"] : 0;
                    int pwm = doc.containsKey("pwm") ? doc["pwm"] : 0;
                    String rgb = doc.containsKey("rgb") ? doc["rgb"].as<String>() : "#000000";

                    // --- ENVIAR AL CONTROLADOR DE HARDWARE ---
                    handleGpioCommand(pin, mode, val, pwm, rgb);
                }
            } else {
                Serial.print("WS Error: JSON invalido");
            }
        }
    }
}

// --- INICIALIZACIÓN DEL SERVIDOR ---
void initServer() {
    // 1. Montar sistema de archivos para la web
    if(!LittleFS.begin(true)){
        Serial.println("Error al montar LittleFS");
        return;
    }

    // 2. Configurar WebSocket
    ws.onEvent(onWsEvent);
    server.addHandler(&ws);

    // 3. Configurar ruta principal (index.html)
    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
        request->send(LittleFS, "/index.html", "text/html");
    });

    // 4. Servir archivos estáticos (JS, CSS, Iconos)
    server.serveStatic("/", LittleFS, "/");
    
    // 5. Arrancar
    server.begin();
    Serial.println("Servidor Web iniciado en puerto 80");
}

// --- LOOP PRINCIPAL DE WEB (Se llama desde main loop) ---
void handleWebTasks() {
    // 1. Mantenimiento de conexiones (limpiar clientes viejos)
    ws.cleanupClients();

    // 2. Telemetría Rápida (Polling de Inputs/Touch)
    unsigned long currentMillis = millis();
    if (currentMillis - _lastTelemetryTime >= FAST_TELEMETRY_INTERVAL) {
        _lastTelemetryTime = currentMillis;
        
        // Pedimos al GpioController que lea los sensores activos
        // Retorna algo como: {"gpio": {"0": 1, "15": 4500}} o "{}" si no hay nada
        String gpioJson = getGpioReadings();
        
        // Solo enviamos por la red si hay datos reales para no saturar
        if (gpioJson != "{}") {
            Serial.print(">> ENVIANDO JSON: ");
            Serial.println(gpioJson); // <--- AQUÍ VERÁS LOS DATOS EN LA CONSOLA
            
            ws.textAll(gpioJson);
        } 
        // Opcional: Descomenta esto si quieres ver que el loop funciona aunque esté vacío
        else { Serial.println(".. (nada que enviar) .."); }
    }
}