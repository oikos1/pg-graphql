import web3 from './web3'

const sha3 = (str) => {
  return web3.utils.sha3(str).substring(0,10)
};

const dict = {
  cup: {
    give: sha3('give(bytes32,address)').replace("0x",""),
    lock: sha3('lock(bytes32,uint256)').replace("0x",""),
    free: sha3('free(bytes32,uint256)').replace("0x",""),
    draw: sha3('draw(bytes32,uint256)').replace("0x",""),
    wipe: sha3('wipe(bytes32,uint256)').replace("0x",""),
    bite: sha3('bite(bytes32)').replace("0x",""),
    shut: sha3('shut(bytes32)').replace("0x",""),
    join: sha3('join(uint)').replace("0x",""),
    exit: sha3('exit(uint)').replace("0x","")    
  },
  mold: sha3('mold(bytes32,uint256)').replace("0x","")
};

const acts = Object.keys(dict).reduce((acc, key) => {
  acc[dict[key]] = key;
  return acc;
}, {});

const cupActs = Object.keys(dict.cup).reduce((acc, key) => {
  acc[dict.cup[key]] = key;
  return acc;
}, {});

const cupSigs = Object.values(dict.cup);

module.exports = {
  cupSigs: cupSigs,
  cupActs: cupActs,
  acts: acts,
  dict: dict
};
