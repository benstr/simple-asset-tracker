# Simple Asset Tracker

Near real-time GPS tracker powered by Hologram.io cellular IoT platform and MeteorJS web platform.

## `/firmware`

This is the Arduino IDE file used to flash Hologram's Dash board (cellular microcontroller).

To get started:

1. Buy a Dash board, Hologram SIM, and Adafruit Ultimate GPS Breakout v3
2. Activate SIM instantly through the Hologram Dashboard
3. With the Arduino IDE flash the Dash with this firmware
4. Once a GPS and Cellular signal is acquired you should see data being sent to the Hologram Data Log
 
## `/app`

This is the MeteorJS app which connects to Hologram's Cloud

To get started:

1. Copy `/app/settings-example.json` to `/app/settings.json`
2. In `/app/settings.json` set your `mapbox_accessToken`, `hologram_api`, and `hologram_device_tag`
3. cd into `/app` and run `$ npm install -dev`
4. run `$ meteor --settings settings.json` 
5. check out your app running locally at http://localhost:3000
