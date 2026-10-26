# xUDT balances across multiple Cells

A small extension of the official [Create a Fungible Token tutorial](https://docs.nervos.org/docs/dapp/create-token), using the [same CCC helpers](https://github.com/nervosnetwork/docs.nervos.org/blob/e99f8f28e311570a85455c80cac0f1b121d8f2bf/examples/dApp/xudt/lib.ts) as Week 4.

The exercise creates two token Cells for a local learner account (300,000 and 400,000 units), then sends 650,000 back to the issuer. Since neither Cell covers the amount alone, both must be consumed. The learner receives 50,000 units of change. No new tokens are issued.

## Read the saved run without a node

From the repository root, using Node.js 20 or later:

```sh
node experiments/week-05/xudt-multi-cell.cjs --check-saved
```

This uses only Node's built-in modules. It checks capacities, fees, token amounts, snapshots, and input references in [the saved result](../../evidence/week-05-xudt-result.json). It does not connect to a network or prove chain inclusion by itself.

## Query the original local chain

Start the preserved Week 3–5 OffCKB Devnet in another terminal:

```sh
offckb node
```

Then, from the repository root:

```sh
node experiments/week-05/xudt-multi-cell.cjs --verify
```

This calls the fixed local RPC `http://127.0.0.1:28114`, looks up both transactions and their previous outputs, and compares the current live token Cells with the saved final snapshot. Later spending of those Cells will make the snapshot comparison fail. The code also works without importing CCC in this mode.

## Transaction-building setup used for the recorded run

Environment: Windows AMD64, Node.js v22.22.2, npm 10.9.7, OffCKB 0.4.13, CCC 1.9.0. The official source checkout was at `e99f8f28e311570a85455c80cac0f1b121d8f2bf`. Its existing xUDT dependencies were reused. Export the active Devnet scripts to a file outside the official source checkout:

```sh
offckb system-scripts --network devnet --export-style ccc --output <local-system-scripts.json>
```

Before the original run, these PowerShell variables pointed to the official example and the exported file:

```powershell
$env:CKBUILDER_EXAMPLE_DIR = '<official-checkout>/examples/dApp/xudt'
$env:CKBUILDER_SYSTEM_SCRIPTS = '<local-system-scripts.json>'
node experiments/week-05/xudt-multi-cell.cjs --run
```

`--run` broadcasts two local transactions. It requires the exact Week 4 chain and starting balances, and refuses to replay a saved broadcast. The completed run has already spent its original inputs; use the two read-only modes above when reviewing this repository. A fresh Devnet would need its own token setup and starting fixtures, so this is not a one-command fresh-chain demo.

The funding signer is read in memory from the official tutorial's public Devnet-only example. The learner uses a public deterministic test identity derived from the local genesis hash. Neither key is printed or saved, and neither identity is suitable for real assets. No wallet files or environment secrets are read.

## What is recorded

- Before, after-split, and after-transfer snapshots, with full scripts and token amounts.
- Both transaction hashes, blocks, inputs, outputs, capacity totals, and fees.
- Consumption references for the two fragments.
- [Read-only run output](../../evidence/week-05-xudt-run.txt) and an [unedited screenshot](../../evidence/week-05-xudt-run.png) of that output opened in Notepad.

The first attempt stopped before broadcasting because the CCC configuration omitted `AnyoneCanPay`. Copying the full known-script mapping used by the official client resolved it. The exported configuration and node startup logs stay outside the repository; official source files were not changed.

At cleanup, `offckb node stop` failed its daemon identity check on Windows. The daemon was left running with its data intact. No forced process termination or chain cleanup was used.
