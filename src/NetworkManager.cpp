#include "NetworkManager.h"
#include "AppConfig.h"
#include <WiFi.h>
#include <ESPmDNS.h>
#include <ArduinoOTA.h>
#include <LittleFS.h>
#include <WiFiManager.h>


void initWiFi() {
    // Configurar modo y Hostname antes de nada
    WiFi.mode(WIFI_STA);
    WiFi.setHostname(HOSTNAME);
    
    Serial.println("--- ESTADO DE RED ---");
    
    // 1. INTENTO RÁPIDO: Probar si ya tenemos credenciales guardadas
    // WiFi.begin() sin argumentos usa las últimas credenciales almacenadas en Flash
    WiFi.begin(); 
    
    Serial.print("Intentando conectar con credenciales guardadas");
    
    // Esperamos hasta 10 segundos (20 intentos de 500ms)
    int retries = 0;
    while (WiFi.status() != WL_CONNECTED && retries < 20) {
        delay(500);
        Serial.print(".");
        retries++;
    }

    // 2. Si conectó, salimos inmediatamente.
    // NO tocamos WiFiManager, por lo tanto, el puerto 80 está virgen para React.
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n¡Conectado!");
        Serial.print("IP: "); Serial.println(WiFi.localIP());
        
        if (MDNS.begin(HOSTNAME)) {
            Serial.println("mDNS iniciado");
        }
        return;
    }

    // 3. No conectó. Necesitamos el Portal.
    Serial.println("\nNo hay conexión. Invocando WiFiManager...");
    
    WiFiManager wm;
    // Opcional: wm.resetSettings(); // Solo para pruebas si quieres borrar todo
    wm.setConfigPortalTimeout(180); // 3 minutos para configurar o se rinde

    // Esto levanta el servidor conflicto (Puerto 80)
    // El código se detiene aquí hasta que configures el WiFi con tu celular
    bool res = wm.autoConnect(HOSTNAME "-Setup"); 

    if(!res) {
        Serial.println("Error: Timeout o fallo al conectar.");
        // Si falló, reiniciamos para volver a intentar desde cero
        ESP.restart();
    } 
    
    // 4. 
    // Si llegamos aquí, es que acabas de configurar el WiFi exitosamente.
    // Pero el puerto 80 quedó "sucio" por el servidor de configuración.
    // En lugar de pelear, reiniciamos el chip.
    Serial.println("Configuración exitosa. Reiniciando para aplicar modo limpio...");
    delay(1000);
    ESP.restart(); 
}

void resetWiFiSettings() {
    Serial.println("¡Borrando credenciales WiFi!");
    WiFiManager wm;
    wm.resetSettings(); // Esta es la instrucción mágica
    
    // Opcional: Un pequeño delay para asegurar que se guarde el borrado
    delay(500); 
    
    Serial.println("Reiniciando...");
    ESP.restart();
}

void initOTA() {
    ArduinoOTA.setHostname(HOSTNAME);
    
    ArduinoOTA.onStart([]() {
        String type;
        if (ArduinoOTA.getCommand() == U_FLASH) type = "sketch";
        else type = "filesystem";
        LittleFS.end(); 
        Serial.println("OTA Start: " + type);
    });

    ArduinoOTA.onEnd([]() { Serial.println("\nOTA End"); });
    ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
        Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
    });
    ArduinoOTA.onError([](ota_error_t error) {
        Serial.printf("Error[%u]: ", error);
    });

    ArduinoOTA.begin();
}

void handleOTA() {
    ArduinoOTA.handle();
}