# CKBuilder — CKB Infrastructure Learning Log

**Clare Yang** · Web3 / AI Infrastructure Ecosystem Development

My background includes Web3 wallet and cross-chain research, ecosystem content, community building, technical event organization, and collaboration with developers and project teams. My career focus is ecosystem development: connecting infrastructure understanding with ecosystem research, builder onboarding, developer communities, partnerships, and growth.

CKBuilder is a step from ecosystem research into hands-on technical learning. Through local experiments on Nervos CKB, I am exploring how transactions, storage, and custom tokens work beneath a wallet interface, what developers need to get started, and where they encounter adoption barriers. This technical understanding supports my ecosystem work; the goal is not a transition into protocol engineering.

The exercises use official Nervos examples and coding-tool support. This repository covers the blockchain side of my broader Web3 / AI infrastructure direction.

## Learning Journey

| Week | Experiment and recorded result | Report | Evidence |
|---|---|---|---|
| 1 | OffCKB setup; `hello-world.bc` deployed and committed; 2 suites and 2 tests passed | [Setup and deployment](reports/week-01.md) | [Terminal summary](evidence/offckb-onboarding-success.png) |
| 2 | Transfer of 62 CKB; 1 input and 2 outputs; actual fee 465 Shannon | [Transfer CKB](reports/week-02.md) | [RPC](evidence/week-02-transfer-ckb-rpc.png) · [UI](evidence/week-02-transfer-ckb-ui.png) |
| 3 | Custom UTF-8 message stored and read back exactly; 111 CKB message Cell; fee 515 Shannon | [Store Data on Cell](reports/week-03.md) | [RPC](evidence/week-03-store-data-rpc.png) · [UI](evidence/week-03-store-data-ui.png) |
| 4 | Issue 1,000,000 xUDT units; transfer 123,456; issuer retains 876,544; both transactions committed | [Create a Fungible Token](reports/week-04.md) | [Issue/query](evidence/week-04-xudt-issue-query-evidence.png) · [Transfer](evidence/week-04-xudt-transfer-evidence.png) · [RPC JSON](evidence/week-04-xudt-rpc-verification.json) |
| 5 | Split 700,000 units across two Cells; spend both to return 650,000; 50,000 change | [Multi-Cell xUDT transfer](reports/week-05.md) | [Code](experiments/week-05/README.md) · [Run screenshot](evidence/week-05-xudt-run.png) · [JSON](evidence/week-05-xudt-result.json) |

Weeks 1–2 used a Mac Devnet. Week 3 initialized a separate Windows Devnet, reused in Weeks 4–5. All experiments used local development assets. Transaction hashes have no public explorer links; the reports preserve them for correlation with local evidence.

Week 4 used a local runner after browser automation was blocked. Its images are rendered RPC extracts; webpage UI screenshots are still missing. Week 5 includes a screenshot of actual run output opened in Notepad.

## What the Evidence Shows

- **Deployment workflow:** the Week 1 terminal summary records the deployment hash, committed status, and passing tests.
- **Transaction accounting:** Week 2 records sender and receiver balance changes, output capacities, and the actual fee rather than relying on fixed UI fee text.
- **Cell data:** Week 3 compares transaction data with `get_live_cell` data and decodes the hex back to the original message.
- **Token ownership and balances:** Week 4's [verification JSON](evidence/week-04-xudt-rpc-verification.json) records inputs, outputs, scripts, data, capacities, and OutPoints. The two final token Cells held 123,456 and 876,544 units at verification time; each carried 146 CKB of capacity. Issuance and transfer fees were 606 and 864 Shannon.

Cell states in these reports describe the time of verification, not a promise that outputs will remain unspent. A `get_live_cell` response of `unknown` alone is not proof of consumption; the spending transaction's input reference supplies that evidence in the Week 4 record.

## Concepts Practiced

| Concept | Connection to the experiments |
|---|---|
| Cell Model and transaction inputs/outputs | Transfers consume existing Cells and create receiver and change outputs. |
| Capacity and fees | CKB backs occupied state; total input capacity minus total output capacity gives the fee for these ordinary transactions. |
| Cell data | Week 3 stores UTF-8 text; Week 4 stores token quantities as 16-byte little-endian integers. |
| Lock and Type Scripts | Lock Scripts control spending; the complete xUDT Type Script identifies the token and enforces its rules. |
| OutPoint, committed, and live | Transaction hash plus output index locates a Cell; transaction inclusion and output spendability are distinct checks. |

## Environment and Reproduction

The recorded runs used **Node.js v22.22.2**, **npm 10.9.7**, and **OffCKB 0.4.13**. Week 4 used **CCC 1.9.0**, **Parcel 2.15.4**, and **Git 2.53.0.windows.3** on Windows. Local node and RPC proxy ports were **8114** and **28114**.

Weeks 2–4 record official source revision `e99f8f28e311570a85455c80cac0f1b121d8f2bf`. Week 4 also checked upstream revision `c205789868ced3f0972a01e18e2ad5e49b1aba3a` and found no relevant example changes. See the [versioned xUDT example](https://github.com/nervosnetwork/docs.nervos.org/tree/e99f8f28e311570a85455c80cac0f1b121d8f2bf/examples/dApp/xudt) and each report for its source and environment.

The [Week 5 experiment](experiments/week-05/README.md) includes a runner, saved data, and read-only checks. Its offline mode needs only Node.js; its RPC mode needs the original local chain. Transaction-building currently requires the Week 4 fixtures. Earlier runner scripts, full execution logs, and Devnet chain data are not included. A fresh-chain setup remains a next step.

## Connection to Ecosystem Development

These records connect official documentation to observed transaction fields, preserve problems and solutions, and distinguish verified results from explanations and open questions. Documenting versions, prerequisites, verification steps, and failure points can make builder onboarding easier to follow and repeat. The remaining reproduction gaps are listed above; no reduction in onboarding time or improvement in adoption has been measured.

For ecosystem research and partnerships, this work provides concrete questions about tooling, integration requirements, and developer support needs. For developer education and community building, it provides material for explaining workflows and discussing where newcomers need help. These are intended uses of the learning record, not claims of completed ecosystem partnerships or growth outcomes from CKBuilder.

CKB-specific research here is introductory and centered on official Nervos materials. Fiber and payment use cases are interests for further study; this repository does not yet document a Fiber node, ecosystem comparison, or production integration.

## Challenges and Next Steps

Recorded challenges include RPC availability, an Intel macOS debugger compatibility issue, Windows toolchain discovery, and generated system-script configuration. Week 4 also records dependency audit findings without claiming they were resolved.

- Continue working through xUDT authorization and wallet behavior.
- Collect private-key-free Week 4 UI evidence if required by onboarding review.
- Extend the Week 5 runner with a fresh-chain setup.
- Study xUDT issuance authorization and extension flags; neither additional issuance nor extensions were tested.
- Continue studying CKB-VM, then choose a concrete Fiber or payment exercise.

## Start Reading

- [Week 1](reports/week-01.md) → [Week 2](reports/week-02.md) → [Week 3](reports/week-03.md) → [Week 4](reports/week-04.md)
- [Week 5 — Multi-Cell xUDT transfer](reports/week-05.md)
- [Official CKB documentation](https://docs.nervos.org/) · [OffCKB](https://docs.nervos.org/docs/sdk-and-devtool/offckb)
