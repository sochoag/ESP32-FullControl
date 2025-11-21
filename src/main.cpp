#include <Arduino.h>
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <LittleFS.h>
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

  // 4. Configurar las Rutas del Servidor Web
  
  // Ruta principal: Si alguien entra a "/", servir el index.html
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(LittleFS, "/index.html", "text/html");
  });

  // NUEVA RUTA: Recibe color por parámetros GET
  // Ejemplo de llamada: http://IP/color?r=255&g=0&b=0
  server.on("/color", HTTP_GET, [](AsyncWebServerRequest *request){
    
    if (request->hasParam("r") && request->hasParam("g") && request->hasParam("b")) {
      int r = request->getParam("r")->value().toInt();
      int g = request->getParam("g")->value().toInt();
      int b = request->getParam("b")->value().toInt();

      // Poner color en el Neopixel
      pixels.setPixelColor(0, pixels.Color(r, g, b));
      pixels.show();

      Serial.printf("Color recibido: R=%d G=%d B=%d\n", r, g, b);
      request->send(200, "text/plain", "Color OK");
    } else {
      request->send(400, "text/plain", "Faltan parametros");
    }
  });

  // MAGIA: Servir archivos estáticos (CSS, JS, Imágenes) automáticamente
  // Esta línea le dice al servidor: "Si piden un archivo que no definí arriba, búscalo en LittleFS"
  server.serveStatic("/", LittleFS, "/");

  // 5. Iniciar el Servidor
  server.begin();
  Serial.println("Servidor Web iniciado.");
}

void loop() {
  // Por ahora el loop está vacío porque el servidor web es asíncrono.
  // Funciona en "segundo plano" gracias a las librerías Async.
  // Aquí pondremos luego la lógica de control (leer botones, sensores, etc.)
}