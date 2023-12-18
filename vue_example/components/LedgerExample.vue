<template>
  <div class="THORChainLedger">
    <input id="webusb" v-model="transportChoice" type="radio" value="WebUSB" />
    <label for="webusb">WebUSB</label>
    <input id="webhid" v-model="transportChoice" type="radio" value="WebHID" />
    <label for="webhid">WebHID</label>
    <br />
    <!--
        Commands
    -->
    <button @click="getVersion">
      Get Version
    </button>

    <button @click="appInfo">
      AppInfo
    </button>

    <button @click="getPublicKey">
      Get pubkey only
    </button>

    <button @click="getAddress">
      Get Address and Pubkey
    </button>

    <button @click="showAddress">
      Show Address and Pubkey
    </button>

    <button @click="signExampleTx">
      Sign Example TX
    </button>
    <!--
        Commands
    -->
    <ul id="ledger-status">
      <li v-for="item in deviceLog" :key="item.index">
        {{ item.msg }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
// import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import THORChainApp, { LedgerErrorType } from "../../lib/index";
import { Buffer } from 'buffer';

const path = [44, 931, 0, 0, 0];
const transportChoice = ref("WebUSB");
const deviceLog = reactive([]);

const log = (msg) => {
  deviceLog.push({
    index: deviceLog.length,
    msg,
  });
};

const getTransport = async () => {
  let transport

  log(`Trying to connect via ${transportChoice.value}...`);
  if (transportChoice === "WebUSB") {
    try {
      transport = await TransportWebUSB.create();
    } catch (e) {
      log(e);
    }
  }

  if (transportChoice === "WebHID") {
    try {
      transport = await TransportWebHID.create(10000);
    } catch (e) {
      log(e);
    }
  }

  return transport;
}

const getVersion = async () => {

  // Given a transport (WebUSB/WebHID) it is possible instantiate the app
  const transport = await TransportWebUSB.create();
  const app = new THORChainApp(transport);

  // now it is possible to access all commands in the app
  const response = await app.getVersion();
  if (response.returnCode !== LedgerErrorType.NoErrors) {
    log(`Error [${response.returnCode}] ${response.errorMessage}`);
    return;
  }

  log("Response received!");
  log(`App Version ${response.major}.${response.minor}.${response.patch}`);
  log(`Device Locked: ${response.deviceLocked}`);
  log(`Test mode: ${response.testMode}`);
  log("Full response:");
  log(response);
}
const appInfo = async () => {

  // Given a transport (WebUSB/WebHID) it is possible instantiate the app
  const transport = await TransportWebUSB.create();
  const app = new THORChainApp(transport);

  // now it is possible to access all commands in the app
  const response = await app.getAppInfo();
  if (response.returnCode !== LedgerErrorType.NoErrors) {
    log(`Error [${response.returnCode}] ${response.errorMessage}`);
    return;
  }

  log("Response received!");
  log(response);
}
const getPublicKey = async () => {

  // Given a transport (WebUSB/WebHID) it is possible instantiate the app
  const transport = await TransportWebUSB.create();
  const app = new THORChainApp(transport);

  let response = await app.getVersion();
  log(`App Version ${response.major}.${response.minor}.${response.patch}`);
  log(`Device Locked: ${response.deviceLocked}`);
  log(`Test mode: ${response.testMode}`);

  // now it is possible to access all commands in the app
  response = await app.getPublicKey(path);
  if (response.returnCode !== LedgerErrorType.NoErrors) {
    log(`Error [${response.returnCode}] ${response.errorMessage}`);
    return;
  }

  log("Response received!");
  log("Full response:");
  log(response);
}
const getAddress = async () => {


  // Given a transport (WebUSB/WebHID) it is possible instantiate the app
  const transport = await TransportWebUSB.create();
  const app = new THORChainApp(transport);

  let response = await app.getVersion();
  log(`App Version ${response.major}.${response.minor}.${response.patch}`);
  log(`Device Locked: ${response.deviceLocked}`);
  log(`Test mode: ${response.testMode}`);

  // now it is possible to access all commands in the app
  response = await app.getAddressAndPubKey(path, "tthor");
  if (response.returnCode !== LedgerErrorType.NoErrors) {
    log(`Error [${response.returnCode}] ${response.errorMessage}`);
    return;
  }

  log("Response received!");
  log("Full response:");
  log(response);
}
const showAddress = async () => {

  // Given a transport (WebUSB/WebHID) it is possible instantiate the app
  const transport = await TransportWebUSB.create();
  const app = new THORChainApp(transport);

  let response = await app.getVersion();
  log(`App Version ${response.major}.${response.minor}.${response.patch}`);
  log(`Device Locked: ${response.deviceLocked}`);
  log(`Test mode: ${response.testMode}`);

  // now it is possible to access all commands in the app
  log("Please click in the device");
  response = await app.showAddressAndPubKey(path, "tthor");
  if (response.returnCode !== LedgerErrorType.NoErrors) {
    log(`Error [${response.returnCode}] ${response.errorMessage}`);
    return;
  }

  log("Response received!");
  log("Full response:");
  log(response);
}
const signExampleTx = async () => {


  // Given a transport (U2F/HID/WebUSB) it is possible instantiate the app
  const transport = await TransportWebUSB.create();;
  const app = new THORChainApp(transport);

  let response = await app.getVersion();
  log(`App Version ${response.major}.${response.minor}.${response.patch}`);
  log(`Device Locked: ${response.deviceLocked}`);
  log(`Test mode: ${response.testMode}`);

  // now it is possible to access all commands in the app
  const message = Buffer.from('{"account_number":"588","chain_id":"thorchain","fee":{"amount":[],"gas":"2000000"},"memo":"TestMemo","msgs":[{"type":"thorchain/MsgSend","value":{"amount":[{"amount":"150000000","denom":"rune"}],"from_address":"tthor1c648xgpter9xffhmcqvs7lzd7hxh0prgv5t5gp","to_address":"tthor10xgrknu44d83qr4s4uw56cqxg0hsev5e68lc9z"}}],"sequence":"5"}');
  response = await app.sign(path, message);

  log("Response received!");
  log("Full response:");
  log(response);
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}

button {
  padding: 5px;
  font-weight: bold;
  font-size: medium;
}

ul {
  padding: 10px;
  text-align: left;
  list-style-type: none;
  background: black;
  font-weight: bold;
  color: greenyellow;
}
</style>
