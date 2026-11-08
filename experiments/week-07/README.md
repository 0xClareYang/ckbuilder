# Transfer the Week 6 Spore

The runner uses the same [official example setup as Week 6](../week-06/README.md). It needs the original local OffCKB chain and the installed example dependencies. It uses the public recipient lock from the Week 4 evidence. No browser or real wallet is needed.

With the original Devnet running, use PowerShell from the learning repository root:

```powershell
$env:CKBUILDER_DOB_EXAMPLE = '<official-checkout>/examples/dApp/create-dob'
node experiments/week-07/transfer-spore.cjs --verify
```

`--verify` is read-only and compares the committed transaction, input reference, live output, unchanged data and Type Script, recipient lock, and fees with the saved evidence. It will fail if a later transaction spends the new output.

The initial run used `--run` after `npm run sync:devnet` in the official example directory. Run mode requires the original mint output to be live and refuses to broadcast when there is already saved evidence. Do not delete the evidence to replay the transfer. Only the tutorial's public Devnet signing key is used in memory.

The Spore SDK's capacity-margin fee option was disabled so a separate ordinary CKB input paid the fee. See the [saved result](../../evidence/week-07-spore-transfer.json) for the full capacity calculation and both OutPoints.
