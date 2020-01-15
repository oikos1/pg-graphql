const request = require('request-promise');
const colors = require('colors');
const lib = require('../lib/common');

const pricefeed_Address  = 'TWnchaKo5LzZyn5GdyjaUp45UnwNzQuQDk';
const medianizer_Address = 'TSQQS98i7MUoNsVcMCx2uDDMUeC2PTpNrs';
const perFeed_Address    = 'TAxQvGo8Czb23yvM3ky193uFoCNDrN3Af9';

const _perFeed = {
    "perFeed": {
    "address":  lib.tronWeb.address.toHex(perFeed_Address),
    "abi":[{"constant":true,"inputs":[],"name":"skr","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"owner_","type":"address"}],"name":"setOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"authority_","type":"address"}],"name":"setAuthority","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"gem","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"authority","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"skr_","type":"address"},{"name":"gem_","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"ray","type":"uint256"}],"name":"LogPer","type":"event"},{"anonymous":true,"inputs":[{"indexed":true,"name":"sig","type":"bytes4"},{"indexed":true,"name":"guy","type":"address"},{"indexed":true,"name":"foo","type":"bytes32"},{"indexed":true,"name":"bar","type":"bytes32"},{"indexed":false,"name":"wad","type":"uint256"},{"indexed":false,"name":"fax","type":"bytes"}],"name":"LogNote","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"authority","type":"address"}],"name":"LogSetAuthority","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"}],"name":"LogSetOwner","type":"event"},{"constant":true,"inputs":[],"name":"pie","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"per","outputs":[{"name":"ray","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]}  
};

const perFeed = lib.tronWeb.contract(_perFeed["perFeed"].abi, perFeed_Address);

// update with your private key here
const privateKey = '31ca7245cd48254df2d08eb9ac28cb0e941e5f9145586193655b17f51a9d6f26';
const _address = 'TEsk263pdTwFgXEC2oqCuVoxwTgGVhqrDJ'


let startBlock = 0;
let lastPrice = 0;

const loadContract = async address => {
    return await lib.tronWeb.contract().at(address);
}

const getTickerPrice = () => {

    return request("https://api.coinmarketcap.com/v2/ticker/1958/", function(err, response, body) {
        if (err) return;
        // Parse price data in API response
        const json = JSON.parse(body);
        const data = json.data;
        const rank = data.rank;
        const price = data.quotes.USD.price;
        const marketCap = data.quotes.USD.market_cap;
        const vol24H = data.quotes.USD.volume_24h;
        const perChange1H = data.quotes.USD.percent_change_1h;
        const perChange1D = data.quotes.USD.percent_change_24h;
        const perChange7D = data.quotes.USD.percent_change_7d;
        //console.log(price.toString() + " - " + rank.toString() + " - " + marketCap.toString() + " - " +
        //    vol24H.toString() + " - " + perChange1H.toString() + " - " + perChange1D.toString() + " - " + perChange7D.toString())
    });

}

const sync = async () => {

    const Pricefeed = !!pricefeed_Address ? await loadContract(pricefeed_Address) : console.log("error with pricefeed"); //await deployContract('PriceFeed');
    const Medianizer = !!medianizer_Address ? await loadContract(medianizer_Address) : console.log("error with medianizer"); //await deployContract('Medianizer');
    const PerFeed = !!perFeed_Address ? await loadContract(perFeed_Address) : console.log("error with perfeed}");

    let currentBlock = await lib.tronWeb.trx.getCurrentBlock();

    console.log("startBlock", startBlock, "currentBlock", currentBlock.block_header.raw_data.number, "lastPrice", lastPrice);

    //if (currentBlock.block_header.raw_data.number > startBlock) {
        /*Pricefeed.post( web3.utils.toWei("0.0132555"), "1591994899", tronWeb.address.toHex(medianizer_Address)).send({
                shouldPollResponse: true,
                callValue: 0, 
                from : _address
            }).then().catch(function (err) {
                console.log(err)
        });*/
        PerFeed.per().send({
                shouldPollResponse: false,
                callValue: 0, 
                from : _address
            }).catch(function (err) {
                console.log(err)
        });

        getTickerPrice().then(function(result) {
            if (lastPrice != JSON.parse(result).data.quotes.USD.price) {
                console.log("price has changed, was", lastPrice, "now", JSON.parse(result).data.quotes.USD.price);
                lastPrice = JSON.parse(result).data.quotes.USD.price;
                Pricefeed.post(lib.web3.utils.toWei((JSON.parse(result).data.quotes.USD.price).toString()), "1591994899", lib.tronWeb.address.toHex(medianizer_Address)).send({
                    shouldPollResponse: true,
                    callValue: 0,
                    from: _address
                }).then().catch(function(err) {
                    console.log(err)
                });
            }
        });



    //}
};


lib.latestBlock.then(res => {

    startBlock = res.block_header.raw_data.number;

    //getTickerPrice().then(function(result) {
        //console.log("price is " , JSON.parse(result).data.quotes.USD.price);
        //lastPrice = JSON.parse(result).data.quotes.USD.price;
    //});

    setInterval(sync, 3000);

}).catch(e => {
    if (e) {
        console.log("error", e);
        return;
    }
});