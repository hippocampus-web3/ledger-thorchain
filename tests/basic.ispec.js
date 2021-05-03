import THORChainApp from "index.js";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import { expect, test } from "jest";
import secp256k1 from "secp256k1/elliptic";
import crypto from "crypto";
import { ERROR_CODE } from "../src/common";

test("get version", async () => {
  const transport = await TransportNodeHid.create(1000);

  const app = new THORChainApp(transport);
  const resp = await app.getVersion();
  console.log(resp);

  expect(resp.return_code).toEqual(ERROR_CODE.NoError);
  expect(resp.error_message).toEqual("No errors");
  expect(resp).toHaveProperty("test_mode");
  expect(resp).toHaveProperty("major");
  expect(resp).toHaveProperty("minor");
  expect(resp).toHaveProperty("patch");
  expect(resp.test_mode).toEqual(false);
});

test("publicKey", async () => {
  const transport = await TransportNodeHid.create(1000);
  const app = new THORChainApp(transport);

  // Derivation path. First 3 items are automatically hardened!
  const path = [44, 931, 0, 0, 0];

  const resp = await app.publicKey(path);

  expect(resp.return_code).toEqual(ERROR_CODE.NoError);
  expect(resp.error_message).toEqual("No errors");
  expect(resp).toHaveProperty("compressed_pk");
  expect(resp.compressed_pk.length).toEqual(33);
  expect(resp.compressed_pk.toString("hex")).toEqual(
    "0264bff60f78aae3326b4fc3e16a7c48d0158bfe175fa4a9361190a42565662ae6",
  );
});

test("getAddressAndPubKey", async () => {
  jest.setTimeout(60000);

  const transport = await TransportNodeHid.create(1000);
  const app = new THORChainApp(transport);

  // Derivation path. First 3 items are automatically hardened!
  const path = [44, 931, 0, 0, 0];
  const resp = await app.getAddressAndPubKey(path, "thor");

  console.log(resp);

  expect(resp.return_code).toEqual(ERROR_CODE.NoError);
  expect(resp.error_message).toEqual("No errors");

  expect(resp).toHaveProperty("bech32_address");
  expect(resp).toHaveProperty("compressed_pk");

  expect(resp.bech32_address).toEqual("thor1mwyrp6lj85swy5e5g4hjlaacm33g6rw3p4qmq4");
  expect(resp.compressed_pk.length).toEqual(33);
});

test("showAddressAndPubKey", async () => {
  jest.setTimeout(60000);

  const transport = await TransportNodeHid.create(1000);
  const app = new THORChainApp(transport);

  // Derivation path. First 3 items are automatically hardened!
  const path = [44, 931, 0, 0, 0];
  const resp = await app.showAddressAndPubKey(path, "thor");

  console.log(resp);

  expect(resp.return_code).toEqual(ERROR_CODE.NoError);
  expect(resp.error_message).toEqual("No errors");

  expect(resp).toHaveProperty("bech32_address");
  expect(resp).toHaveProperty("compressed_pk");

  expect(resp.bech32_address).toEqual("thor1mwyrp6lj85swy5e5g4hjlaacm33g6rw3p4qmq4");
  expect(resp.compressed_pk.length).toEqual(33);
});

test("appInfo", async () => {
  const transport = await TransportNodeHid.create(1000);
  const app = new THORChainApp(transport);

  const resp = await app.appInfo();

  console.log(resp);

  expect(resp.return_code).toEqual(ERROR_CODE.NoError);
  expect(resp.error_message).toEqual("No errors");

  expect(resp).toHaveProperty("appName");
  expect(resp).toHaveProperty("appVersion");
  expect(resp).toHaveProperty("flagLen");
  expect(resp).toHaveProperty("flagsValue");
  expect(resp).toHaveProperty("flag_recovery");
  expect(resp).toHaveProperty("flag_signed_mcu_code");
  expect(resp).toHaveProperty("flag_onboarded");
  expect(resp).toHaveProperty("flag_pin_validated");
});

test("deviceInfo", async () => {
  const transport = await TransportNodeHid.create(1000);
  const app = new THORChainApp(transport);

  const resp = await app.deviceInfo();

  console.log(resp);

  expect(resp.return_code).toEqual(ERROR_CODE.NoError);
  expect(resp.error_message).toEqual("No errors");

  expect(resp).toHaveProperty("targetId");
  expect(resp).toHaveProperty("seVersion");
  expect(resp).toHaveProperty("flag");
  expect(resp).toHaveProperty("mcuVersion");
});

