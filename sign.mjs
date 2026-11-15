// Offline EIP-191 signer for AiProve auth.
// Usage: node sign.mjs "<challenge>"  -> prints signature only.
// Reads ../agent.key, never prints the key.
import { Wallet } from "ethers";
import fs from "fs";

const pk = fs.readFileSync(new URL("../agent.key", import.meta.url), "utf8").trim();
const w = new Wallet(pk);
if (w.address.toLowerCase() !== "0x3fcb8b7d5ca1b5f29524bc960612c4ae20716960") {
  throw new Error("key does not match expected AiProve agent address");
}
console.log(await w.signMessage(process.argv[2]));
