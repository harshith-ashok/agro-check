#include <ESP8266WiFi.h>

void setup()
{
    Serial.begin(115200);
    delay(1000); // This is just to make sure you actually catch the MAC Address and not boot log garbage
    WiFi.mode(WIFI_STA);

    Serial.println();
    Serial.println("Booting...");
    Serial.print("ESP8266 STA MAC: ");
    Serial.println(WiFi.macAddress());
}

void loop() {}
