# RuuviTag to HomeAssistant MQTT with auto-discovery

![alt text](https://github.com/hotzilla/ruuvicollector-to-homeassistant-mqtt/blob/master/architecture.png?raw=true)

This project resolves problem that if you have Raspberry PI that handles BLE to ruuvis, and the homeassistant is running on different server, that doesnt have bluetooth.
BLE is converted to MQTT, so you can move the realtime data to anywhere through the network, as efficient mqtt packets.

This supports 2021 version of Home Assistant autodiscovery, so temperature, humidity, pressure and RSSI are automatically visible as sensors in homeassistant, no extra configurations needed.

This project is merged from https://github.com/ppetru/ruuvi2mqtt and https://github.com/iivorait/ruuvi2mqtt

## Installation

prerequisites:
- MQTT broker connected to HA (if you have hass.io, you can install mosquitto mqtt broker https://github.com/home-assistant/addons/blob/master/mosquitto/DOCS.md)


In your raspberry pi, perform following commands:

```console
sudo apt-get install git-core nodejs npm build-essential mosquitto mosquitto-clients bluetooth bluez libbluetooth-dev libudev-dev
sudo npm install -g n
sudo n 8
node --version
```
If Node version is not 8.x, close and reopen your terminal.

```console
git clone https://github.com/hotzilla/ruuvi2mqtt
cd ruuvi2mqtt
sudo npm install (if this fails, run "sudo su -" and cd to previous folder, and then rerun)
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
```

Configure config.json

Start the bridge:
```console
./start.sh
```

If you get an "adapter does not support Bluetooth Low Energy" error, and the "hciconfig" command lists multiple adapters, you can change the selected adapter with:
```console
export NOBLE_HCI_DEVICE_ID=1
```

You can enable automatic startup by following the instructions at https://github.com/ppetru/ruuvi2mqtt, section Auto Start.

