import BigNumber from 'bignumber.js'
import web3 from './web3'
import {tronWeb,tronGrid} from './tronWeb';

const addresses = require('../addr.json');

export const loadContract = async address => {
  return await tronWeb.contract().at(address);
};

export const getEvents = async (a, e, n) => {
  return await tronGrid.contract.getEvents(a, { "event_name": e , "block_number": n })
};

export const getCurrentBlock = () => {
  return tronWeb.trx.getCurrentBlock();
};

export const wad = (uint) => {
  return new BigNumber(uint).dividedBy(`1e18`).toNumber()
};

export const ray = (uint) => {
  return new BigNumber(uint).dividedBy(`1e27`).toNumber()
};

export const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
};

export const arg = (act, str) => {
  let val = '0x'+str.substring(26);
  switch (act) {
    case 'shut':
      return '-';
    case 'give':
      return val;
    default:
      return val;
  }
};

export const getIndex = (val) => {
  let res = [];
  const labels = addresses["labels"].array;
  let i = 0;
  labels.forEach(label => {
    val.toString().indexOf(label) > -1 ? res[i] = true : res[i] = false;
    i++;
  });
  return res;
};

export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};