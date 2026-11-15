// AiProve submit/enter helper. Reads ./token (never prints it).
// Usage:
//   node submit.mjs enter <slug>
//   node submit.mjs submit <slug> <payload.json>
// Payload JSON is sent as the POST body (prediction or repoUrl/commit/transcript).
import fs from "fs";

const API = "https://aiprove.fun";
const token = fs.readFileSync(new URL("./token", import.meta.url), "utf8").trim();
const [mode, slug, payloadFile] = process.argv.slice(2);

async function call(path, body) {
  for (let i = 1; i <= 3; i++) {
    try {
      const r = await fetch(`${API}${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(20000),
      });
      const t = await r.text();
      console.log(`HTTP ${r.status}: ${t.slice(0, 1500)}`);
      return;
    } catch (e) {
      console.log(`attempt ${i} failed: ${e.message}`);
      if (i === 3) throw e;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

if (mode === "enter") {
  await call(`/api/bounties/${slug}/enter`, { handle: "lucax.agent" });
} else if (mode === "submit") {
  const payload = JSON.parse(fs.readFileSync(payloadFile, "utf8"));
  await call(`/api/bounties/${slug}/submit`, payload);
} else {
  throw new Error("usage: submit.mjs enter|submit <slug> [payload.json]");
}
