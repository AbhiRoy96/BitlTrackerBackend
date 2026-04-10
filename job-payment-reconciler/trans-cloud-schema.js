let mongoose = require('mongoose');

let TransCloudSchema = new mongoose.Schema({
    address: { type: String, required: true, trim: true },
    blockhash: { type: String, required: true, trim: true },
    blocknumber: { type: Number, required: true},
    event: { type: String, required: true, trim: true },
    log_id: { type: String, unique: true, required: true},
    trans_ts: { type: Date, required: true, trim: true },
    trans_from: { type: String, required: true, trim: true },
    trans_value: { type: String, required: true, trim: true },
    awb: { type: String, required: true, trim: true },
    transactionhash: { type: String, required: true, trim: true },
    transactionindex: { type: Number, required: true },    
    _update: { type: Date, required: true, trim: true }
  });
  
  
let TransCloud = module.exports = mongoose.model('TransCloud', TransCloudSchema, 'trans-cloud');

module.exports.storeTransactions = (trans) => {
  console.log("Pruning/Storing Transaction ...");
  TransCloud.create(trans).catch((err) => {
    if(err.code !== 11000)
      console.log("WEEP: " + err.message);
  });  
}


module.exports.readTransactions = (callback) => {
  console.log("Get Transactions Api");
  TransCloud.find(callback);
}


module.exports.lastBlockUpdated = (callback) => {
  console.log("Checking Last DB Transaction ...");
  TransCloud.findOne(callback).sort({ _id: -1 }).limit(1);
}


module.exports.searchTransActions = (awb, callback) => {
  console.log("Searching AWB, txhash API ...");
  TransCloud.findOne({awb: awb}, callback);
}
