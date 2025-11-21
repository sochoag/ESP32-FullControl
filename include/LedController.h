#ifndef LED_CONTROLLER_H
#define LED_CONTROLLER_H

#include <Arduino.h>

void initLeds();
void updateColor(int r, int g, int b);
void getLedStatus(int &r, int &g, int &b); // Para leer el estado actual

#endif