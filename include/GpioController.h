#ifndef GPIO_CONTROLLER_H
#define GPIO_CONTROLLER_H

#include <Arduino.h>
#include <ArduinoJson.h>

// Inicializa periféricos globales (como el Neopixel integrado)
void initGpio();

// Procesa el comando recibido desde el WebSocket
void handleGpioCommand(int pin, String mode, int val, int pwm, String rgb);

// Función que devuelve un JSON String con las lecturas de sensores
String getGpioReadings();
#endif