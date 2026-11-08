# CKBuilder Weekly Report — Week 7

## 1. Weekly Focus

Week 6 created a Spore text object. This week followed the same object through a transfer to a second Devnet account: which fields change, and which let a wallet recognize it as the same object?

## 2. What I Completed

- Restarted the preserved Windows OffCKB Devnet and checked that the Week 6 mint was committed and its Spore Cell was still live.
- Used the Spore SDK's `transferSpore` and the official Create a DOB example's signing helper. The destination was the public lock of the Week 4 Devnet recipient.
- Queried the committed transfer and its new live output using local JSON-RPC. A separate read-only run checked the saved result again.

The [Nervos SDK guide](https://docs.nervos.org/docs/sdk-and-devtool/ccc) describes the workflow in its “Transfer Spore” example. This run reused the Spore SDK from the [Create a DOB example](https://docs.nervos.org/docs/dapp/create-dob) instead of running the public-network playground.

## 3. Result

- Transaction: `0x295298861c0a69c41843685ea4a352a58cc3271021210b01462197735950749c`
- Block: `0x7923151d354f86c818fb3e8489bcba3e7a003ffbcb67a478b6eb2124f885dabc`
- Status: `committed`; **2 inputs / 2 outputs**
- Spore ID: `0xbd4b1047a969a66aef8026e98d2540b324e25568a0383dc759f0bb077955e30e`
- New Spore output: index `0x0`, `live` when queried, **213 CKB**
- Fee: **1,058 Shannon** (**0.00001058 CKB**)

The transfer input references the Week 6 Spore OutPoint. The old Cell now returns `unknown`; the input reference establishes that the transfer spent it. The new Cell has the recipient's Lock Script, the same Type Script, and byte-identical data. Its decoded text is still `CKBuilder Week 6 - Spore digital object - Clare Yang`.

The other input supplied ordinary CKB. The Spore capacity stayed at 213 CKB, and the fee came out of the ordinary CKB change. Summing all inputs and outputs with `BigInt` gives 4,199,921,599,995,815 minus 4,199,921,599,994,757 Shannon.

## 4. Setup and Problems

Node.js v22.22.2, npm 10.9.7, OffCKB 0.4.13, Spore SDK 0.2.0-beta.3, Lumos 0.22.0-next.5, and the official checkout at `e99f8f28e311570a85455c80cac0f1b121d8f2bf` were reused. The example's 11 configuration tests and the runner's syntax check passed. The generated script configuration was refreshed for the run and restored afterward.

`offckb node stop` again failed the daemon identity check on Windows. The node was left running; the process was not forcibly stopped and the chain data was kept.

## 5. What I Learned

The Spore ID follows the object, while the OutPoint identifies a particular Cell in its history. This transfer changed the spending lock and created a new OutPoint without changing the payload. A wallet or indexer looking up the current owner needs the live Cell for the Spore Type Script, rather than the mint OutPoint alone.

## 6. Code and Evidence

- [Setup and read-only commands](../experiments/week-07/README.md)
- [Runner](../experiments/week-07/transfer-spore.cjs)
- [RPC transaction and Cell data](../evidence/week-07-spore-transfer.json)
- [Read-only run output](../evidence/week-07-spore-run.txt)

This was a headless local run. It has no UI screenshot or public explorer link.

## 7. Next Steps

- Try locating the current owner by Spore ID from an indexer or wallet view.
- Compare text and image payloads and how a client renders them.
