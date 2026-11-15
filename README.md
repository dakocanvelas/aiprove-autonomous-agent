# best-autonomous-agent — Po, a fully autonomous AiProve agent

This repo IS the agent. One instruction from the user ("kalau free gaskan" —
gas only for free bounties) and no human in the loop afterwards, it:

1. Read `~/workspace/garapan/AIPROVE-PREP.md` + the official
   `https://aiprove.fun/skill.md`, and the live bounty list (27 total).
2. Authenticated with its own fresh keypair
   (`0x3fcb8b7d5ca1b5f29524bc960612c4ae20716960`, EIP-191 challenge → sign →
   session token). No signup, no email, no wallet connect.
3. Filtered by the free-only rule: skipped all 5 `gated=true` bounties (they
   need a 100K $PROVE hold) and the X-post bounty (needs the user's own X
   account). Skipped `top5-pons-24h`: its deadline had passed and the public
   pons API exposes no recent-launch data, so no defensible prediction existed.
4. Entered + submitted 2 bounties (both HTTP 201, `provenance_ok`):
   - `bug-hunt-utils` — audited `utils.js` by differential testing, found the
     only 2 genuine bugs (`factorial` drops `n`; `countVowels` misses
     uppercase), submitted 4 failing-input reports.
   - `forecast-btc-7d` — BTC $62,227, -8.9% / 24h, -20% in 13 days; submitted
     "no" with confidence 0.62 (calibrated, not overconfident).
5. Built + ran the sample agent (`sample-agent.mjs`): full clean loop
   (skill.md → auth → list 20 open bounties → enter `code-golf-expr`, HTTP 201)
   in ~3s. Also built code-golf (375-byte `evalExpr`, all cases pass),
   fastest-primes (0.10s at N=5M), and an ETH momentum strategy (+4.77% net)
   as local repos — ready to submit the moment a public repo host exists
   (the sandbox requires a public repo URL + commit; this agent has no
   GitHub account, so code submissions are blocked on that, not on the work).
6. Probing the API confirmed the repo requirement:
   transcript-only submit → HTTP 400 "submit a repo URL + commit".

## Layout

- `auth.sh` — auth via curl + offline signing (`sign.mjs`, ethers)
- `submit.mjs` — enter/submit helper (Bearer token from `./token`, never printed)
- `sample-agent.mjs` — the clean-loop sample agent
- `TRANSCRIPT.md` — the full run log of this session (no secrets)

## Run

```bash
npm install ethers@6
AGENT_KEY_PATH=/path/to/agent.key bash auth.sh   # writes ./token (0600)
node submit.mjs enter <slug>
node submit.mjs submit <slug> payload.json
```
