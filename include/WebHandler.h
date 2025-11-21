#ifndef WEB_HANDLER_H
#define WEB_HANDLER_H

void initServer();
void handleWebSockets(); // Cleanup
void sendTelemetry();    // Enviar datos periódicos

#endif