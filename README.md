# apple-tv-is-playing

Utility to publish if apple tv is playing or not to home app.  

Required homebridge, and homebridge websocket package

To run package, you must get creditentials.  Use package `pyatv`

1.  Install `pyatv` package
2.  Run the following command to get a list of devices
  ```
  atvremote scan
  ```
  2a. Find the Apple TV you want to pair with, copy its `identifier` 
3.  Run the following command to get credentials
  ```
  atvremote --id YOUR:ID:FROM:STEP:2A --protocol airplay pair
  ```
  3a.  Enter the four digit code from the Apple TV
4.  Create a file called .env 
    4a.  Create three keys called
    ```
    APPLETVTOKEN=REPLACE-WITH-YOUR-TOKEN-FROM-STEP-3
    APPLETVMAC=REPLACE-WITH-YOUR-APPLE-TV-IDENTIFIER-FROM-STEP-2A
    HOMEBRIDGE_IP_ADDRESS=REPLACE-WITH-YOUR-HOMEBRIDGE-IP:PORT
    ```
5. Run below to start server
```
node index.js
```
