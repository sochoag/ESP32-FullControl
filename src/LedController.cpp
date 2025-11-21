#include "LedController.h"
#include "AppConfig.h"
#include <Adafruit_NeoPixel.h>

Adafruit_NeoPixel pixels(NUM_LEDS, PIN_NEO, NEO_GRB + NEO_KHZ800);

// Estado interno
int _r = 0, _g = 0, _b = 0;

void initLeds() {
    pixels.begin();
    pixels.setBrightness(50);
    updateColor(0, 0, 0); // Empezar apagado
}

void updateColor(int r, int g, int b) {
    _r = r; _g = g; _b = b;
    pixels.setPixelColor(0, pixels.Color(r, g, b));
    pixels.show();
}

void getLedStatus(int &r, int &g, int &b) {
    r = _r;
    g = _g;
    b = _b;
}