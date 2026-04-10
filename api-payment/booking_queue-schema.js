let mongoose = require('mongoose');

let BookingQueueSchema = new mongoose.Schema({
  booking_fingerprint: { type: String, required: true, trim: true },
  created_on: { type: Date, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  // container_category: { type: String, required: true, trim: true },
  // container_type: { type: String, required: true, trim: true },
  container_quantity: { type: Number, required: true },
  container_rate: { type: Number, required: true },
  // currency: { type: String, required: true, trim: true },

  // product_name: { type: String, required: true, trim: true },
  // cargo_category: { type: String, required: true, trim: true },
  // cargo_class: { type: String, required: true, trim: true },
  date_of_collection: { type: Date, requied: true },

  // user_id: { type: String, required: true, trim: true },
  // full_name: { type: String, required: true, trim: true },
  // last_name: { type: String, required: true, trim: true },
  // country_code: { type: String, required: true, trim: true },
  // telephone_number: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  // priority: { type: String, required: true, trim: true },
  // remarks: { type: String, required: true, trim: true },

  customer_acc_add: { type: String, required: true, trim: true },
  token: { type: String, required: true, trim: true },
  transactionhash: { type: String, required: true, trim: true },
  payout_time: { type: Date, trim: true },
  status: { type: String, required: true, trim: true },
  _update: { type: Date, required: true, trim: true }
});
  
  
let BookingCloud = module.exports = mongoose.model('BookingCloud', BookingQueueSchema, 'booking-cloud');


// stores pre-booking details
module.exports.storeTempBookings = (trans) => {
  console.log("Pruning/Storing Transaction ...");
  let booking = {
    "booking_fingerprint": trans.bFF_,
    "company": trans.cpy,
    "container_quantity": trans.con_qty,
    "container_rate": trans.cont_prc,
    "date_of_collection": trans.drc,
    "email": trans.eml,
    "customer_acc_add": 'Not Available',
    "token": trans.token,
    "status": '1001',
    "created_on": Date.now(),
    // payout_time: 
    "transactionhash": '1001',
    "_update": Date.now()
  }
  BookingCloud.create(booking).catch((err) => {
    if (err.code == 11000)
      console.log("WEEP: " + err.message);
  });  
}

// searches for perticular awbs on the cloud
module.exports.checkBookingsAWB = (awb, callback) => {
  console.log("Searching via Booking AWB Api");
  BookingCloud.findOne({booking_fingerprint: awb}, callback);
}

// search via email
module.exports.checkBookingsEmail = (email, callback) => {
  console.log("Searching via email Api");
  BookingCloud.find({email: email}, callback);
}

// search via comapany
module.exports.checkBookingsEmail = (cmp, callback) => {
  console.log("Searching via company Api");
  BookingCloud.find({company: cmp}, callback);
}

// Verifing TxHash on the cloud
module.exports.verifyHash = (awb, callback) => {
  console.log("Matching AWB with TxHash Api");
  BookingCloud.findOne({booking_fingerprint: awb}, {awb: 1, transactionhash: 1}, callback);
}


// updates { customer_acc_add, transaction hash, status } if respose is available
module.exports.updateIfTxHashRecPP = (data_, callback) => {
  console.log("Updating If TxHash Received API");
  var query = {"booking_fingerprint": data_.awb};
  var update = {
    "customer_acc_add": data_.caa,
    "transactionhash": data_.txh,
    "status": '2002',
    "_update": Date.now()
  };
  var options = {};
  Bookings.findOneAndUpdate(query, update, options, callback);
}


module.exports.updateIfTxHashRecPS = (data_, callback) => {
  console.log("Updating If TxHash Received API");
  var query = {"booking_fingerprint": data_.awb};
  var update = {
    "payout_time": data_.pots,
    "status": '3003',
    "_update": Date.now()
  };
  var options = {};
  Bookings.findOneAndUpdate(query, update, options, callback);
}


// updates found awb with - { customer_acc_add, token, status, payout_time, transactionhash, _update }
module.exports.updateIfTxHashNReceived = (data_, callback) => {
  console.log("Updating If TxHash Not Received Api");
  var query = {"booking_fingerprint": data_.awb};
  var update = {
    "customer_acc_add": data_.caa,
    "transactionhash": data_.txh,
    "payout_time": data_.pots,
    "status": '3003',
    "_update": Date.now()
  };
  var options = {};
  Bookings.findOneAndUpdate(query, update, options, callback);
}

// Delete canceled tx
module.exports.canceledTxSearch = (callback) => {
  console.log("Searching canceled Tx Api");
  BookingCloud.find({ $or: [{status:'1001'}, {status:'2002'}] }, callback);
}

module.exports.updateCanceledTx = (awb, callback) => {
  console.log("Updating If Tx has been canceled Api");
  var query = {"booking_fingerprint": awb};
  var update = {
    "transactionhash": 'No Transaction Occured',
    "status": 'canceled',
    "_update": Date.now()
  };
  var options = {};
  Bookings.findOneAndUpdate(query, update, options, callback);
}
