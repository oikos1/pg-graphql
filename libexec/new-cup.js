const lib = require('../lib/common');
const R      = require('ramda');

export const sync = async (n) => {
  return lib.u.getEvents(lib.addresses.tub, "LogNewCup", n)  
  .then(logs => {
    logs.data.forEach(log => write(log) );
  }).catch(e => console.log(e));   
};

export const subscribe = async () => {
  const TUB = await lib.u.loadContract(lib.addresses.tub) ;    
  TUB.LogNewCup().watch((err, data) => {
        if (err) return console.error('Failed to bind event listener:', err);
        data["block_number"]   = data["block"];
        data["transaction_id"] = data["transaction"];
        write(data, {"data":[]});
  });
};

const write = (log) => {
  let data = {
    id: lib.web3.utils.hexToNumber(log["result"].cup),
    lad: log["result"].lad,
    ink: 0,
    art: 0,
    ire: 0,
    act: 'open',
    arg: '-',
    guy: log["result"].lad, // msg.sender
    idx: log["event_index"],
    block: log["block_number"],
    tx: log["transaction_id"]
  }
  return lib.db.none(lib.sql.insertCup, { cup: data })
  .catch(e => console.log(e));
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
      console.log('NewCup sync complete');
    } else {
      console.log(`NewCup - Synced: ${arr[0]} - ${arr[arr.length-1]}`)
      f(arr[0]);
    }
  });
};
