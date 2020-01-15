const R      = require('ramda');
const lib = require('../lib/common');

export const sync = async (n) => {
  return lib.u.getEvents(lib.addresses.tub, "LogNote", n)  
  .then(logs => {
    logs.data.forEach(log => write(log) );
  }).catch(e => console.log(e));   
};

export const subscribe = async () => {
  const TUB = await lib.u.loadContract(lib.addresses.tub) ;   
  var i=0;
  lib.act.cupSigs.forEach(sig => {
    TUB.LogNote().watch({filters: {"sig": lib.act.cupSigs[i]}}, (err, data) => {
          if (err) return console.error('Failed to bind event listener:', err);
          data["block_number"]   = data["block"];
          data["transaction_id"] = data["transaction"];
          write(data, {"data":[]});
    }); 
    i++;     
  });
};

const read = async (log) => {
  let act = lib.act.cupActs[log["result"].sig];
  let r = [];
    await lib.u.asyncForEach(Object.entries(lib.act.dict.cup), async (data) => {
      return await lib.u.getEvents(lib.addresses.tub, lib.u.capitalize(data[0]), log["block_number"] )
      .then(cups => {
        cups.data.forEach(cup => {
          r = push(cup, log, act, r);
        });
      })
    });
    if (r.length > 0){
      return r;
    }  
};

const write = (log) => {
  let act = lib.act.cupActs[log["result"].sig];
  if(act) {
    return read(log)
    .then(data => {
        data.forEach(c => {
          lib.db.none(lib.sql.insertCup, { cup: c })
        });        
    })
    .catch(e => {
      console.log(e)
      console.log(lib.act.cupActs[log["result"].sig])
      console.log(log)
    });
  }
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
      console.log('Cup sync complete');
    } else {
      console.log(`Cup - Synced: ${arr[0]} - ${arr[arr.length-1]}`)
      f(arr[0]);
    }
  });
};

const push = (cup, log, act, arr) => {
      arr.push({
        id: lib.web3.utils.hexToNumber(cup["result"].cup),
        lad: cup["result"].lad.replace("0x", "41"),
        ink: cup["result"].ink,
        art: cup["result"].art,
        ire: cup["result"].ire,
        act: act,
        arg: lib.u.arg(act, log["result"].bar), 
        guy: 0, //log.returnValues.guy, // msg.sender
        idx: cup["event_index"],
        block: cup["block_number"],
        tx: cup["transaction_id"]
      });
    return arr;
};

