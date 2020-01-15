const R   = require('ramda');
const lib = require('../lib/common');

export const sync = async (n) => {
  return lib.u.getEvents(lib.addresses.tub, "LogNote", n)   
  .then(logs => {
    logs.data.forEach(log => write(log, logs));
  }).catch(e => console.log(e));   
};

export const subscribe = async () => {
  const TUB = await lib.u.loadContract(lib.addresses.tub) ;    
  TUB.LogNote().watch({filters: {"sig": lib.act.dict.mold}}, (err, data) => {
        if (err) return console.error('Failed to bind event listener:', err);
        data["block_number"]   = data["block"];
        data["transaction_id"] = data["transaction"];
        write(data, {"data":[]});
  });
};

const write = (log, data) => {
  if (!log["result"].sig == lib.act.dict.mold) 
    return
  else 
    return read(data).then(values => {
    let parameter = lib.web3.utils.toAscii("0x" + log["result"].foo);   
    let index     = lib.u.getIndex(parameter).indexOf(true);
    if (index  == -1) {
      index = 0;
      lib.labels[0] = 0;
    }
    return {
      block: log["block_number"],
         tx: log["transaction_id"],
        var: lib.labels[index],
        arg: lib.u.wad("0x"+ log["result"].bar),
        guy: log["result"].guy.replace("0x", "41"),
        cap: lib.u.wad(values[0]),
        mat: lib.u.ray(values[1]),
        tax: lib.u.ray(values[2]),
        fee: lib.u.ray(values[3]),
        axe: lib.u.ray(values[4]),
        gap: lib.u.wad(values[5])
    }
  }).then(data => {
    lib.db.none(lib.sql.insertGov, data);
  }).catch(e => console.log(e));

};

const read = async (logs) => {
  const p = [0,0,0,0,0,0];
  if (logs.data.length > 0) {
      logs.data.forEach(log => {
        let parameter = lib.web3.utils.toAscii("0x" + log["result"].foo);   
        let value     = lib.web3.utils.toBN("0x"+ log["result"].bar);
        let index     = lib.u.getIndex(parameter).indexOf(true);
        if (index  > -1) {
          p[index] = value;
        }          
      });  
  }
  return Promise.all(p);
};

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
};

export const missingBlocks = (opts) => {
  let options = R.merge(opts, { limit: concurrency })
  return lib.db.any(lib.sql.missingBlocks, options )
};

export const syncEach = (arr, f) => {
  require('bluebird').map(arr, (n) => {
    return sync(n);
  }, {concurrency: concurrency})
  .then(() => {
    if(R.isEmpty(arr)) {
      console.log('Gov sync complete');
    } else {
      console.log(`Gov - Synced: ${arr[0]} - ${arr[arr.length-1]}`)
      f(arr[0]);
    }
  });
};
