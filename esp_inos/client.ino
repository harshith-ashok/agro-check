#include <ESP8266WiFi.h>
#include <espnow.h>
#include <DHT.h>

// Check check_mac.ino
uint8_t serverAddress[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF};

// Set the WiFi channel to match server
// Reasons in README
#define WIFI_CHANNEL 9

String DEVICE_ID = "sensor_01";
// TODO: make this dynamic

// Sensor pins
#define DHTPIN 2             // DHT11 data pin
#define DHTTYPE DHT11        // DHT11 sensor type
#define SOIL_MOISTURE_PIN A0 // Soil moisture analog pin

DHT dht(DHTPIN, DHTTYPE);

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

sensor_data myData;

void onSent(uint8_t *mac, uint8_t status)
{
    Serial.print("Send Status: ");
    if (status == 0)
    {
        Serial.println("Success");
    }
    else
    {
        Serial.println("Failed");
    }
}

float readSoilMoisture()
{
    int rawValue = analogRead(SOIL_MOISTURE_PIN);
    // Convert to percentage (adjust these values based on your sensor)
    // Typical: 1024 = dry (0%), 0 = wet (100%)
    float percentage = map(rawValue, 1024, 0, 0, 100);
    percentage = constrain(percentage, 0, 100);
    return percentage;
}

void setup()
{
    Serial.begin(115200);
    delay(1000);

    // Initialize DHT sensor
    dht.begin();

    WiFi.mode(WIFI_STA);
    WiFi.disconnect();

    // Set the WiFi channel without connecting
    wifi_set_channel(WIFI_CHANNEL);

    Serial.print("Client MAC: ");
    Serial.println(WiFi.macAddress());
    Serial.print("WiFi Channel: ");
    Serial.println(wifi_get_channel());

    if (esp_now_init() != 0)
    {
        Serial.println("Error initializing ESP-NOW");
        return;
    }

    esp_now_set_self_role(ESP_NOW_ROLE_CONTROLLER);
    esp_now_register_send_cb(onSent);

    int result = esp_now_add_peer(serverAddress, ESP_NOW_ROLE_SLAVE, 1, NULL, 0);
    if (result == 0)
    {
        Serial.println("Peer added successfully");
    }
    else
    {
        Serial.print("Failed to add peer: ");
        Serial.println(result);
    }

    Serial.println("Client ready - Sensors initialized");
}

void loop()
{
    // Read DHT11 sensor
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();

    // Read soil moisture
    float soilMoisture = readSoilMoisture();

    // Check if DHT readings failed
    if (isnan(temp) || isnan(hum))
    {
        Serial.println("Failed to read from DHT sensor!");
        temp = 0;
        hum = 0;
    }

    // Prepare data packet
    DEVICE_ID.toCharArray(myData.device_id, 20);
    myData.soil_moisture = soilMoisture;
    myData.soil_ph = 7.8; // Placeholder - add pH sensor later
    myData.air_temp = temp;
    myData.humidity = hum;
    myData.battery = 100.0;     // Placeholder - add battery monitor later
    myData.solar_voltage = 0.0; // Placeholder - add solar panel monitor later

    // Print readings
    Serial.println("=== Sensor Readings ===");
    Serial.print("Device ID: ");
    Serial.println(myData.device_id);
    Serial.print("Temperature: ");
    Serial.print(myData.air_temp);
    Serial.println(" °C");
    Serial.print("Humidity: ");
    Serial.print(myData.humidity);
    Serial.println(" %");
    Serial.print("Soil Moisture: ");
    Serial.print(myData.soil_moisture);
    Serial.println(" %");
    Serial.println("=======================");

    // Send data
    esp_now_send(serverAddress, (uint8_t *)&myData, sizeof(myData));

    delay(5000);
}