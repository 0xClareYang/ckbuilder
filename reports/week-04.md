# CKBuilder Weekly Report — Week 4

## 1. Weekly Focus and Assistance

This week's task was **Create a Fungible Token**: issuing, querying, and transferring xUDT on a local OffCKB Devnet.

This exercise supports my focus on Web3 Infrastructure Ecosystem Development. Building on my Web3 wallet and cross-chain research, ecosystem content, community work, technical events, and collaboration with developers and project teams, CKBuilder adds practical exposure to infrastructure workflows. The aim is to better understand builder prerequisites and adoption barriers so that technical knowledge can inform ecosystem research, developer education, community support, and partnerships. This week's experiment concerns CKB, not AI infrastructure.

This record documents verified technical results and introductory study notes. Codex assisted with environment checks, local transaction execution, RPC verification, and preparing this record. It does not claim that I independently implemented the example or have mastered xUDT. 

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

### Connecting the Verified Cells to Ownership and Balances

**Observed in this experiment:** the transfer consumed both issuance outputs: the 1,000,000-unit xUDT Cell at index `0x0` and the ordinary CKB change Cell at index `0x1`. It created three new outputs:

| Transfer output | Holder | Raw token units | Capacity | Type/data |
|---|---|---:|---|---|
| `0x0` | Receiver | 123,456 | 146 CKB | Same xUDT Type Script; amount in data |
| `0x1` | Issuer | 876,544 | 146 CKB | Same xUDT Type Script; amount in data |
| `0x2` | Issuer | None | 41,999,596.99998015 CKB | No Type Script; empty data |

**Mechanism explanation:** ownership is expressed by the spending conditions in a Cell's Lock Script. The complete Type Script (`code_hash`, `hash_type`, and `args`) identifies this token and applies its validation rules; its data carries the quantity. A holder's token balance can be calculated by summing decoded amounts across matching live token Cells controlled by that holder. This run ended with one matching token Cell for each holder; aggregation across several token Cells for the same holder was not exercised.

The transfer did not change the old Cell's owner or subtract from its data in place. CKB consumes inputs and creates new outputs. The consumed token Cell contributed 1,000,000 units, which were redistributed as 123,456 units to the receiver and 876,544 units of token change. The ordinary CKB input supplied additional capacity so that two token outputs and a capacity-change output could be created. The capacity equation was checked separately from the token equation:

```text
Token units: 1,000,000 = 123,456 + 876,544
Capacity (Shannon): 4,199,988,899,998,879 - 4,199,988,899,998,015 = 864 fee
```

### How the Existing RPC Evidence Can Be Checked

**Executed and recorded:** the independent verifier used `get_transaction` for issuance and transfer, resolved every input's previous output, and queried outputs with `get_live_cell` and data included. The [saved JSON](../evidence/week-04-xudt-rpc-verification.json) records these fields and the verification checks. It is a saved verification record, not a complete node log or an unprocessed RPC transcript.

For a local node retaining this same chain, the read-only calls are:

```text
get_transaction([issuance_transaction_hash])
get_transaction([transfer_transaction_hash])
get_live_cell([{ "tx_hash": transfer_transaction_hash, "index": "0x0" }, true])
get_live_cell([{ "tx_hash": transfer_transaction_hash, "index": "0x1" }, true])
```

These are method/parameter sketches; substitute the full hashes from Section 4 and send them in JSON-RPC requests to the local proxy. Compare status and block hash, then compare each output's scripts, capacity, and data with the record. Decode the 16-byte quantities using integer arithmetic. Resolve all previous outputs before subtracting capacities. `unknown` by itself does not establish that a Cell was spent: here the transfer's exact input references establish consumption of the issuance outputs. Live states describe verification time and can change if later transactions spend the outputs.

The local runner and verifier were used during the experiment but are not included in this public repository. Full command logs and a standalone reproduction bundle remain missing.

### Connection to a Wallet Transfer

**Mechanism explanation, not an additional wallet test:** a wallet would normally present a recipient, amount, fee, and resulting balance. On CKB, it can hide the underlying Cell selection, transaction signing, token-change output, and capacity-change output. This exercise exposes those steps: the receiver's balance becomes 123,456 units because a new live token Cell with that amount is locked to the receiver.

The recorded values are raw integer units. A wallet may use token metadata to display a name, symbol, or decimal-adjusted balance; this experiment created none of that metadata. No wallet integration, wallet display behavior, multi-Cell holder balance, additional issuance, or xUDT extension behavior was tested. Those are further questions rather than verified outcomes.

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

The next stage is to consolidate these points before choosing another practical exercise. A useful documentation follow-up would be a reproducible onboarding walkthrough that explains setup requirements, verification steps, and common failure points for new builders. This is a proposed application of the work, not a completed educational resource or a measured onboarding improvement. Personal reflection remains for me to add in my own words.
