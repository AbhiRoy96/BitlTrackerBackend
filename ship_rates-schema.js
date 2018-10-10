var mongoose = require('mongoose');

var shipRates_data = mongoose.Schema({
    CARRIER_ID: { type: Number, required: true },
    SIGN: { type: String, required: true },
    NAME: { type: String, required: true },
    ADE: { type: Number, required: true },
    ERIE: { type: Number, required: true },
    FFCO: { type: Number, required: true },
    HDL: { type: Number, required: true },
    IHWE: { type: Number, required: true },
    ODF: { type: Number, required: true },
    PAE: { type: Number, required: true },
    ULE: { type: Number, required: true },
    OTHC: { type: Number, required: true },
    OER: { type: Number, required: true },
    ADI: { type: Number, required: true },
    ERII: { type: Number, required: true },
    IHWI: { type: Number, required: true },
    IMP: { type: Number, required: true },
    PAI: { type: Number, required: true },
    ULI: { type: Number, required: true },
    DTHC: { type: Number, required: true },
    
    IBOX5: { type: Number, required: true },
    IBOX7: { type: Number, required: true },
    ST20: { type: Number, required: true },
    ST40: { type: Number, required: true },
    HQ40: { type: Number, required: true },
    REF20: { type: Number, required: true },
    REF40: { type: Number, required: true },
    CPSZ: { type: Number, required: true },
    PNMX: { type: Number, required: true },
    ULTRMX: { type: Number, required: true },
    SUPRMX: { type: Number, required: true },
    HNDMX: { type: Number, required: true },
    HNDSZ: { type: Number, required: true },
    BLKDSC: { type: Number, required: true },
    HZDC: { type: Number, required: true },
    DNGR: { type: Number, required: true },
});


var ShipRates = module.exports = mongoose.model('ShipRates', shipRates_data, 'shipRates');



// get all FCL Quotes.
module.exports.fclAllQuotes = function(callback) {
	console.log("Requested FCL All Quotes API");
	ShipRates.find({}, {CARRIER_ID:1, SIGN: 1, NAME: 1, ADE: 1, ERIE:1, FFCO:1, HDL:1, IHWE:1, ODF:1, PAE:1, ULE:1, OTHC:1, OER:1,
        ADI:1, ERII:1, IHWI:1, IMP:1, PAI:1, ULI:1, DTHC:1, ST40:1, HZDC:1, DNGR: 1}, callback);
}

// get all FCL - 20ST Quotes.
module.exports.fclAllQuotes20ST = function(callback) {
	console.log("Requested FCL All 20ST Quotes API");
	ShipRates.find({}, {CARRIER_ID:1, SIGN: 1, NAME: 1, ADE: 1, ERIE:1, FFCO:1, HDL:1, IHWE:1, ODF:1, PAE:1, ULE:1, OTHC:1, OER:1,
        ADI:1, ERII:1, IHWI:1, IMP:1, PAI:1, ULI:1, DTHC:1, ST20:1, HZDC:1, DNGR: 1}, callback);
}

// get all FCL - 40ST Quotes.
module.exports.fclAllQuotes40ST = function(callback) {
	console.log("Requested FCL All 40ST Quotes API");
	ShipRates.find({}, {CARRIER_ID:1, SIGN: 1, NAME: 1, ADE: 1, ERIE:1, FFCO:1, HDL:1, IHWE:1, ODF:1, PAE:1, ULE:1, OTHC:1, OER:1,
        ADI:1, ERII:1, IHWI:1, IMP:1, PAI:1, ULI:1, DTHC:1, ST40:1, HZDC:1, DNGR: 1}, callback);
}

// get all FCL - 40HQ Quotes.
module.exports.fclAllQuotes40HQ = function(callback) {
	console.log("Requested FCL All 40HQ Quotes API");
	ShipRates.find({}, {CARRIER_ID:1, SIGN: 1, NAME: 1, ADE: 1, ERIE:1, FFCO:1, HDL:1, IHWE:1, ODF:1, PAE:1, ULE:1, OTHC:1, OER:1,
        ADI:1, ERII:1, IHWI:1, IMP:1, PAI:1, ULI:1, DTHC:1, HQ40:1, HZDC:1, DNGR: 1}, callback);
}

// get all FCL - 20REF Quotes.
module.exports.fclAllQuotes20REF = function(callback) {
	console.log("Requested FCL All 20REF Quotes API");
	ShipRates.find({}, {CARRIER_ID:1, SIGN: 1, NAME: 1, ADE: 1, ERIE:1, FFCO:1, HDL:1, IHWE:1, ODF:1, PAE:1, ULE:1, OTHC:1, OER:1,
        ADI:1, ERII:1, IHWI:1, IMP:1, PAI:1, ULI:1, DTHC:1, REF20:1, HZDC:1, DNGR: 1}, callback);
}

