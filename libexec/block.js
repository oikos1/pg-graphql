const R   = require('ramda');
const lib = require('../lib/common');

let lastPip = [0, false];
let lastPep = [0, false];
let lastPer = {ray:0};

let pips = [];
let peps = [];
let pers = [];
var isSubscribed = false;

export const sync = (n) => {
   return  lib.tronWeb.trx.getBlock(n)
  .then( block => write(n, block.block_header.raw_data.timestamp))
 }

export const subscribe = () => {
  if (!isSubscribed)
  _subscribe();
  return  lib.tronWeb.trx.getBlock('latest')
  .then( block => write(block.block_header.raw_data.number, block.block_header.raw_data.timestamp))  
}

const write =  (n, timestamp) => {
  return read(n)
  .then(async (val) => {
    return {
      n: n,
      time: timestamp,
      pip: (typeof val[0] != 'undefined') ? lib.u.wad(val[0][0])  : (await lastValue(n))[0].pip,  
      pep: (typeof val[1] != 'undefined') ? lib.u.wad(val[1][0])  : (await lastValue(n))[0].pep, 
      per: (typeof val[2] != 'undefined') ? lib.u.ray(val[2].ray) : (await lastValue(n))[0].per
    }
  })
  .then(data => {
    lib.db.none(lib.sql.insertBlock, data);
  })
  .catch(e => console.log(e));
}

const read = async (n) => {
  let pip = await lib.u.getEvents(lib.addresses.pip, "LogPeek", n); 
  let pep = await lib.u.getEvents(lib.addresses.pep, "LogPeek", n); 
  let per = await lib.u.getEvents(lib.addresses.per, "LogPer",  n); 

  let _pip  =  new Object(pip.data[0]);
  let _pep  =  new Object(pep.data[0]);
  let _per  =  new Object(per.data[0]);

  let promises = [];

  if (typeof _pip["event_name"] != 'undefined' 
   && typeof _pep["event_name"] != 'undefined' 
   && typeof _per["event_name"] != 'undefined') {
      lastPip = [lib.web3.utils.toBN(_pip["result"].val).toString(), _pip["result"].flag];
      lastPep = [lib.web3.utils.toBN(_pep["result"].val).toString(), _pep["result"].flag];
      lastPer = _per["result"];
      pips.push(lastPip);
      peps.push(lastPep);
      pers.push(lastPer);
      promises[0] = lastPip; 
      promises[1] = lastPep;
      promises[2] = lastPer;  
  } else {
      promises[0] = pips[pips.length-1];
      promises[1] = peps[peps.length-1];
      promises[2] = pers[pers.length-1];
  }

  return Promise.all(promises);
}

//-----------------------------------------------
// Sync All
//-----------------------------------------------
const concurrency = 50;
const diff = (a, b) => a - b;

export const syncMissing = () => {
    lib.latestBlock.then(function (res) {
          return { from: lib.genBlock, to: res.block_header.raw_data.number }
    }).then(opts => missingBlocks(opts))
    .then(rtn => R.sort(diff, rtn.map(R.prop('n'))))
    .then(rtn => syncEach(rtn, syncMissing))
    .catch(function (err) {
      console.log(err)
    });
}

export const lastValue = (block) => {
  return getBlock(block)
  .catch(e => console.log(e));   
}

export const syncEach = (arr, f) => {
  require('bluebird').map(arr, (n) => {
    return sync(n);
  }, {concurrency: concurrency})
  .then(() => {
    if(R.isEmpty(arr)) {
      console.log('Block sync complete');
    } else {
      console.log(`Synced: ${arr[0]} - ${arr[arr.length-1]}`)
      f(arr[0]);
    }
  });
}

export const missingBlocks = (opts) => {
  let options = R.merge(opts, { limit: concurrency })
  return lib.db.any(lib.sql.missingBlocks, options )
}

const getBlock = (n) => {
  let options = { block: n, limit: 1 }
  return lib.db.any(lib.sql.priorBlocks, options)
}

const _subscribe = () => {
  isSubscribed = true; 
  setInterval(subscribe, 3000);
}
