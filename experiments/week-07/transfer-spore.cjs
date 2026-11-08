// Transfer the Week 6 Spore to the Week 4 recipient on the preserved local chain.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const evidence = name => path.resolve(__dirname, '../../evidence', name);
const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const origin = read(evidence('week-06-spore.json'));
const recipient = read(evidence('week-04-xudt-rpc-verification.json')).transfer.outputs[0].lock;
const file = evidence('week-07-spore-transfer.json');
const rpcUrl = 'http://127.0.0.1:28114';
const samePoint = (a,b) => a.tx_hash === b.tx_hash && BigInt(a.index) === BigInt(b.index);
async function rpc(method, params) {
  const response = await fetch(rpcUrl, {
    method:'POST', headers:{'content-type':'application/json'},
    body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),
    signal:AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Local RPC HTTP ${response.status}`);
  const body = await response.json();
  if (body.error) throw new Error(`${method}: ${body.error.message}`);
  return body.result;
}
const save = record => fs.writeFileSync(file, JSON.stringify(record,null,2)+'\n');
async function main() {
  const mode = process.argv[2];
  assert.ok(['--run','--verify'].includes(mode), 'Choose --run or --verify');
  const example = path.resolve(process.env.CKBUILDER_DOB_EXAMPLE || '');
  assert.ok(process.env.CKBUILDER_DOB_EXAMPLE, 'Set CKBUILDER_DOB_EXAMPLE');
  assert.ok(!process.env.NETWORK || process.env.NETWORK === 'devnet');
  const req = createRequire(path.join(example,'package.json'));
  const sdk = req('@spore-sdk/core');
  const ts = req('typescript');
  const previous = require.extensions['.ts'];
  require.extensions['.ts'] = (module, filename) => {
    assert.ok(filename.startsWith(example + path.sep));
    module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'), {
      compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true}
    }).outputText, filename);
  };
  const mint = await rpc('get_transaction',[origin.hash]);
  assert.equal(mint?.tx_status.status,'committed','Original Devnet is required');
  assert.equal(mint.tx_status.block_hash,origin.blockHash);
  assert.deepEqual(mint.transaction.outputs[origin.outputIndex],origin.output);
  let record;
  if (mode === '--run') {
    assert.ok(!fs.existsSync(file),'Saved transaction exists; use --verify');
    const old = await rpc('get_live_cell',[origin.outPoint,true]);
    assert.equal(old.status,'live');
    assert.equal(old.cell.data.content,origin.data);
    const { SPORE_CONFIG } = req('./spore-config.ts');
    for(const url of [SPORE_CONFIG.ckbNodeUrl,SPORE_CONFIG.ckbIndexerUrl]) {
      assert.ok(['http://localhost:28114','http://127.0.0.1:28114'].includes(url));
    }
    sdk.setSporeConfig(SPORE_CONFIG);
    const key = fs.readFileSync(path.join(example,'index.tsx'),'utf8').match(/useState\(\s*["'](0x[0-9a-fA-F]{64})["']\s*\)/)?.[1];
    assert.ok(key,'Official public Devnet key not found');
    const wallet = req('./helper.ts').createDefaultLockWallet(key);
    assert.deepEqual(wallet.lock,{codeHash:origin.output.lock.code_hash,hashType:origin.output.lock.hash_type,args:origin.output.lock.args});
    assert.notDeepEqual(recipient,origin.output.lock);
    const {txSkeleton,outputIndex} = await sdk.transferSpore({
      outPoint:{txHash:origin.outPoint.tx_hash,index:origin.outPoint.index},
      toLock:{codeHash:recipient.code_hash,hashType:recipient.hash_type,args:recipient.args},
      useCapacityMarginAsFee:false,fromInfos:[wallet.address],config:SPORE_CONFIG
    });
    const logger = console.log;
    let hash;
    try { console.log=()=>{}; hash=await wallet.signAndSendTransaction(txSkeleton); }
    finally { console.log=logger; }
    record={hash,outputIndex,sourceRevision:origin.sourceRevision,network:'local OffCKB Devnet',node:process.version};
    save(record);
    console.log('Submitted:',hash);
  } else record=read(file);
  require.extensions['.ts']=previous;
  let result;
  for(let i=0;i<120;i++) {
    result=await rpc('get_transaction',[record.hash]);
    if(['committed','rejected'].includes(result?.tx_status.status)) break;
    await new Promise(resolve=>setTimeout(resolve,1000));
  }
  assert.equal(result?.tx_status.status,'committed');
  const tx=result.transaction;
  assert.ok(tx.inputs.some(input=>samePoint(input.previous_output,origin.outPoint)));
  const outPoint={tx_hash:record.hash,index:'0x'+record.outputIndex.toString(16)};
  const output=tx.outputs[record.outputIndex];
  assert.deepEqual(output.lock,recipient);
  assert.deepEqual(output.type,origin.output.type);
  assert.equal(output.capacity,origin.output.capacity);
  const live=await rpc('get_live_cell',[outPoint,true]);
  assert.equal(live.status,'live');
  assert.deepEqual(live.cell.output,output);
  assert.equal(live.cell.data.content,origin.data);
  assert.equal(tx.outputs_data[record.outputIndex],origin.data);
  const old=await rpc('get_live_cell',[origin.outPoint,false]);
  assert.notEqual(old.status,'live');
  const unpacked=sdk.unpackToRawSporeData(live.cell.data.content);
  const decodedText=Buffer.from(unpacked.content.slice(2),'hex').toString('utf8');
  assert.equal(unpacked.contentType,origin.contentType);
  assert.equal(decodedText,origin.decodedText);
  const inputs=[];
  for(const input of tx.inputs) {
    const p=input.previous_output;
    const prev=await rpc('get_transaction',[p.tx_hash]);
    const i=Number(BigInt(p.index));
    inputs.push({outPoint:p,output:prev.transaction.outputs[i],data:prev.transaction.outputs_data[i]});
  }
  const sum=outputs=>outputs.reduce((total,item)=>total+BigInt(item.capacity),0n);
  const capacityIn=sum(inputs.map(i=>i.output)), capacityOut=sum(tx.outputs);
  assert.ok(capacityIn>capacityOut);
  const {hash,outputIndex,sourceRevision,network,node}=record;
  const checked={hash,outputIndex,sourceRevision,network,node,status:result.tx_status.status,
    blockHash:result.tx_status.block_hash,sporeId:output.type.args,oldOutPoint:origin.outPoint,
    oldStatus:old.status,outPoint,live:live.status,output,data:live.cell.data.content,decodedText,
    inputs,outputs:tx.outputs,outputsData:tx.outputs_data,inputCapacity:String(capacityIn),
    outputCapacity:String(capacityOut),feeShannon:String(capacityIn-capacityOut)};
  if(mode==='--run') save(checked);
  else if(record.status) assert.deepEqual(checked,record);
  else console.log(JSON.stringify(checked,null,2));
  console.log('Week 7: Spore ownership transfer');
  console.log('Transaction:',hash,checked.status,'Block:',checked.blockHash);
  console.log('Spore ID:',checked.sporeId);
  console.log('Old Cell:',checked.oldStatus,'(referenced by the committed transfer input)');
  console.log('New Cell:',outPoint.index,checked.live,'recipient lock args:',output.lock.args);
  console.log('Decoded:',decodedText);
  console.log('Capacity:',BigInt(output.capacity).toString(),'Shannon; inputs/outputs:',inputs.length+'/'+tx.outputs.length,'fee:',checked.feeShannon,'Shannon');
}
main().catch(error=>{console.error(error.name+': '+error.message.replace(/0x[0-9a-f]{64}/gi,'[32-byte value]'));process.exitCode=1;});
