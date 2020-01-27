const R      = require('ramda');
const lib    = require('../lib/common');
const block  = require('../libexec/block');
const gov    = require('../libexec/gov');
const cup    = require('../libexec/cup');
const newCup = require('../libexec/new-cup');


console.log("Syncing missing blocks...");

block.syncMissing();
//gov.syncMissing();
//cup.syncMissing();
//newCup.syncMissing();