test("sign_and_verify_MsgSend", async () => {
  jest.setTimeout(60000);

  const transport = await TransportNodeHid.create(1000);
  const app = new THORChainApp(transport);

  // Derivation path. First 3 items are automatically hardened!
  const path = [44, 931, 0, 0, 0];
  const message = String.raw`{"account_number":"588","chain_id":"thorchain","fee":{"amount":[],"gas":"2000000"},"memo":"TestMemo","msgs":[{"type":"thorchain/MsgSend","value":{"amount":[{"amount":"150000000","denom":"rune"}],"from_address":"tthor1c648xgpter9xffhmcqvs7lzd7hxh0prgv5t5gp","to_address":"tthor10xgrknu44d83qr4s4uw56cqxg0hsev5e68lc9z"}}],"sequence":"5"}`;

  const responsePk = await app.publicKey(path);
  console.log(responsePk);
  expect(responsePk.return_code).toEqual(ERROR_CODE.NoError);
  expect(responsePk.error_message).toEqual("No errors");

  const responseSign = await app.sign(path, message);
  console.log(responseSign);
  expect(responseSign.return_code).toEqual(ERROR_CODE.NoError);
  expect(responseSign.error_message).toEqual("No errors");

  // Check signature is valid
  const hash = crypto.createHash("sha256");
  const msgHash = hash.update(message).digest();

  const signatureDER = responseSign.signature;
  const signature = secp256k1.signatureImport(signatureDER);
  const signatureOk = secp256k1.verify(msgHash, signature, responsePk.compressed_pk);
  expect(signatureOk).toEqual(true);
});

test("sign_and_verify_MsgDeposit", async () => {
  jest.setTimeout(60000);

  const transport = await TransportNodeHid.create(1000);
  const app = new THORChainApp(transport);

  // Derivation path. First 3 items are automatically hardened!
  const path = [44, 931, 0, 0, 0];
  const message = String.raw`{"account_number":"588","chain_id":"thorchain","fee":{"amount":[],"gas":"10000000"},"memo":"","msgs":[{"type":"thorchain/MsgDeposit","value":{"coins":[{"amount":"330000000","asset":"THOR.RUNE"}],"memo":"SWAP:BNB.BNB:tbnb1qk2m905ypazwfau9cn0qnr4c4yxz63v9u9md20:","signer":"tthor1c648xgpter9xffhmcqvs7lzd7hxh0prgv5t5gp"}}],"sequence":"6"}`;

  const responsePk = await app.publicKey(path);
  const responseSign = await app.sign(path, message);

  console.log(responsePk);
  console.log(responseSign);

  expect(responsePk.return_code).toEqual(ERROR_CODE.NoError);
  expect(responsePk.error_message).toEqual("No errors");
  expect(responseSign.return_code).toEqual(ERROR_CODE.NoError);
  expect(responseSign.error_message).toEqual("No errors");

  // Check signature is valid
  const hash = crypto.createHash("sha256");
  const msgHash = hash.update(message).digest();

  const signatureDER = responseSign.signature;
  const signature = secp256k1.signatureImport(signatureDER);
  const signatureOk = secp256k1.verify(msgHash, signature, responsePk.compressed_pk);
  expect(signatureOk).toEqual(true);
});

test("sign_invalid", async () => {
  jest.setTimeout(60000);

  const transport = await TransportNodeHid.create(1000);
  const app = new THORChainApp(transport);

  const path = [44, 931, 0, 0, 0]; // Derivation path. First 3 items are automatically hardened!
  const invalidMessage =
    '{"chain_id":"thorchain","fee":{"amount":[],"gas":"10000000"},"memo":"","msgs":[{"type":"thorchain/MsgDeposit","value":{"coins":[{"amount":"330000000","asset":"THOR.RUNE"}],"memo":"SWAP:BNB.BNB:tbnb1qk2m905ypazwfau9cn0qnr4c4yxz63v9u9md20:","signer":"tthor1c648xgpter9xffhmcqvs7lzd7hxh0prgv5t5gp"}}],"sequence":"6"}';

  const responseSign = await app.sign(path, invalidMessage);

  console.log(responseSign);

  switch (app.versionResponse.major) {
    case 2:
      expect(responseSign.return_code).toEqual(0x6984);
      expect(responseSign.error_message).toEqual("Data is invalid : JSON Missing account number");
      break;
    default:
      console.log("Version not supported");
      expect(false).toEqual(true);
  }
});
