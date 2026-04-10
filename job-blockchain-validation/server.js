require('dotenv').config();
'use strict';

const express = require('express');
let mongoose = require('mongoose');

let Tx = require('ethereumjs-tx')
const Web3 = require('web3')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/sdBT';
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID || 'YOUR_INFURA_PROJECT_ID';
const ETH_NETWORK = process.env.ETH_NETWORK || 'ropsten';

// const web3 = new Web3(`https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`)
// const abi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"stop","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"owner_","type":"address"}],"name":"setOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"name_","type":"bytes32"}],"name":"setName","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"src","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"stopped","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"authority_","type":"address"}],"name":"setAuthority","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"mint","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"push","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"move","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"start","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"authority","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"src","type":"address"},{"name":"guy","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"wad","type":"uint256"}],"name":"pull","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"symbol_","type":"bytes32"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"authority","type":"address"}],"name":"LogSetAuthority","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"}],"name":"LogSetOwner","type":"event"},{"anonymous":true,"inputs":[{"indexed":true,"name":"sig","type":"bytes4"},{"indexed":true,"name":"guy","type":"address"},{"indexed":true,"name":"foo","type":"bytes32"},{"indexed":true,"name":"bar","type":"bytes32"},{"indexed":false,"name":"wad","type":"uint256"},{"indexed":false,"name":"fax","type":"bytes"}],"name":"LogNote","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"}]
// const c_address = '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2'

// ropsten-infura
const web3 = new Web3(`https://${ETH_NETWORK}.infura.io/v3/${INFURA_PROJECT_ID}`)
const abi = [{"constant": true, "inputs": [{"name": "", "type": "address"} ], "name": "purchasedContracts", "outputs": [{"name": "", "type": "uint256"} ], "payable": false, "type": "function", "stateMutability": "view"}, {"constant": false, "inputs": [{"name": "_merc", "type": "string"}, {"name": "_value", "type": "uint256"}, {"name": "from", "type": "address"} ], "name": "setContactAWB", "outputs": [], "payable": true, "type": "function", "stateMutability": "payable"}, {"inputs": [], "payable": false, "type": "constructor", "stateMutability": "nonpayable"}, {"anonymous": false, "inputs": [{"indexed": false, "name": "from", "type": "address"}, {"indexed": false, "name": "to", "type": "address"}, {"indexed": false, "name": "price", "type": "uint256"}, {"indexed": false, "name": "awb", "type": "string"} ], "name": "Transfering", "type": "event"} ];
const c_address = '0x5385A87381ECeEA6FB2bB1B33bEb138F31eDA757'

const contract = new web3.eth.Contract(abi, c_address)

// Database connections
mongoose.connect(MONGODB_URI, { useNewUrlParser: true }).then(
        () => {console.log("DB connected.")},
        err => {console.log(err)}
    );
    let db = mongoose.connection;
// loading schema
let TransCloud = require('./trans-cloud-schema');


// Constants
const PORT = 3006;
const HOST = '0.0.0.0';
let lastBlockNumber = 4721050;
// let lastBlockNumber = 6951353;

// App
const app = express();
app.get('/', (req, res) => {
  res.send('M-conbha-cv');
});

app.get('/events', (req, res) => {
  contract.getPastEvents(
    'AllEvents',
    { fromBlock: lastBlockNumber, toBlock: 'latest' },
    (err, events) => {
      res.send(events);
    });
});


app.get('/updatedTrans', (req, res) => {
  TransCloud.readTransactions((err, trans) => {
      if(err)
        console.log(err);
      else
        if(trans == null)
          res.send("No Records found");
        res.send(trans);
  }); 
});


// app.get('/events_rpc', (req, res) => {
//   const web31 = new Web3(`https://${ETH_NETWORK}.infura.io/v3/${INFURA_PROJECT_ID}`)

//   const abi1 = [{"constant": false, "inputs": [{"name": "w", "type": "string"} ], "name": "setWord", "outputs": [], "payable": false, "type": "function", "stateMutability": "nonpayable"}, {"anonymous": false, "inputs": [{"indexed": false, "name": "a", "type": "address"} ], "name": "Changed", "type": "event"}, {"constant": true, "inputs": [], "name": "getWord", "outputs": [{"name": "", "type": "string"} ], "payable": false, "type": "function", "stateMutability": "view"} ];
//   const c_address1 = '0x00FFEC79968a748919226f5B4544239cfa987f13'
//   const contract1 = new web31.eth.Contract(abi1, c_address1)


//   contract1.getPastEvents(
//     'AllEvents',
//     { fromBlock: 4701234, toBlock: 'latest' },
//     (err, events) => {
//       res.send(events);
//     });
// });





app.listen(PORT, HOST, () => {
  update_auto();
  // console.log("Skipped");
});
console.log(`Running on http://localhost:${PORT}`, 'Blockchain-Transaction Storage Server ----> UP');


function update_auto(){
  // for firstcall
  setTimeout(() => {
    TransCloud.lastBlockUpdated((err, lastTrans) => {
        if(err)
          console.log(err);
        else{
          if(lastTrans != null)
            lastBlockNumber = lastTrans.blocknumber;
          updater();
        }
    });
  }, 10000);
  // synchonized 
  setInterval(() => {
    updater();
  }, 120000);
}


function updater() {
  let ttym = new Date();
  console.log("Checking Latest Logs - " + ttym.toGMTString());
  let from_amt = "";
  contract.getPastEvents(
    'AllEvents',
    { fromBlock: lastBlockNumber, toBlock: 'latest' },
    (err, events) => {
      if(events.length > 0){
        console.log("From Block: " + events[0].blockNumber + " - To Block: " + events[events.length - 1].blockNumber);
        events.forEach((trn) => {
          if(trn.event == "Approval"){
            from_amt = trn.returnValues.spender;
          }
          else {
            from_amt = trn.returnValues.from;
          }

          let trans = {
            address: trn.address,
            blockhash: trn.blockHash,
            blocknumber: trn.blockNumber,
            trans_ts: Date.now(),
            event: trn.event,
            log_id: trn.id,
            trans_from: from_amt,
            trans_value: trn.returnValues.price,
            awb: trn.returnValues.awb,
            transactionhash: trn.transactionHash,
            transactionindex: trn.transactionIndex,
            _update: Date.now()
          }
          console.log('Timestamp for Block Number - ' + trn.blockNumber + ' is: ' + web3.eth.getBlock(trn.blockNumber).timestamp);
          // update transaction in DAAS
          TransCloud.storeTransactions(trans);
        });
        //update last blocknumber
        lastBlockNumber = events[events.length - 1].blockNumber;
        // console.log("Last Block Number: " + lastBlockNumber);
      } 
    });
}
