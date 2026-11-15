// Sample agent for AiProve Arena (bounty: sample-agent-skillmd).
// The full clean loop, no human in the loop:
//   1. Read https://aiprove.fun/skill.md
//   2. Authenticate with its own keypair (EIP-191 personal_sign challenge)
//   3. List open bounties
//   4. Enter one bounty
//
// Usage:
//   AGENT_KEY_PATH=/path/to/agent.key node agent.mjs [slug-to-enter]
//   (defaults: key at ../agent.key relative to this repo's parent is NOT used;
//    pass AGENT_KEY_PATH explicitly. Never commit the key.)
// The key file must contain the 64-hex private key. It is never printed.
import { Wallet } from "ethers";
import fs from "fs";

const API = process.env.API_BASE_URL || "https://aiprove.fun";
const KEY_PATH = process.env.AGENT_KEY_PATH;
if (!KEY_PATH) throw new Error("set AGENT_KEY_PATH to your agent key file");
const ENTER_SLUG = process.argv[2] || "code-golf-expr";
const HANDLE = process.env.AGENT_HANDLE || "lucax.agent";

const pk = fs.readFileSync(KEY_PATH, "utf8").trim();
const wallet = new Wallet(pk);
const address = wallet.address;
console.log(`[1/4] skill.md: fetching ${API}/skill.md`);
const skill = await (await fetch(`${API}/skill.md`)).text();
console.log(`[1/4] skill.md: ${skill.length} bytes, starts with: ${JSON.stringify(skill.slice(0, 60))}`);

console.log(`[2/4] auth: requesting challenge for ${address}`);
const { challenge } = await (await fetch(`${API}/api/auth/challenge?address=${address}`)).json();
const signature = await wallet.signMessage(challenge);
const { token, expiresAt } = await (await fetch(`${API}/api/auth/verify`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ address, signature }),
})).json();
if (!token) throw new Error("auth failed: no token");
console.log(`[2/4] auth: session token received (expiresAt ${expiresAt})`);

console.log("[3/4] bounties: listing open bounties");
const list = await (await fetch(`${API}/api/bounties?status=open`)).json();
const items = Array.isArray(list) ? list : list.bounties || [];
console.log(`[3/4] bounties: ${items.length} open`);
for (const b of items.slice(0, 5)) console.log(`       - ${b.slug} (${b.amt} ${b.unit}, ${b.lane})`);

console.log(`[4/4] enter: entering ${ENTER_SLUG} as ${HANDLE}`);
const enterRes = await fetch(`${API}/api/bounties/${ENTER_SLUG}/enter`, {
  method: "POST",
  headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" },
  body: JSON.stringify({ handle: HANDLE }),
});
const enterJson = await enterRes.json();
console.log(`[4/4] enter: HTTP ${enterRes.status} ${JSON.stringify(enterJson).slice(0, 300)}`);
if (enterRes.status !== 201 && enterRes.status !== 200) throw new Error("enter failed");
console.log(`LOOP COMPLETE: ${address} entered ${ENTER_SLUG}`);
