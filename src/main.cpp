#include <Arduino.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <LittleFS.h>
#include <ArduinoJson.h>
#include <Adafruit_NeoPixel.h>
#include <ESPmDNS.h>
#include <ArduinoOTA.h>

// ==========================================
// CONFIGURACIÓN GENERAL
// ==========================================
const char* ssid = "sochoag";
const char* password = "sochoagu";
const char* hostname = "esp32s3"; // Un solo nombre para mDNS y OTA

// Hardware
#define PIN_NEO 48 
#define NUMPIXELS 1

// ==========================================
// OBJETOS GLOBALES
// ==========================================
Adafruit_NeoPixel pixels(NUMPIXELS, PIN_NEO, NEO_GRB + NEO_KHZ800);
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

// ==========================================
// ESTADO DEL SISTEMA (Variables Globales)
// ==========================================
// Variables para el control de tiempo (Telemetría)
unsigned long lastTelemetryTime = 0;
const long telemetryInterval = 2000;

// Guardamos el estado aquí para poder enviarlo por Telemetría luego
int currentR = 0;
int currentG = 0;
int currentB = 0;

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

// Función dedicada a aplicar el color y actualizar variables
void updateColor(int r, int g, int b) {
  currentR = r;
  currentG = g;
  currentB = b;
  pixels.setPixelColor(0, pixels.Color(r, g, b));
  pixels.show();
}

void notifyClients() {
  StaticJsonDocument<300> doc; // Aumentamos un poco el tamaño
  
  // 1. Estado de la luz (para sincronizar interfaz)
  doc["r"] = currentR;
  doc["g"] = currentG;
  doc["b"] = currentB;
  
  // 2. Datos técnicos (Telemetría)
  doc["rssi"] = WiFi.RSSI();          // Potencia de señal WiFi
  doc["uptime"] = millis() / 1000;    // Segundos encendido
  doc["heap"] = ESP.getFreeHeap();    // Memoria RAM libre
  
  String json;
  serializeJson(doc, json);
  
  // Enviar a todos los clientes conectados
  ws.textAll(json);
  Serial.println(json);
}


// Manejador de eventos WebSocket
void onWsEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
  if (type == WS_EVT_CONNECT ) {
    Serial.printf("Cliente conectado ID: %u\n", client->id());
  }
  
  if (type == WS_EVT_DATA) {
    AwsFrameInfo *info = (AwsFrameInfo*)arg;
    if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
      
      data[len] = 0; // Null termination
      StaticJsonDocument<200> doc;
      DeserializationError error = deserializeJson(doc, (char*)data);

      if (!error) {
        // Si recibimos JSON, actualizamos el color usando nuestra función centralizada
        if (doc.containsKey("r") && doc.containsKey("g") && doc.containsKey("b")) {
            updateColor(doc["r"], doc["g"], doc["b"]);
            notifyClients();
        }
      }
    }
  }
}

// Configuración del WiFi
void setupWiFi() {
  WiFi.mode(WIFI_STA); // Modo Estación (cliente) explícito
  WiFi.setHostname(hostname); // Asigna nombre a nivel de red
  WiFi.begin(ssid, password);
  
  Serial.print("Conectando a WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Conectado.");
  Serial.print("IP: "); Serial.println(WiFi.localIP());
}

// Configuración de OTA (Limpia y sin conflictos)
void setupOTA() {
  ArduinoOTA.setHostname(hostname); // Usamos el mismo nombre que definimos arriba

  ArduinoOTA.onStart([]() {
    String type;
    if (ArduinoOTA.getCommand() == U_FLASH) type = "sketch";
    else type = "filesystem";
    LittleFS.end(); // Desmontar FS para evitar corrupción
    Serial.println("Start updating " + type);
  });

  ArduinoOTA.onEnd([]() { Serial.println("\nEnd"); });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
  });

  ArduinoOTA.begin();
  Serial.println("OTA Listo");
}

// ==========================================
// SETUP Y LOOP PRINCIPAL
// ==========================================

void setup() {
  // 1. Serial (Sin bloqueo)
  Serial.begin(115200);
  // Eliminamos el while(!Serial) para que funcione con cargador de pared
  delay(100); 

  // 2. Hardware
  pixels.begin();
  pixels.setBrightness(50);
  updateColor(255, 50, 0); // Iniciar apagado (o poner un color por defecto)

  // 3. Sistema de Archivos
  if(!LittleFS.begin(true)){
    Serial.println("Error LittleFS");
    return;
  }

  // 4. Red y OTA
  setupWiFi();
  setupOTA();
  
  // 5. mDNS (Opcional explicito, OTA ya suele manejarlo, pero esto asegura el link web)
  if (MDNS.begin(hostname)) {
    Serial.println("mDNS responder started");
  }

  // 6. Servidor Web y Sockets
  ws.onEvent(onWsEvent);
  server.addHandler(&ws);

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(LittleFS, "/index.html", "text/html");
  });
  server.serveStatic("/", LittleFS, "/");
  
  server.begin();
  Serial.println("Servidor Web iniciado");
  
  // Feedback visual de que todo inició bien (Verde suave)
  updateColor(0, 50, 0); 
}

void loop() {
  ArduinoOTA.handle();
  ws.cleanupClients();

  // Lógica de Telemetría (Non-blocking delay)
  unsigned long currentMillis = millis();
  if (currentMillis - lastTelemetryTime >= telemetryInterval) {
    lastTelemetryTime = currentMillis;
    notifyClients(); // <--- Enviar estado cada 2 segundos
  }

  delay(2);
}