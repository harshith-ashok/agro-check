#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <espnow.h>
#include <ArduinoJson.h>

// almost forgot to change
const char *ssid = "WIFI_SSID";
const char *password = "WIFI_PASSWORD";

ESP8266WebServer server(80);

typedef struct sensor_data
{
    char device_id[20];
    float soil_moisture;
    float soil_ph;
    float air_temp;
    float humidity;
    float battery;
    float solar_voltage;
} sensor_data;

// Store data for multiple devices (max 10 devices)
sensor_data deviceData[10];
int deviceCount = 0;

void onReceive(uint8_t *mac, uint8_t *incomingData, uint8_t len)
{
    sensor_data receivedData;
    memcpy(&receivedData, incomingData, sizeof(receivedData));

    Serial.print("Received from: ");
    Serial.println(receivedData.device_id);
    Serial.print("Soil Moisture: ");
    Serial.println(receivedData.soil_moisture);

    // Find if device exists, update or add new
    bool found = false;
    for (int i = 0; i < deviceCount; i++)
    {
        if (strcmp(deviceData[i].device_id, receivedData.device_id) == 0)
        {
            deviceData[i] = receivedData;
            found = true;
            Serial.println("Updated existing device");
            break;
        }
    }

    if (!found && deviceCount < 10)
    {
        deviceData[deviceCount] = receivedData;
        deviceCount++;
        Serial.println("Added new device");
    }
}

void handleSensorData()
{
    String path = server.uri();

    // Extract device_id from URL
    int lastSlash = path.lastIndexOf('/');
    String device_id = path.substring(lastSlash + 1);

    // Find the device
    bool found = false;
    sensor_data data;

    for (int i = 0; i < deviceCount; i++)
    {
        if (String(deviceData[i].device_id) == device_id)
        {
            data = deviceData[i];
            found = true;
            break;
        }
    }

    if (found)
    {
        StaticJsonDocument<256> doc;
        doc["device_id"] = data.device_id;
        doc["soil_moisture"] = data.soil_moisture;
        doc["soil_ph"] = data.soil_ph;
        doc["air_temp"] = data.air_temp;
        doc["humidity"] = data.humidity;
        doc["battery"] = data.battery;
        doc["solar_voltage"] = data.solar_voltage;

        String response;
        serializeJson(doc, response);

        server.send(200, "application/json", response);
    }
    else
    {
        server.send(404, "application/json", "{\"error\":\"Device not found\"}");
    }
}

void setup()
{
    Serial.begin(115200);
    delay(1000);

    // Connect to WiFi
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);

    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
    Serial.println();
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("MAC Address: ");
    Serial.println(WiFi.macAddress());
    Serial.print("WiFi Channel: ");
    Serial.println(WiFi.channel());

    // Initialize ESP-NOW AFTER WiFi connection
    if (esp_now_init() != 0)
    {
        Serial.println("Error initializing ESP-NOW");
        return;
    }

    esp_now_set_self_role(ESP_NOW_ROLE_SLAVE);
    esp_now_register_recv_cb(onReceive);
    Serial.println("ESP-NOW initialized");

    // Setup web server routes
    server.onNotFound([]()
                      {
    if (server.uri().startsWith("/api/sensors/data/")) {
      handleSensorData();
    } else {
      server.send(404, "application/json", "{\"error\":\"Not found\"}");
    } });

    server.begin();
    Serial.println("Web server started - Ready to receive ESP-NOW data");
}

void loop()
{
    server.handleClient();
    yield();
}