# CKBuilder Weekly Report — Week 3

## 1. Weekly Focus

This week, I completed the official Nervos **Store Data on Cell** exercise on a local OffCKB Devnet. The goal was to write a custom UTF-8 message into a Cell, locate that Cell by its OutPoint, and verify the stored data independently through RPC.

Codex assisted with the environment setup, the example workflow, evidence capture, and RPC verification. I reviewed the resulting transaction and used the verified fields below to develop my initial understanding of Cell data.

## 2. Source and Environment

- Official tutorial: [Store Data on Cell](https://docs.nervos.org/docs/dapp/store-data-on-cell)
- Official example: `nervosnetwork/docs.nervos.org/examples/dApp/store-data-on-cell`
- Source revision: `e99f8f28e311570a85455c80cac0f1b121d8f2bf`
- Operating system: Windows 11 x64
- Node.js: `v22.22.2`
- npm: `10.9.7`
- OffCKB: `0.4.13`
- Network: local OffCKB Devnet only

This was a newly initialized Devnet on Windows. It was separate from the Week 2 Mac Devnet and did not continue the Week 2 chain data.

## 3. What I Completed

- Cloned the official Nervos documentation repository and opened the `store-data-on-cell` example.
- Started a local CKB node, Indexer, and OffCKB RPC proxy.
- Ran the official example at `http://localhost:1234`.
- Wrote the message `CKBuilder Week 3 - Store Data on Cell - Clare Yang`.
- Waited for the transaction to be committed and used the page's Read function.
- Confirmed that the message read from the Cell exactly matched the original text.
- Independently queried the transaction and Output 0 through the local RPC.
- Calculated the actual fee with exact integer capacity arithmetic across all inputs and outputs.

## 4. Verified Result

- Original and decoded message: `CKBuilder Week 3 - Store Data on Cell - Clare Yang`
- Transaction hash:

  `0x162ac11c9956fe2227de0b26afe806c8109fe7a2ef0322feb3db7a1164db8bcc`

- Block hash:

  `0xd59cf68f929acba2a6c13ea26fbba5e3d5150617a0f99815758426e06d7ca89b`

- Transaction status: `committed`
- Input Cells: `1`
- Output Cells: `2`
- Message Cell OutPoint index: `0x0`
- Message Cell state: `live`
- Message Cell capacity: `11,100,000,000 Shannon` (`111 CKB`)
- Type script: none
- Actual fee: `515 Shannon` (`0.00000515 CKB`)
- Output data:

  `0x434b4275696c646572205765656b2033202d2053746f72652044617461206f6e2043656c6c202d20436c6172652059616e67`

The transaction Output 0 data and the data returned by `get_live_cell` matched byte for byte. Decoding the hex as UTF-8 reproduced the original message exactly.

This transaction was created on a local Devnet, so it does not have a public block explorer URL.

## 5. What I Learned

The message was converted from text into UTF-8 bytes and represented as a `0x`-prefixed hex string for transaction serialization. The example placed that value in `outputsData[0]`, which corresponds to the Cell defined by `outputs[0]`.

The transaction hash identifies the transaction that created the Cell, while index `0x0` selects its first output. Together they form the OutPoint used to locate the message Cell.

Capacity and data serve different purposes. Capacity represents the Cell's CKB-denominated storage resource and value; the data field contains the application payload. In this result, the message Cell held `111 CKB` of capacity and the encoded Week 3 message as data.

`committed` confirms that the transaction was included in a block. `live` confirms that Output 0 still exists in the live Cell set and has not been consumed. A committed Cell cannot be edited in place; changing the message would require consuming the old Cell and creating a new output Cell with new data.

## 6. Problems and Solutions

The Windows environment did not contain the Week 2 Mac checkout, npm, OffCKB, or Devnet data. A checksum-verified portable Node.js installation and a task-local OffCKB installation were used, and a new local-only Windows Devnet was initialized. No system PATH or administrator configuration was changed.

The official example displayed its Devnet private-key field as plain text. The final UI evidence was captured from a result-only viewport that excluded the private-key field. Both evidence images were checked before publication and contain no private key or authentication information.

The example's startup synchronization temporarily updated `system-scripts.json` for the active Devnet. That generated change was restored after the run, leaving the official source checkout clean at the recorded revision.

## 7. Evidence

- [Official example UI result](../evidence/week-03-store-data-ui.png)
- [Independent RPC verification](../evidence/week-03-store-data-rpc.png)

## 8. Plan for Next Week

- Follow the official **Create a Fungible Token** tutorial.
- Record the token Cell structure, transaction results, and verification evidence.
- Continue documenting errors and solutions without treating planned work as completed.
