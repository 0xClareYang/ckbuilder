# CKBuilder Weekly Report — Week 5

## 1. Weekly Focus

This week continued the xUDT exercise with a question from Week 4: what happens when a token balance is spread across several Cells?

The task was to split tokens into two Cells and make a transfer too large for either Cell alone. It uses the existing Windows Devnet and the official [Create a Fungible Token](https://docs.nervos.org/docs/dapp/create-token) example's CCC helpers, without issuing another token or building a new dApp.

## 2. What I Completed

- Resumed the Week 4 Devnet and queried its existing token Cells.
- Created two Cells holding 300,000 and 400,000 units for a local learner account.
- Included a separate 200 CKB output so that account could pay its next transaction fee.
- Sent 650,000 units back to the issuer, consuming both token Cells and leaving 50,000 units of change.
- Queried all live Cells for the token and added their amounts by holder.
- Saved the script, transaction data, output log, and a screenshot of the log.

The runner extends the official example rather than using a wallet UI. The environment was Node.js v22.22.2, npm 10.9.7, OffCKB 0.4.13, and CCC 1.9.0 on Windows. The example checkout remained at `e99f8f28e311570a85455c80cac0f1b121d8f2bf`.

## 3. Results

### Split into two Cells

- Transaction: `0xc4e8b6aa4bc5c087f76801ccea32897463354648a3960e26c3aa35d5a711a73a`
- Block: `0x10e125dde54aadc86fd0116f226702b7ecbc14865ecaf84b6ef0d07f8620f0c0`
- Status: `committed`
- Inputs / outputs: **2 / 5**
- Learner token Cells: **300,000 + 400,000 units**, each with **146 CKB** capacity
- Issuer token change: **176,544 units**
- Fee: **1,187 Shannon**, or **0.00001187 CKB**

### Spend both token Cells

- Transaction: `0x685a9f2f2c1f719db971d4d25ba48ab279aff5ce2f7c8cb24c558d197a698391`
- Block: `0x9d5960a188481ba9f59d14839d622dbc8c1ad5b7a5843cd6a3ab65ebfe9c1382`
- Status: `committed`
- Inputs / outputs: **3 / 3** — two token inputs and one ordinary CKB input
- Returned to issuer: **650,000 units**
- Learner token change: **50,000 units**
- Fee: **908 Shannon**, or **0.00000908 CKB**

All inputs to the second transaction belonged to the learner, not the issuer. Both fragments appear in its input references and are no longer live. The new token outputs were live when queried, with the same Type Script and correctly decoded 16-byte data.

| Holder | Before Week 5 | After split | After transfer |
|---|---:|---:|---:|
| Issuer | 876,544 | 176,544 | 826,544 |
| Week 4 receiver | 123,456 | 123,456 | 123,456 |
| Learner | 0 | 700,000 | 50,000 |
| Total | 1,000,000 | 1,000,000 | 1,000,000 |

The issuer's final balance is itself in two Cells: 176,544 and 650,000. The saved Week 4 snapshot remains a record of that earlier run; some of its outputs have now been spent.

## 4. Problems and Solutions

The first attempt failed with `No script information was found for AnyoneCanPay on ckt`. Only the secp256k1 and xUDT scripts had been supplied to CCC. Using the full known-script mapping from the official client fixed it. No transaction had been broadcast during that failed attempt.

Two token Cells provided 292 CKB in total, but the receiver and token-change outputs also needed 292 CKB. A separate ordinary CKB input covered the fee. The runner calculates fees with `BigInt` across all inputs and outputs.

The script saves each hash as soon as it is returned and refuses to replay a saved broadcast. Review uses read-only RPC calls or an offline check of the saved data.

After the run, `offckb node stop` refused to stop the daemon because its process-identity check failed. The node was left running rather than forcing termination; the Devnet data was kept.

## 5. What I Learned

A token balance is a sum, not necessarily one Cell. Neither 300,000 nor 400,000 covered a 650,000-unit transfer; CCC collected both and created a 50,000-unit change Cell. A wallet can hide this selection, while RPC makes the individual Cells visible.

Token change and CKB capacity change are separate outputs. Keeping the two calculations separate makes it easier to explain why having enough tokens does not always mean having enough capacity for a transaction.

For builder onboarding, a small script with saved inputs and outputs gives readers something concrete to inspect. This week's code includes an offline mode, so reviewing the arithmetic does not require running a node.

## 6. Code and Evidence

- [Experiment and commands](../experiments/week-05/README.md)
- [Runnable script](../experiments/week-05/xudt-multi-cell.cjs)
- [Transaction and Cell data](../evidence/week-05-xudt-result.json)
- [Read-only RPC run output](../evidence/week-05-xudt-run.txt)
- [Screenshot of the output in Notepad](../evidence/week-05-xudt-run.png)

These transactions exist only on the local Devnet and have no public explorer links. The offline check recalculates the saved data; the RPC mode queries the original chain.

## 7. Next Steps

- Try the official Create a DOB example to compare a unique digital object with fungible tokens.
- Make a fresh-chain setup so another builder can repeat the multi-Cell exercise without the Week 4 fixtures.
- Work through additional issuance and xUDT extension flags separately; neither was tested this week.
