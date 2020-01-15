require('dotenv').config();

import web3 from './web3';
import {tronWeb,tronGrid} from './tronWeb';
import {db,sql} from './db';

const utils = require('./utils');
const addresses = require('../addr.json');
const actions = require('./actions.js');
const chain = process.env.ETH_CHAIN || 'mainnet';
const labels = ["cap", "mat","tax","fee", "axe","gap"];

module.exports = {
  sql: {
    insertCup: sql('insertCup.sql'),
    insertBlock: sql('insertBlock.sql'),
    insertGov: sql('insertGov.sql'),
    priorBlocks: sql('priorBlocks.sql'),
    missingBlocks: sql('missingBlocks.sql')
  },
  db: db,
  web3: web3,
  labels: addresses["labels"].array,
  tronWeb:tronWeb,
  tronGrid:tronGrid,
  addresses: addresses["mainnet"],
  act: actions,
  u: utils,
  latestBlock: utils.getCurrentBlock(),
  genBlock: 1, //process.env.DEPLOY_BLOCK
};
