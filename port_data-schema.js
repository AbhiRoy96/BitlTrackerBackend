var mongoose = require('mongoose');

var port_data = mongoose.Schema({
    port_number:{ type: Number, required: true },
    port_name:{ type: String, required: true },
    port_country:{ type: String, required: true },
    latitude:{ type: Number, required: true },
    longitude:{ type: Number, required: true }
});


var PortData = module.exports = mongoose.model('PortData', port_data, 'portData');

// get all Countries.
module.exports.allCountryList = function(callback) {
	console.log("Requested Country List API");
	PortData.distinct("port_country" , callback);
}

module.exports.allPortInCountry = function(countryLoc, callback){
    console.log("Requested Port data");
    PortData.find({port_country: countryLoc}, callback).sort({port_name:1});

}

module.exports.portSearch = function(port_n, callback){
    console.log("Requested Port data");
    PortData.find({port_number: port_n}, callback);

}