# CKBuilder Weekly Report — Week 2

## 1. Weekly Focus

This week, I continued learning the CKB Cell Model by completing the official Nervos `simple-transfer` exercise on a local OffCKB Devnet.

My goal was to understand a CKB transfer at the Cell level: how an input Cell is consumed, how new output Cells are created, and how the transaction fee affects the sender's final balance.

## 2. What I Completed

- Ran the official Nervos `simple-transfer` example.
- Used the local OffCKB Devnet configured during Week 1.
- Transferred `62 CKB` between two pre-funded Devnet accounts.
- Confirmed through RPC that the transaction reached the `committed` state.
- Checked the sender and receiver balances before and after the transfer.
- Verified the state of the original input Cell and both new output Cells.
- Recorded the transaction hash, block hash, fee, balance changes, and supporting screenshots.

Official tutorial:

https://docs.nervos.org/docs/dapp/transfer-ckb

Official example revision:

`e99f8f28e311570a85455c80cac0f1b121d8f2bf`

## 3. Transaction Results

- Network: Local OffCKB Devnet
- OffCKB: `0.4.13`
- Node.js: `v22.22.2`
- Example: Nervos `simple-transfer`
- Transfer amount: `62 CKB`
- Transaction status: `committed`
- Transaction hash:

  `0x78140eecbb1b1e0cbbfd3e136aacceebfee6b6ef4ab9cff59b7f252598802c03`

- Block hash:

  `0xf47251e1a647467470d3806fd8424d817c6b84bcd19cbab1ab8f3015bc78c6c8`

- Input Cells: `1`
- Output Cells: `2`
- Actual transaction fee: `465 Shannon` (`0.00000465 CKB`)

The example page displays `Tx fee: 0.001 CKB` as fixed interface text. The transaction is built with `completeFeeBy(signer, 1000)`, and the actual fee for this transaction was verified from the difference between its input and output capacities.

Because this transaction was completed on a local Devnet, it does not have a public block explorer URL.

## 4. Balance Changes

### Sender

- Before: `41,999,677.99998684 CKB`
- After: `41,999,615.99998219 CKB`
- Total decrease: `62.00000465 CKB`

### Receiver

- Before: `42,000,000 CKB`
- After: `42,000,062 CKB`
- Total increase: `62 CKB`

The sender's balance decreased by the transferred `62 CKB` plus the actual transaction fee of `0.00000465 CKB`.

## 5. Cell-Level Verification

The transaction consumed one input Cell with `4,199,967,799,998,684 Shannon` of capacity and created two output Cells.

- The previous input OutPoint was no longer live after commitment; `get_live_cell` returned `unknown`.
- Output 0 was a new receiver Cell with `6,200,000,000 Shannon` (`62 CKB`) and returned `live`.
- Output 1 was the sender's change Cell with `4,199,961,599,998,219 Shannon` and returned `live`.
- Input capacity minus the combined output capacity was `465 Shannon`, matching the actual transaction fee.

## 6. Problems and Solutions

The first balance query returned `fetch failed`. Direct and proxy RPC health checks showed that the node and indexer were running normally. The restricted execution environment was blocking localhost network access, so the read-only balance command was rerun with explicit local-network permission.

The standard browser-control component could not start because of a local sandbox error. I used an isolated headless Chrome profile to run the official example and changed the private-key field to password display before capturing the screenshot.

The example interface waits a fixed 10 seconds and displays the balance as an integer number of CKB. I therefore verified the final balances and transaction status independently with OffCKB balance queries and the Devnet `get_transaction` RPC.

The Devnet data was preserved, and I did not run `offckb clean`.

## 7. What I Learned

A CKB transfer does not edit an account balance in place. It consumes one or more live input Cells and creates new output Cells.

In this transaction, one output Cell belonged to the receiver and the second output returned change to the sender. The original input Cell became unavailable after it was consumed, while both new output Cells became live after the transaction was committed.

I also learned to verify a transaction through RPC instead of relying only on the balance shown by the example interface. Checking the Cell states and capacities made the relationship between ownership, capacity, change, and transaction fees clearer.

## 8. Evidence

- [RPC transaction, balance, and Cell verification](../evidence/week-02-transfer-ckb-rpc.png)
- [Official simple-transfer interface result](../evidence/week-02-transfer-ckb-ui.png)

The private-key field was masked before the interface screenshot was captured.

## 9. Plan for Next Week

- Complete the official `Store Data on Cell` exercise.
- Encode a text message and store it in a Cell's data field.
- Retrieve the resulting Cell through RPC.
- Decode the stored data back into readable text.
- Continue recording commands, transaction results, screenshots, and problems in this repository.
