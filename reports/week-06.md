# CKBuilder Weekly Report — Week 6

## 1. Weekly Focus

After xUDT balances and transfers, this week's task was a first Spore digital object on the existing local Devnet. The starting point was the official [Create a DOB tutorial](https://docs.nervos.org/docs/dapp/create-dob), adapted to a small text payload instead of a JPEG upload.

## 2. What I Completed

- Installed the official `create-dob` example's dependencies, ran its 11 tests, and ran the TypeScript check.
- Resumed the Windows Devnet and synchronized the example's system-script configuration.
- Used the Spore SDK and the example's signing helper to create a `text/plain` object.
- Queried the transaction and its live output through local RPC, unpacked the Spore data, and compared the decoded content with the original message.
- Saved the runner, transaction fields, and read-only output log.

The message was `CKBuilder Week 6 - Spore digital object - Clare Yang`.

## 3. Result

- Transaction: `0x24ff7c3f51f98e5a4d0bd4648f927a94b08dad8d7ca33042e19c1593163b6ef8`
- Block: `0x2a01a92f2d2e89b0ca10ff9ea9c688cfe10e559569ea77d98c68d2f72acedb8a`
- Status: `committed`
- Spore ID: `0xbd4b1047a969a66aef8026e98d2540b324e25568a0383dc759f0bb077955e30e`
- Output index: `0x0`, state `live` at the time of the query
- Capacity: **213 CKB** (`21,300,000,000 Shannon`)
- Inputs / outputs: **2 / 2**
- Fee: **1,013 Shannon**, or **0.00001013 CKB**
- Content type: `text/plain`

The live Cell data matched transaction output data, and unpacking it returned the exact original message. The fee is the sum of all input capacities minus all output capacities, calculated with `BigInt`. These are local Devnet results, with no public explorer link.

The run used Node.js v22.22.2, npm 10.9.7, OffCKB 0.4.13, Spore SDK 0.2.0-beta.3, CCC 1.5.3, and Lumos 0.22.0-next.5. The official checkout stayed at `e99f8f28e311570a85455c80cac0f1b121d8f2bf`.

## 4. Problems and Solutions

The first attempt could not find the tutorial's public development key because the lookup expected a single-line string. The source used multiline double quotes. Adjusting the parser fixed it before any transaction was sent.

The tutorial's sample structure shows a `data1` Type Script, while the current OffCKB export uses `data2` for this Spore deployment. The runner uses the exported configuration and checks the output against it.

Installation reported 18 dependency vulnerabilities. The official versions were kept for this local exercise rather than applying automatic upgrades.

## 5. What I Learned

The payload is wrapped in Spore's structured data format, including a content type. Unlike xUDT's integer quantity, this Cell stores a particular object with its own ID in the Type Script args. Retrieving it means locating the OutPoint and unpacking those bytes.

This is also an onboarding detail: the tutorial's conceptual structure, the SDK's configuration, and the active Devnet deployment need to agree. Saving the actual script fields makes those differences easier to investigate.

## 6. Code and Evidence

- [Runner and setup](../experiments/week-06/README.md)
- [Code](../experiments/week-06/spore.cjs)
- [Transaction and Cell data](../evidence/week-06-spore.json)
- [Read-only output](../evidence/week-06-spore-run.txt)

This run covers text creation and retrieval through a script. Image upload, browser rendering, and UI screenshots were not part of the completed work. No screenshot is supplied for this headless run.

## 7. Next Steps

- Try an image payload and render the bytes returned from the Cell.
- Explore how a wallet presents a Spore object and its ownership.
- Continue the fresh-chain reproduction setup left open in Week 5.
