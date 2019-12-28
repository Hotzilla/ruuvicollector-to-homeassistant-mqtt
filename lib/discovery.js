/*
 * This file is part of EspruinoHub, a Bluetooth-MQTT bridge for
 * Puck.js/Espruino JavaScript Microcontrollers
 *
 * Copyright (C) 2016 Gordon Williams <gw@pur3.co.uk>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * ----------------------------------------------------------------------------
 *  Converts BLE advertising packets to MQTT
 * ----------------------------------------------------------------------------
 */

var noble = require('noble');
var Parser = require('binary-parser').Parser;
var mqtt = require('./mqttclient');
var config = require('./config');
var ruuvitag = require('./ruuvitag');

// List of BLE devices that are currently in range
var inRange = {};
var packetsReceived = 0;
var lastPacketsReceived = 0;
var isScanning = false;

function log(x) {
  console.log("<Discover> "+x);
}

function onStateChange(state) {
  if (state!="poweredOn") return;
  // delay startup to allow Bleno to set discovery up
  setTimeout(function() {
    log("Starting scan...");
    noble.startScanning([], true);
  }, 1000);
};

function onDiscovery(peripheral) {
  var addr = peripheral.address;
  var id = addr;
  if (id in config.known_devices) {
    id = config.known_devices[id];
  } else {
    if (config.only_known_devices)
      return;
  }
  packetsReceived++;

  if (peripheral.advertisement.manufacturerData) {
    // TODO skip the toString
    var manu = peripheral.advertisement.manufacturerData.slice(0, 2).toString('hex');
    if (manu === "9904") {
      sensorData = ruuvitag.ParseRuuvi(peripheral.advertisement.manufacturerData.slice(2));

      if (sensorData) {
        var entered = !inRange[addr];
        if (entered) {
          inRange[addr] = {
            id : id,
            address : addr,
            peripheral: peripheral,
            rssi: peripheral.rssi,
            name : id,
            data : {}
          };
        }

        sensorData.rssi = peripheral.rssi;
        sensorData.name = id;
        var mqttData = JSON.stringify(sensorData);
        if(config.mqtt_data_container !== undefined && config.mqtt_data_container !== "") {
          mqttData = '{"' + config.mqtt_data_container + '": ' + mqttData + '}';
        }

        mqtt.send(config.mqtt_topic, mqttData);
      }
    }
  }
}

function checkIfBroken() {
  if (isScanning) {
    // If no packets for 10 seconds, restart
    if (packetsReceived==0 && lastPacketsReceived==0) {
      log("BLE broken? No advertising packets in "+ config.ble_timeout +" seconds - restarting!");
      process.exit(1);
   }
  } else {
    packetsReceived = 1; // don't restart as we were supposed to not be advertising
  }
  lastPacketsReceived = packetsReceived;
  packetsReceived = 0;
}

exports.init = function() {
  noble.on('stateChange',  onStateChange);
  noble.on('discover', onDiscovery);
  noble.on('scanStart', function() {
    isScanning=true;
    log("Scanning started.");
  });
  noble.on('scanStop', function() { isScanning=false; log("Scanning stopped.");});
  if (config.ble_timeout>0)
    setInterval(checkIfBroken, config.ble_timeout * 1000);
};

exports.inRange = inRange;

exports.restartScan = function() {
  if (!isScanning) {
    noble.startScanning([], true);
  }
}

exports.stopScan = function() {
  if (isScanning) {
    noble.stopScanning();
  }
}
