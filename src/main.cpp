#include <Arduino.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <LittleFS.h>
#include <ArduinoJson.h>
#include <Adafruit_NeoPixel.h>
#include <ESPmDNS.h>

// --- Configuracion WIFI ---
const char* ssid = "sochoag";
const char* password = "sochoagu";

// CONFIGURACIÓN NEOPIXEL ESP32-S3
// IMPORTANTE: Verifica si tu pin es 48, 38 o 21 según tu fabricante.
#define PIN_NEO 48 
#define NUMPIXELS 1

Adafruit_NeoPixel pixels(NUMPIXELS, PIN_NEO, NEO_GRB + NEO_KHZ800);


// Creamos el servidor en el puerto 80
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

// --- LÓGICA WEBSOCKET ---
void onWsEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
  // Solo nos interesa cuando llega data (texto)
  if (type == WS_EVT_DATA) {
    AwsFrameInfo *info = (AwsFrameInfo*)arg;
    if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
      
      // Parseamos el JSON recibido: {"r":255, "g":0, "b":0}
      // Añadimos el caracter nulo al final para convertirlo en string seguro
      data[len] = 0;
      
      StaticJsonDocument<200> doc;
      DeserializationError error = deserializeJson(doc, (char*)data);

      if (!error) {
        int r = doc["r"];
        int g = doc["g"];
        int b = doc["b"];
        
        pixels.setPixelColor(0, pixels.Color(r, g, b));
        pixels.show();
        
        // Opcional: Responder a todos los clientes conectados el nuevo color
        // ws.textAll((char*)data); 
      }
    }
  }
}


void setup() {
  // 1. Iniciar Monitor Serie para depuracion
  Serial.begin(115200);
  while (!Serial) {
    delay(10);
  }

  // Iniciar Neopixel
  pixels.begin();
  pixels.setBrightness(255); // Brillo moderado (0-255)
  pixels.clear();
  pixels.show();

  // 2. Iniciar el sistema de archivos LittleFS
  // Esto es vital para poder leer el HTML/JS de React
  if(!LittleFS.begin(true)){
    Serial.println("Error al montar LittleFS. ¿Has subido el sistema de archivos?");
    return;
  }
  Serial.println("LittleFS montado correctamente.");
  
  // 3. Conectar al WiFi
  Serial.print("Conectando a WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nConectado!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // --- INICIO mDNS ---
  // Esto nos permite entrar como "http://esp32s3.local"
  if (!MDNS.begin("esp32s3")) { // <--- Puedes cambiar "esp32s3" por el nombre que quieras
    Serial.println("Error configurando mDNS!");
  } else {
    Serial.println("mDNS iniciado! Entra a: http://esp32s3.local");
  }
  // -------------------

  // 1. Configurar manejador de WebSocket
  ws.onEvent(onWsEvent);
  server.addHandler(&ws);

  // 2. Rutas Web
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(LittleFS, "/index.html", "text/html");
  });
  server.serveStatic("/", LittleFS, "/");

  server.begin();
  Serial.println("Servidor Web iniciado.");
}

void loop() {
  // IMPORTANTE: Limpiar clientes desconectados para liberar memoria
  ws.cleanupClients();
  
  // Pequeño delay para no saturar la CPU en el loop vacío
  delay(2);
}