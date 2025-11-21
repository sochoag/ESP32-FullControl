#include "NetworkManager.h"
#include "AppConfig.h"
#include <WiFi.h>
#include <ESPmDNS.h>
#include <ArduinoOTA.h>
#include <LittleFS.h> // Necesario para apagar FS durante OTA

void initWiFi() {
    WiFi.mode(WIFI_STA);
    WiFi.setHostname(HOSTNAME);
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    
    Serial.print("Conectando a WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi Conectado.");
    Serial.print("IP: "); Serial.println(WiFi.localIP());

    if (MDNS.begin(HOSTNAME)) {
        Serial.println("mDNS iniciado");
    }
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