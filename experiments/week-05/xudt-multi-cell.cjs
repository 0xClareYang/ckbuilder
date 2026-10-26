// Extends the official xUDT tutorial with a two-Cell transfer on local Devnet.
// No key is logged or stored. The derived learner key is public test material.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');

const RPC = 'http://127.0.0.1:28114';
const ROOT = path.resolve(__dirname, '../..');
const RESULT = path.join(ROOT, 'evidence/week-05-xudt-result.json');
const BASELINE = JSON.parse(fs.readFileSync(path.join(ROOT, 'evidence/week-04-xudt-rpc-verification.json')));
const ARGS = BASELINE.xudtArgs;
const log = message => console.log(message);
const json = value => JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2);
function save(result) { fs.writeFileSync(RESULT, json(result) + '\n'); }
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function rpc(method, params) {
  const res = await fetch(RPC, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Local RPC HTTP ${res.status}`);
  const body = await res.json();
  if (body.error) throw new Error(`${method}: ${JSON.stringify(body.error)}`);
  return body.result;
}

function amount(data) {
  assert.match(data, /^0x[0-9a-f]{32}$/i);
  return BigInt('0x' + Buffer.from(data.slice(2), 'hex').reverse().toString('hex'));
}
function ckb(value) {
  return `${value / 100000000n}.${(value % 100000000n).toString().padStart(8, '0')}`;
}
function isType(output, type) {
  return output.type?.args === type.args && output.type?.code_hash === type.code_hash && output.type?.hash_type === type.hash_type;
}

async function wait(hash) {
  for (let i = 0; i < 180; i++) {
    const tx = await rpc('get_transaction', [hash]);
    if (tx?.tx_status.status === 'committed') return tx;
    if (tx?.tx_status.status === 'rejected') throw new Error(`Transaction rejected: ${hash}`);
    await sleep(1000);
  }
  throw new Error(`Commit timeout; keep the saved transaction hash and retry verification: ${hash}`);
}

async function snapshot(type) {
  const cells = [];
  let cursor;
  do {
    const page = await rpc('get_cells', [
      { script: type, script_type: 'type', script_search_mode: 'exact', with_data: true },
      'asc', '0x64', ...(cursor ? [cursor] : []),
    ]);
    for (const cell of page.objects) {
      assert.ok(isType(cell.output, type));
      const live = await rpc('get_live_cell', [cell.out_point, true]);
      assert.equal(live.status, 'live');
      assert.equal(live.cell.data.content, cell.output_data);
      cells.push({ outPoint: cell.out_point, output: cell.output, data: cell.output_data, amount: amount(cell.output_data).toString(), live: live.status });
    }
    if (page.objects.length < 100) break;
    assert.notEqual(page.last_cursor, cursor);
    cursor = page.last_cursor;
  } while (true);
  const balances = {};
  for (const cell of cells) balances[cell.output.lock.args] = (BigInt(balances[cell.output.lock.args] || 0) + BigInt(cell.amount)).toString();
  return { cells, balances, total: cells.reduce((sum, cell) => sum + BigInt(cell.amount), 0n).toString() };
}

async function transactionEvidence(hash, type) {
  const response = await wait(hash);
  const tx = response.transaction;
  const inputs = [];
  for (const input of tx.inputs) {
    const previous = await rpc('get_transaction', [input.previous_output.tx_hash]);
    assert.ok(previous?.transaction);
    const index = Number(BigInt(input.previous_output.index));
    inputs.push({ outPoint: input.previous_output, output: previous.transaction.outputs[index], data: previous.transaction.outputs_data[index] });
  }
  const outputs = tx.outputs.map((output, i) => ({
    outPoint: { tx_hash: hash, index: `0x${i.toString(16)}` }, output, data: tx.outputs_data[i],
  }));
  const inputCapacity = inputs.reduce((sum, cell) => sum + BigInt(cell.output.capacity), 0n);
  const outputCapacity = outputs.reduce((sum, cell) => sum + BigInt(cell.output.capacity), 0n);
  const inputTokens = inputs.filter(cell => isType(cell.output, type)).reduce((sum, cell) => sum + amount(cell.data), 0n);
  const outputTokens = outputs.filter(cell => isType(cell.output, type)).reduce((sum, cell) => sum + amount(cell.data), 0n);
  assert.equal(inputTokens, outputTokens);
  assert.ok(inputCapacity > outputCapacity);
  return {
    hash, blockHash: response.tx_status.block_hash, status: response.tx_status.status,
    inputCount: inputs.length, outputCount: outputs.length,
    tokenInputCount: inputs.filter(cell => isType(cell.output, type)).length,
    tokenOutputCount: outputs.filter(cell => isType(cell.output, type)).length,
    inputCapacity: inputCapacity.toString(), outputCapacity: outputCapacity.toString(),
    inputTokens: inputTokens.toString(), outputTokens: outputTokens.toString(),
    feeShannon: (inputCapacity - outputCapacity).toString(), feeCkb: ckb(inputCapacity - outputCapacity),
    inputs, outputs,
  };
}

async function run() {
  if (fs.existsSync(RESULT)) {
    const previous = JSON.parse(fs.readFileSync(RESULT));
    if (previous.splitHash || previous.transferHash) throw new Error('A broadcast is already saved. Use --verify; do not replay transfers.');
    log('Previous preparation stopped before a broadcast; retrying setup.');
  }
  const exampleDir = process.env.CKBUILDER_EXAMPLE_DIR;
  const scriptPath = process.env.CKBUILDER_SYSTEM_SCRIPTS;
  if (!exampleDir || !scriptPath) throw new Error('Set CKBUILDER_EXAMPLE_DIR and CKBUILDER_SYSTEM_SCRIPTS; see README.');
  const requireExample = createRequire(path.join(path.resolve(exampleDir), 'package.json'));
  const { ccc } = requireExample('@ckb-ccc/core');
  const exports = JSON.parse(fs.readFileSync(scriptPath));
  const scripts = {
    [ccc.KnownScript.Secp256k1Blake160]: exports.devnet.secp256k1_blake160_sighash_all.script,
    [ccc.KnownScript.XUdt]: exports.devnet.xudt.script,
    [ccc.KnownScript.Secp256k1Multisig]: exports.devnet.secp256k1_blake160_multisig_all.script,
    [ccc.KnownScript.AnyoneCanPay]: exports.devnet.anyone_can_pay.script,
    [ccc.KnownScript.OmniLock]: exports.devnet.omnilock.script,
    [ccc.KnownScript.NervosDao]: exports.devnet.dao.script,
  };
  const client = new ccc.ClientPublicTestnet({ url: RPC, scripts });
  const week4 = await rpc('get_transaction', [BASELINE.transfer.transactionHash]);
  assert.equal(week4?.tx_status.status, 'committed', 'This exercise requires the Week 4 Devnet chain.');
  assert.equal(week4.tx_status.block_hash, BASELINE.transfer.blockHash);
  const type = week4.transaction.outputs[0].type;
  const xudtType = await ccc.Script.fromKnownScript(client, ccc.KnownScript.XUdt, ARGS);
  assert.equal(xudtType.codeHash, type.code_hash);
  const publicSource = fs.readFileSync(path.join(exampleDir, 'index.tsx'), 'utf8');
  const match = publicSource.match(/useState\('(0x[0-9a-fA-F]{64})'\)/);
  if (!match) throw new Error('Expected the official local development key in the tutorial source.');
  const issuer = new ccc.SignerCkbPrivateKey(client, match[1]);
  const issuerLock = (await issuer.getAddressObjSecp256k1()).script;
  assert.equal(issuerLock.hash() + '00000000', ARGS);
  const genesis = await rpc('get_block_hash', ['0x0']);
  // Public, deterministic local-only identity; intentionally unsuitable for real assets.
  const learnerKey = '0x' + crypto.createHash('sha256').update(`CKBuilder Week 5 local Devnet only:${genesis}`).digest('hex');
  const learner = new ccc.SignerCkbPrivateKey(client, learnerKey);
  const learnerAddress = await learner.getAddressObjSecp256k1();
  const learnerLock = learnerAddress.script;
  const before = await snapshot(type);
  assert.equal(before.total, '1000000');
  assert.equal(before.balances[issuerLock.args], '876544');
  assert.ok(!before.balances[learnerLock.args], 'Learner already has tokens; refusing another run.');
  const state = {
    network: 'local OffCKB Devnet', rpc: RPC, startedAt: new Date().toISOString(),
    sourceRevision: 'e99f8f28e311570a85455c80cac0f1b121d8f2bf',
    environment: { node: process.version, ccc: JSON.parse(fs.readFileSync(path.resolve(path.dirname(requireExample.resolve('@ckb-ccc/core')), '../package.json'))).version },
    genesis, type, issuerLockArgs: issuerLock.args, learnerLockArgs: learnerLock.args,
    learnerAddress: learnerAddress.toString(), before,
  };
  save(state);

  // Create two separate token Cells for a non-issuer plus CKB to pay its fee.
  const split = ccc.Transaction.from({
    outputs: [{ lock: learnerLock, type: xudtType }, { lock: learnerLock, type: xudtType }, { lock: learnerLock, capacity: 20000000000n }],
    outputsData: [ccc.numLeToBytes(300000n, 16), ccc.numLeToBytes(400000n, 16), '0x'],
  });
  await split.completeInputsByUdt(issuer, xudtType);
  const tokenChange = await split.getInputsUdtBalance(client, xudtType) - split.getOutputsUdtBalance(xudtType);
  assert.equal(tokenChange, 176544n);
  split.addOutput({ lock: issuerLock, type: xudtType }, ccc.numLeToBytes(tokenChange, 16));
  await split.addCellDepsOfKnownScripts(client, ccc.KnownScript.XUdt);
  await split.completeInputsByCapacity(issuer);
  await split.completeFeeBy(issuer, 1000);
  state.splitHash = await issuer.sendTransaction(split); save(state);
  log(`Split submitted: ${state.splitHash}`);
  state.split = await transactionEvidence(state.splitHash, type);
  state.afterSplit = await snapshot(type); save(state);
  const fragments = state.afterSplit.cells.filter(cell => cell.output.lock.args === learnerLock.args);
  assert.equal(fragments.length, 2);
  assert.equal(state.afterSplit.balances[learnerLock.args], '700000');
  log('Learner holds 300000 + 400000 = 700000 units in two live Cells.');

  // Neither fragment alone covers 650000; CCC must collect both token inputs.
  const transfer = ccc.Transaction.from({
    outputs: [{ lock: issuerLock, type: xudtType }],
    outputsData: [ccc.numLeToBytes(650000n, 16)],
  });
  await transfer.completeInputsByUdt(learner, xudtType);
  const change = await transfer.getInputsUdtBalance(client, xudtType) - transfer.getOutputsUdtBalance(xudtType);
  assert.equal(change, 50000n);
  transfer.addOutput({ lock: learnerLock, type: xudtType }, ccc.numLeToBytes(change, 16));
  await transfer.addCellDepsOfKnownScripts(client, ccc.KnownScript.XUdt);
  await transfer.completeInputsByCapacity(learner);
  await transfer.completeFeeBy(learner, 1000);
  state.transferHash = await learner.sendTransaction(transfer); save(state);
  log(`Multi-input transfer submitted: ${state.transferHash}`);
  state.transfer = await transactionEvidence(state.transferHash, type);
  assert.equal(state.transfer.tokenInputCount, 2);
  assert.ok(state.transfer.inputs.every(cell => cell.output.lock.args === learnerLock.args), 'Transfer must not use issuer authorization.');
  state.afterTransfer = await snapshot(type);
  assert.equal(state.afterTransfer.balances[learnerLock.args], '50000');
  assert.equal(state.afterTransfer.balances[issuerLock.args], '826544');
  assert.equal(state.afterTransfer.total, '1000000');
  state.consumedFragments = [];
  for (const fragment of fragments) {
    assert.ok(state.transfer.inputs.some(input => input.outPoint.tx_hash === fragment.outPoint.tx_hash && input.outPoint.index === fragment.outPoint.index));
    const live = await rpc('get_live_cell', [fragment.outPoint, true]);
    assert.equal(live.status, 'unknown');
    state.consumedFragments.push({ outPoint: fragment.outPoint, status: live.status, spentBy: state.transferHash });
  }
  state.finishedAt = new Date().toISOString();
  save(state);
  print(state);
}

function print(state) {
  log('CKBUILDER WEEK 5 - MULTI-CELL xUDT');
  log(`Split: ${state.split.hash} ${state.split.status}`);
  log(`Transfer: ${state.transfer.hash} ${state.transfer.status}`);
  log(`Transfer inputs/outputs: ${state.transfer.inputCount}/${state.transfer.outputCount}; token inputs: ${state.transfer.tokenInputCount}`);
  log('Two token inputs: 300000 + 400000; returned: 650000; learner change: 50000');
  log(`Issuer balance: ${state.afterTransfer.balances[state.issuerLockArgs]} in two token Cells`);
  log(`Total token units: ${state.afterTransfer.total}`);
  log(`Fees (Shannon): split=${state.split.feeShannon}; transfer=${state.transfer.feeShannon}`);
  log('Both fragments consumed; new token outputs live at snapshot time.');
}

function checkSaved() {
  const state = JSON.parse(fs.readFileSync(RESULT));
  assert.ok(state.finishedAt);
  assert.equal(state.type.args, ARGS);
  for (const record of [state.split, state.transfer]) {
    assert.equal(record.status, 'committed');
    assert.equal(record.inputs.length, record.inputCount);
    assert.equal(record.outputs.length, record.outputCount);
    const inputCapacity = record.inputs.reduce((sum, cell) => sum + BigInt(cell.output.capacity), 0n);
    const outputCapacity = record.outputs.reduce((sum, cell) => sum + BigInt(cell.output.capacity), 0n);
    assert.equal(inputCapacity.toString(), record.inputCapacity);
    assert.equal(outputCapacity.toString(), record.outputCapacity);
    assert.equal((inputCapacity - outputCapacity).toString(), record.feeShannon);
    assert.equal(ckb(inputCapacity - outputCapacity), record.feeCkb);
    const tokenInputs = record.inputs.filter(cell => isType(cell.output, state.type));
    const tokenOutputs = record.outputs.filter(cell => isType(cell.output, state.type));
    assert.equal(tokenInputs.length, record.tokenInputCount);
    assert.equal(tokenInputs.reduce((sum, cell) => sum + amount(cell.data), 0n), tokenOutputs.reduce((sum, cell) => sum + amount(cell.data), 0n));
  }
  for (const snap of [state.before, state.afterSplit, state.afterTransfer]) {
    const balances = {};
    for (const cell of snap.cells) {
      assert.ok(isType(cell.output, state.type));
      assert.equal(amount(cell.data).toString(), cell.amount);
      assert.equal(cell.live, 'live');
      balances[cell.output.lock.args] = (BigInt(balances[cell.output.lock.args] || 0) + amount(cell.data)).toString();
    }
    assert.deepEqual(balances, snap.balances);
    assert.equal(Object.values(balances).reduce((sum, n) => sum + BigInt(n), 0n), 1000000n);
  }
  const fragments = state.afterSplit.cells.filter(cell => cell.output.lock.args === state.learnerLockArgs);
  assert.deepEqual(fragments.map(cell => cell.amount).sort(), ['300000', '400000']);
  assert.equal(state.transfer.tokenInputCount, 2);
  assert.ok(state.transfer.inputs.every(cell => cell.output.lock.args === state.learnerLockArgs));
  for (const cell of fragments) assert.ok(state.transfer.inputs.some(input => input.outPoint.tx_hash === cell.outPoint.tx_hash && input.outPoint.index === cell.outPoint.index));
  assert.equal(state.afterTransfer.balances[state.learnerLockArgs], '50000');
  assert.equal(state.afterTransfer.balances[state.issuerLockArgs], '826544');
  print(state);
  log('Saved-data arithmetic and Cell-reference checks passed (offline).');
}

async function verify() {
  const state = JSON.parse(fs.readFileSync(RESULT));
  assert.ok(state.finishedAt, 'Incomplete run: inspect saved hashes before doing anything else.');
  for (const record of [state.split, state.transfer]) {
    const current = await transactionEvidence(record.hash, state.type);
    assert.deepEqual(current, record);
  }
  const current = await snapshot(state.type);
  assert.deepEqual(current, state.afterTransfer);
  print(state);
  log('Read-only RPC recheck passed.');
}

const mode = process.argv[2];
if (!['--run', '--verify', '--check-saved'].includes(mode)) {
  console.error('Usage: node xudt-multi-cell.cjs --run | --verify | --check-saved');
  process.exitCode = 1;
} else {
  Promise.resolve().then(() => mode === '--run' ? run() : mode === '--verify' ? verify() : checkSaved()).catch(error => {
    // Never dump a signer, request object, or key-bearing source on failure.
    console.error(error instanceof assert.AssertionError ? 'Assertion failed; inspect saved public evidence.' : String(error.message).replace(/0x[0-9a-f]{64}/gi, '[32-byte value]'));
    process.exitCode = 1;
  });
}
