const TronWeb = require('tronweb');
const TronGrid = require('trongrid');

const HttpProvider = TronWeb.providers.HttpProvider;
// Full node http endpoint
const fullNode = new HttpProvider("http://192.168.0.102:9090");
// Solidity node http endpoint
const solidityNode = new HttpProvider("http://192.168.0.102:9090");
// Contract events http endpoint
const eventServer = "http://192.168.0.102:9090";

// update with your private key here
const privateKey = '31ca7245cd48254df2d08eb9ac28cb0e941e5f9145586193655b17f51a9d6f26';
const _address = 'TEsk263pdTwFgXEC2oqCuVoxwTgGVhqrDJ'

const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
const tronGrid = new TronGrid(tronWeb);

export  {tronWeb, tronGrid};
