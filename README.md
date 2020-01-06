# RuuviTag to MQTT

This project is forked from https://github.com/ppetru/ruuvi2mqtt removing unused code and adding MQTT parameters.

Note that currently the software supports only the RAWv2 / version 5 format. You can see how to set your RuuviTag to use that format at https://lab.ruuvi.com/dfu/ . If the software receives messages in a wrong format, it will print a warning message on the screen.

Some other simple and recent ruuvi2mqtt projects:
- https://github.com/jannylund/ruuvi2mqtt
- https://github.com/garo/ruuvi2mqtt

## Tutorial: RuuviTag to IBM Watson IoT Platform via Linux

This tutorial describes how to setup a Linux system that sends RuuviTag measurements to the IBM Watson IoT Platform. The goal is to replicate the similar functionality found from IoTool (https://iotool.io) that supports only Android. The Linux system requires Bluetooth Low Energy (Bluetooth LE, BLE) support, usually found from Bluetooth 4.0 adapters and built in to the Raspberry Pi 3. The IBM Watson IoT Platform can receive messages using the MQTT protocol, which we are going to use.

Outline:
- Installing ruuvi2mqtt
- Creating a Watson IoT Platform instance and adding a device, using the free Lite-plan
- Configuring ruuvi2mqtt

Debian 10 (amd64) is used in this tutorial. Tested also with a Raspberry Pi 3 with Raspbian 10.

```console
sudo apt-get install git-core nodejs npm build-essential mosquitto mosquitto-clients bluetooth bluez libbluetooth-dev libudev-dev
```

The required node.js version at the time of writing this guide is 8 due to noble/bluetooth-hci-socket. You can change the version using different methods, one of which is by using n:
```console
sudo npm install -g n
sudo n 8
node --version
```
If Node version is not 8.x, close and reopen your terminal.

```console
git clone https://github.com/iivorait/ruuvi2mqtt
cd ruuvi2mqtt
npm install #if this fails, try sudo or to run as root user (not sudo)
```

Give Node.js access to Bluetooth: 
```console
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
```

Go to www.ibmcloud.com and log in or create a free account. After logging in, use the top search bar to search for "internet of things platform". Create the service using the free Lite-plan. You can access the service from the top left bar menu --> Resource list --> Cloud Foundry Services. Click "Launch" to get to the dashboard.

The URL of the dashboard is https://org_id.internetofthings.ibmcloud.com/dashboard/#/overview where org_id is specific to you.

Press "Add Device" from the top right of the dashboard. Set the type as "Ruuvi" and ID as "palvelinkoe", for example (these are used in the example config.json). Skip the device information page. Input a token (password) or leave the field blank for automatic generation.

Modify config.json. Add the addresses of your RuuviTags to "known_devices" and set MQTT parameters: in the example "tzrng0" = ord_id, set also "password" and "client_id" accordingly.

Run:
```console
./start.sh
```

If you get an "adapter does not support Bluetooth Low Energy" error, and the "hciconfig" command lists multiple adapters, you can change the selected adapter with:
```console
export NOBLE_HCI_DEVICE_ID=1
```

If all went smoothly, you can see the measurements from the dashboard's Devices > select device > Recent Events.

You can enable automatic startup by following the instructions at https://github.com/ppetru/ruuvi2mqtt, section Auto Start.
