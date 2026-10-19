# CKBuilder Weekly Report — Week 4

## 1. Weekly Focus and Assistance

This week's task was **Create a Fungible Token**: issuing, querying, and transferring xUDT on a local OffCKB Devnet.

This record documents verified technical results and introductory study notes. Codex assisted with environment checks, local transaction execution, RPC verification, and preparing this record. It does not claim that I independently implemented the example or have mastered xUDT. Personal reflection and answers to the open questions remain to be added in my own words.

## 2. Sources and Environment

- [Official Create a Fungible Token tutorial](https://docs.nervos.org/docs/dapp/create-token)
- [Official example at the source revision used](https://github.com/nervosnetwork/docs.nervos.org/tree/e99f8f28e311570a85455c80cac0f1b121d8f2bf/examples/dApp/xudt)
- [Nervos Blockchain fundamentals](https://docs.nervos.org/docs/ckb-fundamentals/nervos-blockchain)
- [How CKB Works](https://docs.nervos.org/docs/getting-started/how-ckb-works)
- [OffCKB documentation](https://docs.nervos.org/docs/sdk-and-devtool/offckb)

| Component | Version or configuration |
|---|---|
| Operating system | Windows, AMD64 |
| Node.js | v22.22.2 |
| npm | 10.9.7 |
| Git | 2.53.0.windows.3 |
| OffCKB | 0.4.13 |
| CCC | 1.9.0, resolved from the example lockfile |
| Parcel | 2.15.4 |
| Official source revision used | `e99f8f28e311570a85455c80cac0f1b121d8f2bf` |
| Upstream revision checked during setup | `c205789868ced3f0972a01e18e2ad5e49b1aba3a` |
| Local node / RPC proxy ports | 8114 / 28114 |

The xUDT example and corresponding tutorial source had no changes between the two checked revisions. The existing Windows Devnet from Week 3 was reused without resetting its data. This is separate from the Mac Devnet used in Week 2. No Testnet, Mainnet, or real assets were used.

## 3. What Was Completed

1. Checked the official example README, dependencies, source revision, and repository status.
2. Ran `npm install`, the six synchronization tests, and `npm run lint`; the tests and TypeScript checks passed.
3. Started OffCKB and confirmed local RPC health.
4. Ran `npm start`; the official example served at `http://localhost:1234`.
5. Issued **1,000,000 raw token units** using a local runner following the CCC transaction-construction logic in the official `lib.ts`.
6. Queried the issued token Cells using the complete returned xUDT args.
7. Transferred **123,456 units** to a second pre-funded Devnet account, leaving **876,544 units** with the issuer.
8. Independently checked both transactions and their Cells through raw local JSON-RPC.

The browser-control security policy blocked interaction with the localhost page. The transactions were therefore executed through the local runner, not by clicking the webpage buttons. The evidence images below are rendered extracts of actual RPC results, explicitly labeled as such. Webpage UI screenshots have not been collected.

## 4. Verified Transactions

### Issuance

- Transaction: `0x28b1cb10d7203dfc6dd7e4a04b3d326934cd8ae71ab64ce7025fd03cdf989ccf`
- Block: `0x04a92f68c1e9b38105e3154956ebe5a42c0e0f7fb0b892ffd8dc9cc706c64d38`
- Status: `committed`
- Inputs / outputs: **1 / 2**
- Issued amount: **1,000,000**
- Token output index: `0x0`
- Token Cell capacity: **146 CKB**, or `14,600,000,000 Shannon`
- Input capacity total: `4,199,988,899,999,485 Shannon`
- Output capacity total: `4,199,988,899,998,879 Shannon`
- Actual fee: **606 Shannon**, or **0.00000606 CKB**

The issuance token Cell was subsequently consumed by the transfer. Its final `get_live_cell` response is `unknown`; its consumption is also established by the transfer input referencing that exact OutPoint. The issuance transaction remains committed.

### Transfer

- Transaction: `0x390d365961a7db90f8e4bd6e53754c2c8fcf7124a7904e456bff589f2c395ea2`
- Block: `0x39fc099051ce14cf7b61a69f19c111473f98b0fa0abe219fdbf55ce859ce9d2f`
- Status: `committed`
- Inputs / outputs: **2 / 3**
- Receiver output `0x0`: **123,456 units**, **146 CKB**, `live`
- Issuer token-change output `0x1`: **876,544 units**, **146 CKB**, `live`
- Output `0x2`: ordinary CKB capacity change, no Type Script, empty data
- Input capacity total: `4,199,988,899,998,879 Shannon`
- Output capacity total: `4,199,988,899,998,015 Shannon`
- Actual fee: **864 Shannon**, or **0.00000864 CKB**

The two token outputs use the same complete xUDT Type Script. Their Lock Script args differ: the receiver uses `0x758d311c8483e0602dfad7b69d9053e3f917457d`, while the issuer uses `0x8e42b1999f265a0078503c4acec4d5e134534297`.

Token conservation was verified as `123456 + 876544 = 1000000`. Fees were calculated with exact integer arithmetic across **all** inputs and outputs. Both live token Cells' RPC data matched their transaction output data exactly.

These are local Devnet transactions and have no public block explorer URLs.

## 5. Token Identity and Encoding

Complete xUDT args:

```text
0x7de82d61a7eb2ec82b0dc653e558ba120efcbfbb44dac87c12972d05bf25065300000000
```

Type Script code hash: `0x1a1e4fef34f5982906f745b048fe7b1089647e82346074e0f32c2ece26cf6b1e`; hash type: `type`.

| Meaning | Raw token units | 16-byte little-endian data |
|---|---:|---|
| Issued amount | 1,000,000 | `0x40420f00000000000000000000000000` |
| Receiver amount | 123,456 | `0x40e20100000000000000000000000000` |
| Issuer token change | 876,544 | `0x00600d00000000000000000000000000` |

All three data values were decoded and checked against their expected integer amounts. No token name, symbol, or decimal metadata was created in this exercise.

## 6. Introductory Study Notes

**Directly described by the official tutorial:** UDTs are custom tokens on CKB; xUDT is an extensible UDT standard. This example constructs args from the issuer's 32-byte Lock Script hash followed by four zero flag bytes. It writes the amount with `ccc.numLeToBytes(amount, 16)`, queries live Cells by Type Script, and creates receiver and sender-change outputs during transfer. The zero flags configure no extension Scripts while retaining the standard owner-authorization check.

**Explanation based on this run:** the Type Script identifies and validates the token, the Lock Script controls who can spend a particular Cell, and data holds the token quantity. Capacity is native CKB backing the Cell's occupied state, not the token quantity: both the 123,456-unit receiver Cell and the 876,544-unit change Cell hold 146 CKB of capacity.

Little-endian encoding puts the least-significant byte first. For example, 1,000,000 is hexadecimal `0x0f4240`, so its significant bytes are stored as `40 42 0f`, followed by zeros to fill 16 bytes. This is binary integer encoding, unlike the UTF-8 text data used in Week 3.

An OutPoint combines the creating transaction hash with an output index. The transfer hash plus `0x0` locates the receiver's token Cell; the same hash plus `0x1` locates the issuer's token change. `committed` establishes transaction inclusion, while `live` establishes that an output remains available to spend. Existing Cells are consumed and replaced; they are not edited in place.

These notes are introductory explanations prepared with Codex assistance, not a claim of independent proficiency.

## 7. Challenges and Solutions

- The new shell did not expose npm or OffCKB. The existing portable Node.js v22.22.2 toolchain was reused through explicit paths.
- Localhost browser automation was blocked. A local runner followed the official example's transaction logic, with separate raw RPC verification. The missing UI evidence is recorded explicitly.
- `npm start` synchronized `system-scripts.json` with the local OffCKB deployments. That generated change was reviewed and restored after the run; the official source repository was clean afterwards.
- Installation reported 19 dependency vulnerabilities: 9 low, 6 moderate, and 4 high. No automatic dependency upgrades were applied during this local exercise.

## 8. Evidence

The images are factual RPC extracts, not webpage screenshots. They contain no private keys.

- [Issuance and query evidence](../evidence/week-04-xudt-issue-query-evidence.png)
- [Transfer evidence](../evidence/week-04-xudt-transfer-evidence.png)
- [Independent RPC verification evidence](../evidence/week-04-xudt-rpc-evidence.png)
- [Detailed RPC verification JSON](../evidence/week-04-xudt-rpc-verification.json), including complete input/output capacities, Lock Scripts, Type Scripts, data, and OutPoints

## 9. Open Questions and Next Steps

- Explain in my own words why the issuer hash is part of token identity, while the holder's Lock Script changes during transfer.
- Explore how xUDT owner authorization differs from ordinary transfers, including why the issuer can issue additional units.
- Study nonzero flags and extension Scripts; these were not exercised this week.
- Review the distinction between token conservation, capacity used to occupy state, and transaction fees.
- Add a personal reflection and collect a private-key-free UI screenshot if needed for onboarding review.

The next stage is to consolidate these points before choosing another practical exercise. No future task is recorded as completed.
