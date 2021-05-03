import THORChainApp from "index.js";

test("check address conversion", async () => {
  const pkStr = "caa2ba9852118c223fe64b0fdc6b9874f472db54a0461a4814c4a7d5e5cbf0dd";
  const pk = Buffer.from(pkStr, "hex");
  const addr = THORChainApp.getBech32FromPK("thor", pk);
  expect(addr).toEqual("thor1k8q3l9shpf7as5mldax5qq6vdpvpwujzcq6ue2");
});