// get all FCL - 40REF Quotes.
module.exports.fclAllQuotes40REF = function(callback) {
	console.log("Requested FCL All 40REF Quotes API");
	ShipRates.find({}, {CARRIER_ID:1, SIGN: 1, NAME: 1, ADE: 1, ERIE:1, FFCO:1, HDL:1, IHWE:1, ODF:1, PAE:1, ULE:1, OTHC:1, OER:1,
        ADI:1, ERII:1, IHWI:1, IMP:1, PAI:1, ULI:1, DTHC:1, REF40:1, HZDC:1, DNGR: 1}, callback);
}


// get all BULK Quotes.
module.exports.bulkAllQuotes = function(callback) {
	console.log("Requested BULK All Quotes API");
	ShipRates.find({}, {CARRIER_ID:1, SIGN: 1, NAME: 1, HDL:1, IMP:1, PNMX:1, BLKDSC:1, HZDC:1, DNGR: 1}, callback);
}

// get all BULK - HNDSZ Quotes.
module.exports.bulkAllQuotesHNDSZ = function(callback) {
	console.log("Requested BULK All HNDSZ Quotes API");
	ShipRates.find({}, {CARRIER_ID:1, SIGN: 1, NAME: 1, HDL:1, IMP:1, HNDSZ:1, BLKDSC:1, HZDC:1, DNGR: 1}, callback);
}

// get all BULK - HNDMX Quotes.
module.exports.bulkAllQuotesHNDMX = function(callback) {
	console.log("Requested BULK All HNDMX Quotes API");
	ShipRates.find({}, {CARRIER_ID:1, SIGN: 1, NAME: 1, HDL:1, IMP:1, HNDMX:1, BLKDSC:1, HZDC:1, DNGR: 1}, callback);
}

// get all BULK - SUPRMX Quotes.
module.exports.bulkAllQuotesSUPRMX = function(callback) {
	console.log("Requested BULK All SUPRMX Quotes API");
	ShipRates.find({}, {CARRIER_ID:1, SIGN: 1, NAME: 1, HDL:1, IMP:1, SUPRMX:1, BLKDSC:1, HZDC:1, DNGR: 1}, callback);
}

// get all BULK - ULTRMX Quotes.
module.exports.bulkAllQuotesULTRMX = function(callback) {
	console.log("Requested BULK All ULTRMX Quotes API");
	ShipRates.find({}, {CARRIER_ID:1, SIGN: 1, NAME: 1, HDL:1, IMP:1, ULTRMX:1, BLKDSC:1, HZDC:1, DNGR: 1}, callback);
}

// get all BULK - PNMX Quotes.
module.exports.bulkAllQuotesPNMX = function(callback) {
	console.log("Requested BULK All PNMX Quotes API");
	ShipRates.find({}, {CARRIER_ID:1, SIGN: 1, NAME: 1, HDL:1, IMP:1, PNMX:1, BLKDSC:1, HZDC:1, DNGR: 1}, callback);
}

// get all BULK - CPSZ Quotes.
module.exports.bulkAllQuotesCPSZ = function(callback) {
	console.log("Requested BULK All CPSZ Quotes API");
	ShipRates.find({}, {CARRIER_ID:1, SIGN: 1, NAME: 1, HDL:1, IMP:1, CPSZ:1, BLKDSC:1, HZDC:1, DNGR: 1}, callback);
}




// get all LCL Quotes.
module.exports.lclAllQuotes = function(callback) {
	console.log("Requested LCL All Quotes API");
	ShipRates.find({}, {CARRIER_ID:1, SIGN: 1, NAME: 1, ADE: 1, ERIE:1, FFCO:1, HDL:1, IHWE:1, ODF:1, PAE:1, ULE:1, OTHC:1, OER:1,
        ADI:1, ERII:1, IHWI:1, IMP:1, PAI:1, ULI:1, DTHC:1, IBOX7:1, HZDC:1, DNGR: 1}, callback);
}

// get all LCL - IBOX5 Quotes.
module.exports.lclAllQuotesIBOX5 = function(callback) {
	console.log("Requested LCL All IBOX5 Quotes API");
	ShipRates.find({}, {CARRIER_ID:1, SIGN: 1, NAME: 1, ADE: 1, ERIE:1, FFCO:1, HDL:1, IHWE:1, ODF:1, PAE:1, ULE:1, OTHC:1, OER:1,
        ADI:1, ERII:1, IHWI:1, IMP:1, PAI:1, ULI:1, DTHC:1, IBOX5:1, HZDC:1, DNGR: 1}, callback);
}

// get all LCL - IBOX7 Quotes.
module.exports.lclAllQuotesIBOX7 = function(callback) {
	console.log("Requested LCL All IBOX7 Quotes API");
	ShipRates.find({}, {CARRIER_ID:1, SIGN: 1, NAME: 1, ADE: 1, ERIE:1, FFCO:1, HDL:1, IHWE:1, ODF:1, PAE:1, ULE:1, OTHC:1, OER:1,
        ADI:1, ERII:1, IHWI:1, IMP:1, PAI:1, ULI:1, DTHC:1, IBOX7:1, HZDC:1, DNGR: 1}, callback);
}