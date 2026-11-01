// Local-only adaptation of the official Create a DOB example, using text/plain.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const resultPath = path.resolve(__dirname, '../../evidence/week-06-spore.json');
const message = 'CKBuilder Week 6 - Spore digital object - Clare Yang';
const rpcUrl = 'http://127.0.0.1:28114';
async function rpc(method, params) {
  const response = await fetch(rpcUrl, { method: 'POST', headers: {'content-type':'application/json'}, body: JSON.stringify({jsonrpc:'2.0',id:1,method,params}), signal: AbortSignal.timeout(15000) });
  const body = await response.json();
  if(body.error) throw new Error(`${method}: ${JSON.stringify(body.error)}`);
  return body.result;
}
const save = value => fs.writeFileSync(resultPath, JSON.stringify(value,null,2)+'\n');
async function main() {
  const example = process.env.CKBUILDER_DOB_EXAMPLE;
  if (!example) throw new Error('Set CKBUILDER_DOB_EXAMPLE to the official create-dob directory');
  assert.ok(!process.env.NETWORK || process.env.NETWORK === 'devnet');
  const req = createRequire(path.join(example,'package.json'));
  const ts = req('typescript');
  const previous = require.extensions['.ts'];
  require.extensions['.ts'] = (module, filename) => {
    assert.ok(filename.startsWith(example), 'Only compile the selected official example');
    module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}}).outputText, filename);
  };
  const { createSpore, setSporeConfig, unpackToRawSporeData } = req('@spore-sdk/core');
  const { SPORE_CONFIG } = req('./spore-config.ts');
  assert.equal(new URL(SPORE_CONFIG.ckbNodeUrl).hostname,'localhost');
  assert.equal(new URL(SPORE_CONFIG.ckbNodeUrl).port,'28114');
  setSporeConfig(SPORE_CONFIG);
  if(process.argv.includes('--run')) {
    assert.ok(!fs.existsSync(resultPath), 'Saved run exists: use --verify instead');
    const source = fs.readFileSync(path.join(example,'index.tsx'),'utf8');
    const key = source.match(/useState\(\s*["'](0x[0-9a-fA-F]{64})["']\s*\)/)?.[1];
    assert.ok(key,'Tutorial development key not found');
    const { createDefaultLockWallet } = req('./helper.ts');
    const wallet = createDefaultLockWallet(key);
    const {txSkeleton,outputIndex} = await createSpore({data:{contentType:'text/plain',content:Buffer.from(message)},toLock:wallet.lock,fromInfos:[wallet.address],config:SPORE_CONFIG});
    // The official wallet prints the entire signed transaction. Keep output concise.
    const originalLog=console.log; console.log=()=>{};
    let hash;
    try {hash=await wallet.signAndSendTransaction(txSkeleton);} finally {console.log=originalLog;}
    save({hash,outputIndex,message,sourceRevision:'e99f8f28e311570a85455c80cac0f1b121d8f2bf',node:process.version,network:'local OffCKB Devnet'});
    console.log('Submitted:',hash);
  }
  const record = JSON.parse(fs.readFileSync(resultPath));
  let response;
  for(let i=0;i<180;i++) {
    response=await rpc('get_transaction',[record.hash]);
    if(response?.tx_status.status==='committed') break;
    await new Promise(resolve=>setTimeout(resolve,1000));
  }
  assert.equal(response.tx_status.status,'committed');
  const tx=response.transaction;
  const outPoint={tx_hash:record.hash,index:'0x'+record.outputIndex.toString(16)};
  const live=await rpc('get_live_cell',[outPoint,true]);
  assert.equal(live.status,'live');
  assert.equal(live.cell.data.content,tx.outputs_data[record.outputIndex]);
  const decoded=unpackToRawSporeData(live.cell.data.content);
  assert.equal(decoded.contentType,'text/plain');
  const text=Buffer.from(decoded.content.slice(2),'hex').toString('utf8');
  assert.equal(text,message);
  const inputs=[]; let capacityIn=0n; let capacityOut=0n;
  for(const input of tx.inputs) {
    const previous=await rpc('get_transaction',[input.previous_output.tx_hash]);
    const output=previous.transaction.outputs[Number(BigInt(input.previous_output.index))];
    capacityIn+=BigInt(output.capacity);
    inputs.push({outPoint:input.previous_output,output});
  }
  for(const output of tx.outputs) capacityOut+=BigInt(output.capacity);
  const output=tx.outputs[record.outputIndex];
  const expected=SPORE_CONFIG.scripts.Spore.versions[0].script;
  assert.equal(output.type.code_hash,expected.codeHash);
  assert.equal(output.type.hash_type,expected.hashType);
  assert.match(output.type.args,/^0x[0-9a-f]{64}$/);
  const evidence={...record,status:response.tx_status.status,blockHash:response.tx_status.block_hash,outPoint,live:live.status,sporeId:output.type.args,output,data:live.cell.data.content,contentType:decoded.contentType,decodedText:text,contentHex:decoded.content,inputs,outputs:tx.outputs,outputsData:tx.outputs_data,inputCount:tx.inputs.length,outputCount:tx.outputs.length,inputCapacity:capacityIn.toString(),outputCapacity:capacityOut.toString(),feeShannon:(capacityIn-capacityOut).toString(),checkedAt:new Date().toISOString()};
  assert.ok(capacityIn>capacityOut);
  if(process.argv.includes('--run'))save(evidence);
  else {assert.equal(evidence.data,record.data);assert.equal(evidence.feeShannon,record.feeShannon);assert.equal(evidence.blockHash,record.blockHash);}
  console.log('CKBuilder Week 6 - Spore text object');
  console.log('Transaction:',record.hash,'committed');
  console.log('Block:',evidence.blockHash);
  console.log('Spore ID:',evidence.sporeId);
  console.log('Cell:',outPoint.index,'live; capacity',BigInt(output.capacity).toString(),'Shannon');
  console.log('Data:',decoded.contentType,'decoded exactly:',text);
  console.log('Inputs/outputs:',evidence.inputCount+'/'+evidence.outputCount,'fee:',evidence.feeShannon,'Shannon');
  console.log('Transaction output data matches live Cell data.');
  require.extensions['.ts']=previous;
}
main().catch(error=>{console.error(error.name+': '+error.message);process.exitCode=1;});
