# A text digital object on local Devnet

This runner adapts the official [Create a DOB tutorial](https://docs.nervos.org/docs/dapp/create-dob). It calls the example's Spore configuration and wallet helper, with `createSpore` and `unpackToRawSporeData` from the Spore SDK. The content is `text/plain` rather than the tutorial's JPEG. There is no browser upload or rendering step in this experiment.

## Environment

- Windows AMD64; Node.js v22.22.2; npm 10.9.7; OffCKB 0.4.13
- Official source revision: `e99f8f28e311570a85455c80cac0f1b121d8f2bf`
- Dependencies resolved by the official example: Spore SDK 0.2.0-beta.3, CCC 1.5.3, Lumos 0.22.0-next.5, TypeScript 5.8.3
- Fixed local RPC: `http://127.0.0.1:28114`

Use the official checkout's `examples/dApp/create-dob` directory. Read its README, run `npm install`, `npm test`, `npm run lint`, then `npm run sync:devnet` with `offckb node` running. Synchronization updates the example's generated `system-scripts.json` for the active Devnet; keep any existing edits and review that file before restoring it after the run.

From this learning repository's root in PowerShell:

```powershell
$env:CKBUILDER_DOB_EXAMPLE = '<official-checkout>/examples/dApp/create-dob'
node experiments/week-06/spore.cjs --verify
```

This queries the original transaction and live Cell, decodes the stored data, and recalculates the fee from every previous output. It requires the original preserved Windows Devnet and the installed example dependencies. It does not broadcast a transaction.

The initial mint used `--run` instead of `--verify`. Run mode refuses when the evidence file already exists. It reads only the public tutorial's local Devnet development key in memory. It never accesses wallet files or prints a key. The existing evidence must be preserved; do not delete it to replay minting. Fresh-chain reproduction would need a separate result location and its own script export.

The runner transpiles only the selected official example's TypeScript modules in memory. It does not change their source. `text/plain` is the only adaptation to the tutorial's content format. The example's wallet prints signed transactions by default; that verbose log is suppressed here while hashes, decoded content, and capacity totals are retained.

## Evidence

- [Saved transaction and Cell fields](../../evidence/week-06-spore.json)
- [Read-only run output](../../evidence/week-06-spore-run.txt)

The current local deployment uses the Spore Type Script's `data2` hash type. The tutorial's illustrative snippet shows `data1`; this run uses the exported OffCKB script deployment rather than hardcoding that snippet.

The official example's 11 tests and TypeScript check passed. Installation reported 18 dependency vulnerabilities (11 low, 6 moderate, 1 high); no dependency upgrades were applied. An initial key lookup failed before broadcasting because the source used multiline double quotes. The runner now accepts that formatting without exposing the key.
