var mongoose = require('mongoose');

var shipment_data = mongoose.Schema({   
    booking_id: { type: String, required: true, unique: true },
    service_id: { type: String, required: true, unique: true },
    awb: { type: String, required: true, unique: true },

    from_p: { type: String, required: true },
    to_p: { type: String, required: true },
    
    from_p_name: { type: String, required: true },
    to_p_name: { type: String, required: true },
    
    freight_services_name: { type: String, required: true },
    // freight_price: { type: String, required: true },
    
     
    freight_mode: { type: String, required: true },
    freight_services_id: { type: String, required: true },
    shipment_type: { type: String, required: true },
    shpmt_name: { type: String, required: true },
    cont_id: { type: String, required: true },

    shipmentDate: { type: Date, required: true },
    quantity: { type: String, required: true },
    quote_price: { type: Number, required: true },

    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    telephone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    
    client_payment_address: { type: String, required: true },
    booking_ts: { type: Date, required: true },
    
    transactionHash: { type: String, required: false },
    payment_ts: { type: Date, required: false },
    isSuccess: { type: Number, required: false },

    invoiceNumber: { type: String, required: false, unique: true },
    isVerified: { type: Number, required: false },
    verification_ts: { type: Date, required: false },
    isCancled: { type: Number, required: false },
});


var ShipmentData = module.exports = mongoose.model('ShipmentData', shipment_data, 'Shipments');


// getting all shipments
module.exports.allBookedShipments = (callback) => {
    console.log("All Shipments API Requested.");
    ShipmentData.find(callback);
}

module.exports.allBookedShipmentsByAdmin = (callback) => {
    console.log("All Shipments API Requested.");
    ShipmentData.find({}, {
        awb: 1,
        from_p_name: 1,
        to_p_name: 1,
        freight_services_name: 1,
        shipment_type: 1,
        shpmt_name: 1,
        cont_id: 1,
        shipmentDate: 1,
        quote_price: 1,
        first_name: 1,
        last_name: 1,
        telephone: 1,
        email: 1,
        transactionHash: 1,
        invoiceNumber: 1,
        isCancled: 1
    }, callback);
}

module.exports.allBookedShipmentsByEmail = (email, callback) => {
    console.log("All Shipments API Requested.");
    ShipmentData.find({email: email}, {
        awb: 1,
        from_p_name: 1,
        to_p_name: 1,
        freight_services_name: 1,
        shipment_type: 1,
        shpmt_name: 1,
        cont_id: 1,
        shipmentDate: 1,
        quote_price: 1,
        first_name: 1,
        last_name: 1,
        telephone: 1,
        email: 1,
        transactionHash: 1,
        invoiceNumber: 1,
        isCancled: 1
    }, callback);
}

module.exports.allBookedShipmentsByCompany = (fid, callback) => {
    console.log("All Shipments API Requested.");
    ShipmentData.find({freight_services_id: fid}, {
        awb: 1,
        from_p_name: 1,
        to_p_name: 1,
        freight_services_name: 1,
        shipment_type: 1,
        shpmt_name: 1,
        cont_id: 1,
        shipmentDate: 1,
        quote_price: 1,
        first_name: 1,
        last_name: 1,
        telephone: 1,
        email: 1,
        transactionHash: 1,
        invoiceNumber: 1,
        isCancled: 1
    }, callback);
}

// getting shipments by awb
module.exports.shipmentByAwb = (awb, callback) => {
    console.log("Shipment By AWB API Requested.");
    ShipmentData.findOne({awb: awb}, callback);
}

// getting shipments by txHash
module.exports.shipmentByTxHash = (txhash, callback) => {
    console.log("Shipment By TxHash API Requested.");
    ShipmentData.findOne({transactionHash: txhash}, callback);
}

// getting shipments by email
module.exports.shipmentByEmail = (email, callback) => {
    console.log("Shipment By User Email API Requested.");
    ShipmentData.find({email: email}, callback);
}
// by isCancled
module.exports.shipmentByisCancled = (callback) => {
    console.log("Shipment By User isCancled API Requested.");
    ShipmentData.find({isCancled: 0}, callback);
}


// by isVerified
module.exports.shipmentByisVerified = (callback) => {
    console.log("Shipment By User isVerified API Requested.");
    ShipmentData.find({isVerified: 0}, callback);
}


// creating new booking
module.exports.newShipment = (shipment) => {
    console.log("New Shipment API Requested.");
    ShipmentData.create(shipment);
}

//updating transactions
module.exports.updatePayment = function (awb, custAddr, txhash, t_stmp, scss, callback) {
    console.log("Requested Update Payment Details API");

    var query = { "awb": awb };
    var update = {
        "client_payment_address": custAddr,
        "transactionHash": txhash,
        "payment_ts": t_stmp,
        "isSuccess": scss
    };
    var options = {};
    ShipmentData.findOneAndUpdate(query, update, options, callback);
}

// updating verified transaction
module.exports.updatePaymentVerified = function (awb, invoice, t_stmp, scss, cncld, callback) {
    console.log("Requested Update Payment Details after Verification API");

    var query = { "awb": awb };
    var update = {
        "invoiceNumber": invoice,
        "isVerified": scss,
        "verification_ts": t_stmp,
        "isCancled": cncld
    };
    var options = {};
    ShipmentData.findOneAndUpdate(query, update, options, callback);
}