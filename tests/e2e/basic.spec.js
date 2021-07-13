import THORChainApp from "index.js";
import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
import { expect } from "jest";
import secp256k1 from "secp256k1/elliptic";
import crypto from "crypto";
import { ERROR_CODE } from "../../src/common";

require("dotenv").config({ path: "./.e2e.env" });

const { THOR_ADDRESS = "unknown address", THOR_PUB_KEY = "unknown pub key" } = process.env;

const JEST_TIMEOUT = 60000;
jest.setTimeout(JEST_TIMEOUT);

let transport;
let app;

describe("THORChainApp e2e", () => {
  beforeAll(async () => {
    transport = await TransportNodeHid.create(1000);
    app = new THORChainApp(transport);
  });

  afterAll(async () => {
    transport = null;
    app = null;
  });

  it("getVersion", async () => {
    // *****
    // Requirements: Open `THORChain` app on Ledger
    // *****
    const resp = await app.getVersion();

    expect(resp.return_code).toEqual(ERROR_CODE.NoError);
    expect(resp.error_message).toEqual("No errors");
    expect(resp).toHaveProperty("test_mode");
    expect(resp).toHaveProperty("major");
    expect(resp).toHaveProperty("minor");
    expect(resp).toHaveProperty("patch");
    expect(resp.test_mode).toEqual(false);
  });

  it("publicKey", async () => {
    // *****
    // Requirements: Open `THORChain` app on Ledger
    // *****

    // Derivation path. First 3 items are automatically hardened!
    const path = [44, 931, 0, 0, 0];

    const resp = await app.publicKey(path);

    // console.log(resp);

    expect(resp.return_code).toEqual(ERROR_CODE.NoError);
    expect(resp.error_message).toEqual("No errors");
    expect(resp).toHaveProperty("compressed_pk");
    expect(resp.compressed_pk.length).toEqual(33);
    expect(resp.compressed_pk.toString("hex")).toEqual(THOR_PUB_KEY);
  });

  it("getAddressAndPubKey", async () => {
    // *****
    // Requirements: Open `THORChain` app on Ledger
    // *****

    jest.setTimeout(JEST_TIMEOUT);

    // Derivation path. First 3 items are automatically hardened!
    const path = [44, 931, 0, 0, 0];
    const resp = await app.getAddressAndPubKey(path, "thor");

    // console.log(resp);

    expect(resp.return_code).toEqual(ERROR_CODE.NoError);
    expect(resp.error_message).toEqual("No errors");

    expect(resp).toHaveProperty("bech32_address");
    expect(resp).toHaveProperty("compressed_pk");

    expect(resp.bech32_address).toEqual(THOR_ADDRESS);
    expect(resp.compressed_pk.length).toEqual(33);
  });

  it("appInfo", async () => {
    // *****
    // Requirements: Open `THORChain` app on Ledger
    // *****
    const resp = await app.appInfo();

    // console.log(resp);

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

  it("deviceInfo", async () => {
    // *****
    // Requirements: Open `Dashboard` on Ledger (but not `THORChain` app)
    // *****
    const resp = await app.deviceInfo();

    // console.log(resp);

    expect(resp.return_code).toEqual(ERROR_CODE.NoError);
    expect(resp.error_message).toEqual("No errors");

    expect(resp).toHaveProperty("targetId");
    expect(resp).toHaveProperty("seVersion");
    expect(resp).toHaveProperty("flag");
    expect(resp).toHaveProperty("mcuVersion");
  });

  it.only("sign_and_verify_MsgSend", async () => {
    // *****
    // Requirements: Open `THORChain` app on Ledger and follow instructions
    // *****


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
    console.log(`signature`, signature);
    const signatureOk = secp256k1.ecdsaVerify(signature, msgHash, responsePk.compressed_pk);
    console.log('signatureOks', signatureOk);
    expect(signatureOk).toEqual(true);
  });

  it("sign_invalid", async () => {
    // *****
    // Requirements: Open `THORChain` app on Ledger and follow instructions
    // *****

    jest.setTimeout(JEST_TIMEOUT);

    const path = [44, 931, 0, 0, 0]; // Derivation path. First 3 items are automatically hardened!
    const invalidMessage =
      '{"chain_id":"thorchain","fee":{"amount":[],"gas":"10000000"},"memo":"","msgs":[{"type":"thorchain/MsgDeposit","value":{"coins":[{"amount":"330000000","asset":"THOR.RUNE"}],"memo":"SWAP:BNB.BNB:tbnb1qk2m905ypazwfau9cn0qnr4c4yxz63v9u9md20:","signer":"tthor1c648xgpter9xffhmcqvs7lzd7hxh0prgv5t5gp"}}],"sequence":"6"}';

    const responseSign = await app.sign(path, invalidMessage);

    // console.log(responseSign);

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
});
