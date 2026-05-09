# 🎮 ESP32-FullControl

> A comprehensive, modular IoT control system built on **ESP32-S3** with Web UI, WebSocket support, OTA updates, and telemetry.
>
> ## 📋 Overview
>
> ESP32-FullControl is a production-ready embedded system that provides:
> - **Web-based Dashboard** - React frontend for real-time control and monitoring
> - - **Physical Controls** - GPIO management with button inputs
>   - - **LED/Relay Control** - Extensible hardware control interface
>     - - **WebSocket Communication** - Real-time bidirectional data streaming
>       - - **OTA (Over-The-Air) Updates** - Firmware updates without USB connection
>         - - **WiFi Management** - Built-in WiFi config portal and connectivity
>           - - **Telemetry System** - Real-time metrics and system monitoring
>             - - **Modular Architecture** - Clean separation of concerns for easy extension
>              
>               - ## ✨ Key Features
>              
>               - ### Hardware Control
>               - - ✅ GPIO Controller - Flexible GPIO pin management
>                 - - ✅ LED Controller - NeoPixel/WS2812B RGB LED support
> - ✅ Input Manager - Button/switch input handling with debouncing
> - - ✅ Network Manager - WiFi connectivity with auto-reconnect
>  
>   - ### Software Features
>   - - ✅ AsyncWeb Server - Non-blocking web server with LittleFS filesystem
>     - - ✅ WebSocket Support - Real-time bidirectional communication
>       - - ✅ WiFi Manager Portal - Easy network configuration
>         - - ✅ OTA Updates - Update firmware over the air
>           - - ✅ Serial Monitor - 115200 baud debugging interface
>             - - ✅ Modular Design - Easy to add new controllers/features
>              
>               - ## 🛠️ Tech Stack
>              
>               - | Component | Technology | Version |
>               - |-----------|-----------|----------|
>               - | **MCU** | ESP32-S3 DevKit-C | 1.0 |
> | **Framework** | Arduino | Latest |
> | **Build System** | PlatformIO | Latest |
> | **Web Server** | ESPAsyncWebServer | ^3.0.0 |
> | **JSON** | ArduinoJson | ^6.21.3 |
> | **LEDs** | Adafruit NeoPixel | ^1.12.0 |
> | **WiFi Config** | WiFiManager | ^2.0.17 |
> | **Filesystem** | LittleFS | Built-in |
> | **Protocol** | WebSocket (WS) | Built-in |
>
> ## 📁 Project Structure
>
> ```
> ESP32-FullControl/
> ├── src/                          # Source code
> │   ├── main.cpp                 # Entry point & main loop
> │   ├── GpioController.cpp        # GPIO management
> │   ├── LedController.cpp         # LED/NeoPixel control
> │   ├── InputManager.cpp          # Button/input handling
> │   ├── NetworkManager.cpp        # WiFi & connection
> │   ├── WebHandler.cpp            # Web server & WebSockets
> │   └── *.cpp                      # Other modules
> ├── include/                       # Header files (.h)
> │   └── *.h                       # Module headers
> ├── lib/                          # Custom libraries
> ├── interface/                    # Web UI files (HTML, CSS, JS)
> ├── test/                         # Unit tests
> ├── platformio.ini                # PlatformIO configuration
> ├── .gitignore                    # Git ignore rules
> └── README.md                     # This file
> ```
>
> ## 🚀 Quick Start
>
> ### Prerequisites
> - **Hardware:** ESP32-S3 DevKit-C-1
> - - **Software:**
>   -   - [PlatformIO](https://platformio.org/) (recommended via VS Code)
>       -   - Python 3.8+
>           -   - USB-C cable for programming
>            
>               - ### Installation
>            
>               - #### Option 1: Using PlatformIO (Recommended)
>            
>               - ```bash
> # Clone the repository
> git clone https://github.com/sochoag/ESP32-FullControl.git
> cd ESP32-FullControl
>
> # Install dependencies (PlatformIO handles this)
> # Open in VS Code with PlatformIO extension installed
>
> # Build the project
> pio run
>
> # Upload to ESP32
> pio run --target upload
>
> # Monitor serial output
> pio device monitor --baud 115200
> ```
>
> #### Option 2: Using Arduino IDE
>
> ```bash
> # 1. Install ESP32 board support in Arduino IDE
> # 2. Install required libraries:
> #    - AsyncTCP
> #    - ESPAsyncWebServer
> #    - ArduinoJson
> #    - Adafruit NeoPixel
> #    - WiFiManager
>
> # 3. Open src/main.cpp and upload
> ```
>
> ### First Run
>
> 1. **Connect to device:**
> 2.    ```bash
>          # Monitor serial for WiFi SSID details
>          pio device monitor --baud 115200
>          ```
>
> 2. **Configure WiFi:**
> 3.    - Look for WiFi network: `ESP32-FullControl`
>       -    - Connect and open browser to: `http://192.168.4.1`
>            -    - Select your home WiFi and enter password
>             
>                 - 3. **Access Web UI:**
>                   4.    - Once connected, open: `http://esp32s3.local` or the assigned IP
>                         -    - Control GPIO, LEDs, and monitor telemetry
>                          
>                              - ## 💻 Web UI & API
>                          
>                              - ### Endpoints
>                          
>                              - #### Status & Info
> - `GET /` - Serve main web interface
> - - `GET /api/status` - Device status JSON
>   - - `GET /api/system` - System metrics (uptime, heap, etc.)
>    
>     - #### GPIO Control
>     - - `POST /api/gpio/set` - Set GPIO pin state
>       - - `GET /api/gpio/read` - Read GPIO pin state
>        
>         - #### LED Control
>         - - `POST /api/led/color` - Set LED color (RGB)
>           - - `POST /api/led/mode` - Set LED mode (solid, blink, fade)
>            
>             - #### WebSocket
>             - - `ws://device_ip:81` - WebSocket server for real-time updates
>              
>               - ### WebSocket Messages
>              
>               - ```javascript
>                 // Telemetry Update (Server → Client)
>                 {
>                   "type": "telemetry",
>                   "uptime": 12345,
>                   "heap": 85000,
>                   "temperature": 42.5,
>                   "rssi": -45
>                 }
>
>                 // GPIO Control (Client → Server)
>                 {
>                   "type": "gpio",
>                   "pin": 4,
>                   "state": 1
>                 }
>
>                 // LED Control (Client → Server)
>                 {
>                   "type": "led",
>                   "mode": "solid",
>                   "color": "#FF0000"
>                 }
>                 ```
>
> ## 🔧 Module Guide
>
> ### GpioController
> Handles GPIO pin configuration and state management.
>
> ```cpp
> void initGpio();
>         // Initialize GPIO system
>
> bool setPin(uint8_t pin, uint8_t state);
>      // Set GPIO pin HIGH/LOW
>
> int readPin(uint8_t pin);
>     // Read GPIO pin state
> ```
>
> ### LedController
> Manages NeoPixel/RGB LEDs with various patterns.
>
> ```cpp
> void initLed();
>      // Initialize LED system
>
> void setColor(uint32_t color);
>      // Set solid color (0xRRGGBB)
>
> void setMode(const String& mode);
>      // Set pattern: "solid", "blink", "fade", "rainbow"
> ```
>
> ### NetworkManager
> Manages WiFi connectivity and configuration.
>
> ```cpp
> void initWiFi();
>      // Initialize WiFi with manager portal
>
> const char* getSSID();
> // Get connected SSID
>
> int getSignalStrength();
>    // Get WiFi signal strength (RSSI)
> ```
>
> ### WebHandler
> Manages web server, WebSockets, and HTTP endpoints.
>
> ```cpp
> void initServer();
>      // Start web server on port 80
>
> void handleWebTasks();
>       // Process web requests & WebSocket messages
>
> void broadcastTelemetry();
>       // Send telemetry to all WebSocket clients
> ```
>
> ## 📊 Telemetry & Monitoring
>
> The system continuously broadcasts:
> - **Uptime** - Device runtime in milliseconds
> - - **Heap Memory** - Available RAM
>   - - **Temperature** - MCU internal temperature
>     - - **Signal Strength** - WiFi RSSI (Received Signal Strength Indicator)
>       - - **GPIO States** - Current pin levels
>         - - **LED Status** - Current color and mode
>          
>           - ## 🔄 OTA Updates
>          
>           - Update firmware wirelessly:
>          
>           - ```bash
> # Build new firmware
> pio run
>
> # The .bin file is generated automatically
> # Upload via web interface at /update
> # Or via command line:
> curl -F "file=@.pio/build/esp32-s3-devkitc-1/firmware.bin" \
>      http://esp32s3.local/update
> ```
>
> ## ⚙️ Configuration
>
> ### platformio.ini Settings
>
> ```ini
> [env:esp32-s3-devkitc-1]
> platform = espressif32
> board = esp32-s3-devkitc-1
> framework = arduino
> monitor_speed = 115200
> board_build.filesystem = littlefs
> ```
>
> ### WiFi Manager
> Access config portal at: `http://192.168.4.1` during first boot or by pressing the reset button for 5+ seconds.
>
> ### Custom GPIO Mapping
> Edit `src/GpioController.cpp`:
>
> ```cpp
> #define GPIO_OUTPUT_PIN 4
> #define GPIO_INPUT_PIN 15
> #define LED_PIN 16
> ```
>
> ## 🧪 Testing
>
> ### Unit Tests
>
> ```bash
> # Run tests
> pio test
> ```
>
> ### Manual Testing
>
> 1. **GPIO Test:**
> 2.    ```bash
>          # Monitor serial, press button on GPIO 15
>          # Observe LED on GPIO 16 response
>          ```
>
> 2. **WebSocket Test:**
> 3.    ```bash
>          # From browser console:
>          const ws = new WebSocket('ws://esp32s3.local:81');
>          ws.send('{"type":"gpio", "pin":4, "state":1}');
>          ```
>
> 3. **OTA Test:**
> 4.    - Build & upload via web interface
>       -    - Check serial monitor for update progress
>        
>            - ## 📈 Performance Metrics
>        
>            - | Metric | Value | Notes |
>            - |--------|-------|-------|
>            - | Boot Time | ~3s | WiFi config on first boot |
> | Web Response | <100ms | Async server |
> | WebSocket Latency | <50ms | Real-time updates |
> | Memory Usage | ~120KB | With web UI |
> | Firmware Size | ~850KB | Compressed |
>
> ## 🐛 Troubleshooting
>
> ### Device won't connect to WiFi
> - Check serial monitor for WiFi SSID
> - - Connect to `ESP32-FullControl` network
>   - - Configure WiFi at `http://192.168.4.1`
>     - - Check router logs for connection issues
>      
>       - ### Web UI not loading
>       - - Verify device IP: `ping esp32s3.local`
>         - - Check LittleFS filesystem: serial monitor should show "FS mounted"
>           - - Clear browser cache and retry
>            
>             - ### WebSocket connection fails
>             - - Check firewall rules (port 81)
>               - - Verify device is on same network
>                 - - Check browser console for errors
>                  
>                   - ### OTA update fails
>                   - - Ensure device has sufficient free space (check heap)
>                     - - Power cycle device and retry
>                       - - Check serial monitor for detailed error messages
>                        
>                         - ## 🤝 Contributing
>                        
>                         - We welcome contributions! Please:
>                        
>                         - 1. Fork the repository
> 2. Create a feature branch (`git checkout -b feature/amazing-feature`)
> 3. 3. Follow the existing code style (modular, well-commented)
>    4. 4. Test your changes locally
>       5. 5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
>          6. 6. Push to branch (`git push origin feature/amazing-feature`)
>             7. 7. Open a Pull Request
>               
>                8. ### Code Style Guidelines
>                9. - Use descriptive variable names
>                   - - Add comments for complex logic
>                     - - Keep modules focused and single-responsibility
>                       - - Include error handling
>                         - - Write tests for new features
>                          
>                           - ## 📚 Resources
>                          
>                           - - [PlatformIO Documentation](https://docs.platformio.org/)
>                             - - [ESP32 Arduino Core](https://github.com/espressif/arduino-esp32)
>                               - - [ESPAsyncWebServer](https://github.com/me-no-dev/ESPAsyncWebServer)
>                                 - - [Arduino Ecosystem](https://www.arduino.cc/)
>                                  
>                                   - ## 📋 Roadmap
>                                  
>                                   - - [ ] MQTT support for external integration
>                                     - [ ] - [ ] Multi-protocol support (HTTP/2, MQTT)
>                                     - [ ] - [ ] Advanced telemetry dashboard
>                                     - [ ] - [ ] Data logging to SD card
>                                     - [ ] - [ ] Bluetooth Low Energy (BLE) support
>                                     - [ ] - [ ] Advanced scheduling & automation
>                                     - [ ] - [ ] Machine learning integration for predictive control
>                                    
>                                     - [ ] ## 📄 License
>                                    
>                                     - [ ] This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
>
> ## 🙌 Acknowledgments
>
> - [Espressif Systems](https://www.espressif.com/) - ESP32 platform
> - - [PlatformIO](https://platformio.org/) - Build & development framework
>   - - [AsyncTCP](https://github.com/me-no-dev/AsyncTCP) - Async networking
>     - - Community contributors and testers
>      
>       - ## 💬 Support & Questions
>      
>       - - **Issues:** [GitHub Issues](https://github.com/sochoag/ESP32-FullControl/issues)
>         - - **Discussions:** [GitHub Discussions](https://github.com/sochoag/ESP32-FullControl/discussions)
>           - - **Email:** santiagodav@hotmail.es
>            
>             - ---
>
> **Made with ❤️ by [David Ochoa](https://github.com/sochoag)**
