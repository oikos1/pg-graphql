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
const privateKey = '15c8ffec8adcd658697baf3fa598694b10155a58a71a850e4b58d8b4dab9892b';
const _address = 'TFgbSxmBHGTSTn9SepVUAg8D5naNVWHURm';

const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);
const tronGrid = new TronGrid(tronWeb);

export  {tronWeb, tronGrid};
