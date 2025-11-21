#include "WebHandler.h"
#include "LedController.h" // Necesitamos controlar los LEDs
#include "AppConfig.h"
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <LittleFS.h>
#include <ArduinoJson.h>

AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

// Función privada para notificar a todos
void notifyClients() {
    StaticJsonDocument<300> doc;
    
    // Obtenemos estado del LED desde el otro módulo
    int r, g, b;
    getLedStatus(r, g, b);
    
    doc["r"] = r; doc["g"] = g; doc["b"] = b;
    doc["rssi"] = WiFi.RSSI();
    doc["uptime"] = millis() / 1000;
    doc["heap"] = ESP.getFreeHeap();
    
    String json;
    serializeJson(doc, json);
    ws.textAll(json);
}

void onWsEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
    if (type == WS_EVT_CONNECT) {
        Serial.printf("Cliente conectado ID: %u\n", client->id());
    } 
    else if (type == WS_EVT_DATA) {
        AwsFrameInfo *info = (AwsFrameInfo*)arg;
        if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
            data[len] = 0;
            StaticJsonDocument<200> doc;
            DeserializationError error = deserializeJson(doc, (char*)data);
            if (!error) {
                if (doc.containsKey("r")) {
                    updateColor(doc["r"], doc["g"], doc["b"]);
                    notifyClients(); // Feedback inmediato
                }
            }
        }
    }
}

void initServer() {
    if(!LittleFS.begin(true)){
        Serial.println("Error LittleFS");
        return;
    }

    ws.onEvent(onWsEvent);
    server.addHandler(&ws);

    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
        request->send(LittleFS, "/index.html", "text/html");
    });
    server.serveStatic("/", LittleFS, "/");
    
    server.begin();
    Serial.println("Servidor Web iniciado");
}

void handleWebSockets() {
    ws.cleanupClients();
}

void sendTelemetry() {
    notifyClients();
}